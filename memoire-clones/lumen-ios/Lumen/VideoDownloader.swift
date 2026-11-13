import Foundation
import AVFoundation
import Photos
import YouTubeKit

/// Téléchargement natif d'une vidéo YouTube vers Photos (démonstration de reproductibilité,
/// usage personnel uniquement — contraire aux CGU de YouTube, ne pas distribuer).
///
/// Chaîne : YouTubeKit (bibliothèque open source) liste les flux → téléchargement de la meilleure
/// vidéo H.264/MP4 ≤ 1080p et du meilleur audio M4A, par morceaux de 10 Mo avec nouvelles tentatives
/// (parade aux coupures HTTP 403 sur les longues requêtes) → fusion AVFoundation sans réencodage
/// → enregistrement dans Photos.
@MainActor
final class VideoDownloader: ObservableObject {
    enum Phase: Equatable {
        case idle, analyzing, video(Double), audio(Double), merging, saving, done
        case failed(String)
    }

    /// Destination du fichier HD : la photothèque, ou la lecture sur la télé (AirPlay 1080p).
    enum Purpose { case photos, tv }

    @Published var phase: Phase = .idle
    @Published private(set) var title = ""
    @Published private(set) var purpose: Purpose = .photos
    /// Fichier 1080p prêt à être lu sur la télé (mode .tv).
    @Published var tvFile: URL?
    private var task: Task<Void, Never>?

    var isActive: Bool {
        switch phase {
        case .idle, .done, .failed: return false
        default: return true
        }
    }

    func start(videoID: String, title: String, purpose: Purpose = .photos) {
        guard !isActive else { return }
        self.title = title
        self.purpose = purpose
        phase = .analyzing
        task = Task {
            do {
                try await run(videoID: videoID)
            } catch {
                phase = .failed(Task.isCancelled ? "téléchargement annulé." : error.localizedDescription)
            }
        }
    }

    func cancel() { task?.cancel() }
    func dismiss() { if !isActive { phase = .idle } }

    private func run(videoID: String) async throws {
        // .local : extraction sur l'appareil ; .remote : repli via le serveur de l'auteur de YouTubeKit.
        let streams = try await YouTube(videoID: videoID, methods: [.local, .remote]).streams
        let fm = FileManager.default
        let tmp = fm.temporaryDirectory
        let out = tmp.appendingPathComponent("lumen-\(videoID).mp4")
        try? fm.removeItem(at: out)

        let bestVideo = streams.filterVideoOnly()
            .filter { $0.isNativelyPlayable && $0.fileExtension == .mp4 && ($0.videoResolution ?? 0) <= 1080 }
            .highestResolutionStream()
        let bestAudio = streams.filterAudioOnly()
            .filter { $0.fileExtension == .m4a }
            .highestAudioBitrateStream()

        if let v = bestVideo, let a = bestAudio {
            let vURL = tmp.appendingPathComponent("lumen-v-\(videoID).mp4")
            let aURL = tmp.appendingPathComponent("lumen-a-\(videoID).m4a")
            defer { try? fm.removeItem(at: vURL); try? fm.removeItem(at: aURL) }
            try await ChunkedDownloader.download(v.url, to: vURL) { self.phase = .video($0) }
            try await ChunkedDownloader.download(a.url, to: aURL) { self.phase = .audio($0) }
            phase = .merging
            try await Self.merge(video: vURL, audio: aURL, to: out)
        } else if let both = streams.filterVideoAndAudio().filter({ $0.isNativelyPlayable }).highestResolutionStream() {
            // Repli : flux unique vidéo + audio (souvent limité à 360p).
            try await ChunkedDownloader.download(both.url, to: out) { self.phase = .video($0) }
        } else {
            throw DownloadError.noStream
        }

        switch purpose {
        case .photos:
            phase = .saving
            try await Self.saveToPhotos(out)
            try? fm.removeItem(at: out)
            phase = .done
        case .tv:
            // Gardé en cache le temps de la lecture ; supprimé à la fermeture du lecteur.
            let dest = fm.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent("lumen-tv.mp4")
            try? fm.removeItem(at: dest)
            try fm.moveItem(at: out, to: dest)
            phase = .done
            tvFile = dest
        }
    }

    /// Assemble la piste vidéo et la piste audio dans un MP4, sans réencodage (passthrough).
    private static func merge(video: URL, audio: URL, to out: URL) async throws {
        let comp = AVMutableComposition()
        let vAsset = AVURLAsset(url: video)
        let aAsset = AVURLAsset(url: audio)
        guard let vSrc = try await vAsset.loadTracks(withMediaType: .video).first,
              let aSrc = try await aAsset.loadTracks(withMediaType: .audio).first,
              let vDst = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
              let aDst = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)
        else { throw DownloadError.merge }

        let vDuration = try await vAsset.load(.duration)
        let aDuration = try await aAsset.load(.duration)
        let duration = CMTimeMinimum(vDuration, aDuration)
        let range = CMTimeRange(start: .zero, duration: duration)
        try vDst.insertTimeRange(range, of: vSrc, at: .zero)
        try aDst.insertTimeRange(range, of: aSrc, at: .zero)
        vDst.preferredTransform = try await vSrc.load(.preferredTransform)

        guard let export = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetPassthrough) else {
            throw DownloadError.merge
        }
        export.outputURL = out
        export.outputFileType = .mp4
        await export.export()
        guard export.status == .completed else { throw export.error ?? (DownloadError.merge as Error) }
    }

    private static func saveToPhotos(_ file: URL) async throws {
        let status = await PHPhotoLibrary.requestAuthorization(for: .addOnly)
        guard status == .authorized || status == .limited else { throw DownloadError.photos }
        try await PHPhotoLibrary.shared().performChanges {
            _ = PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: file)
        }
    }
}

/// Télécharge un fichier par plages de 10 Mo (en-tête Range), avec 5 tentatives par plage.
enum ChunkedDownloader {
    static let chunkSize: Int64 = 10 * 1024 * 1024

    static func download(_ url: URL, to dest: URL, progress: @escaping @MainActor (Double) -> Void) async throws {
        let fm = FileManager.default
        try? fm.removeItem(at: dest)
        fm.createFile(atPath: dest.path, contents: nil)
        let handle = try FileHandle(forWritingTo: dest)
        defer { try? handle.close() }

        var offset: Int64 = 0
        var total: Int64?
        while total == nil || offset < total! {
            try Task.checkCancellation()
            var request = URLRequest(url: url)
            request.setValue("bytes=\(offset)-\(offset + chunkSize - 1)", forHTTPHeaderField: "Range")

            var chunk = Data()
            var response: HTTPURLResponse?
            var lastError: Error?
            for attempt in 1...5 {
                do {
                    let (data, r) = try await URLSession.shared.data(for: request)
                    guard let http = r as? HTTPURLResponse else { throw DownloadError.http(-1) }
                    guard (200...299).contains(http.statusCode) else { throw DownloadError.http(http.statusCode) }
                    chunk = data; response = http; lastError = nil
                    break
                } catch {
                    lastError = error
                    try Task.checkCancellation()
                    try await Task.sleep(nanoseconds: UInt64(attempt) * 700_000_000)
                }
            }
            if let lastError { throw lastError }
            guard let http = response else { throw DownloadError.http(-1) }

            if total == nil {
                // « Content-Range: bytes 0-10485759/123456789 » → taille totale.
                if let cr = http.value(forHTTPHeaderField: "Content-Range"),
                   let slash = cr.lastIndex(of: "/"),
                   let t = Int64(cr[cr.index(after: slash)...]) {
                    total = t
                } else {
                    total = Int64(chunk.count) // le serveur a ignoré Range : fichier complet d'un coup
                }
            }
            if chunk.isEmpty { break }
            try handle.write(contentsOf: chunk)
            offset += Int64(chunk.count)
            await progress(min(1, Double(offset) / Double(max(total ?? 1, 1))))
        }
    }
}

enum DownloadError: LocalizedError {
    case noStream, merge, photos, http(Int)

    var errorDescription: String? {
        switch self {
        case .noStream: return "aucun flux compatible trouvé pour cette vidéo."
        case .merge: return "l'assemblage vidéo + audio a échoué."
        case .photos: return "accès à Photos refusé (Réglages › Lumen › Photos)."
        case .http(let code): return "le serveur a refusé le téléchargement (HTTP \(code))."
        }
    }
}
