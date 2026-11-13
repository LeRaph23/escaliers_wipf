import SwiftUI

/// Une vidéo téléchargée, gardée dans l'app (pas dans Photos).
struct DownloadedVideo: Codable, Identifiable, Hashable {
    let id: String          // identifiant YouTube
    var title: String
    var date: Date
    var fileName: String
    var bytes: Int64
}

/// Bibliothèque « Téléchargements » : fichiers MP4 dans Documents/Téléchargements
/// (visibles aussi dans l'app Fichiers › Sur mon iPhone › Lumen).
@MainActor
final class DownloadsStore: ObservableObject {
    @Published private(set) var items: [DownloadedVideo] = []

    static let folder: URL = {
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Téléchargements", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()
    private static var indexURL: URL { folder.appendingPathComponent(".index.json") }

    init() { load() }

    func url(for item: DownloadedVideo) -> URL { Self.folder.appendingPathComponent(item.fileName) }

    /// Range le fichier téléchargé dans la bibliothèque (remplace une ancienne version de la même vidéo).
    func add(file: URL, videoID: String, title: String) throws {
        let fm = FileManager.default
        if let old = items.first(where: { $0.id == videoID }) { try? fm.removeItem(at: url(for: old)) }
        let name = "\(Self.sanitize(title)) [\(videoID)].mp4"
        let dest = Self.folder.appendingPathComponent(name)
        try? fm.removeItem(at: dest)
        try fm.moveItem(at: file, to: dest)
        let size = ((try? fm.attributesOfItem(atPath: dest.path))?[.size] as? NSNumber)?.int64Value ?? 0
        items.removeAll { $0.id == videoID }
        items.insert(DownloadedVideo(id: videoID, title: title, date: Date(), fileName: name, bytes: size), at: 0)
        save()
    }

    func delete(_ item: DownloadedVideo) {
        try? FileManager.default.removeItem(at: url(for: item))
        items.removeAll { $0.id == item.id }
        save()
    }

    private func load() {
        guard let data = try? Data(contentsOf: Self.indexURL),
              let saved = try? JSONDecoder().decode([DownloadedVideo].self, from: data) else { return }
        // Ignore les entrées dont le fichier a été supprimé (par ex. depuis l'app Fichiers).
        items = saved.filter { FileManager.default.fileExists(atPath: url(for: $0).path) }
    }

    private func save() {
        if let data = try? JSONEncoder().encode(items) { try? data.write(to: Self.indexURL, options: .atomic) }
    }

    private static func sanitize(_ title: String) -> String {
        let bad = CharacterSet(charactersIn: "/\\:?%*|\"<>")
        let cleaned = title.components(separatedBy: bad).joined(separator: "-")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return String((cleaned.isEmpty ? "Vidéo" : cleaned).prefix(80))
    }
}

/// Liste des vidéos téléchargées : lecture (et AirPlay 1080p immédiat), suppression.
struct DownloadsView: View {
    @EnvironmentObject var downloads: DownloadsStore
    @EnvironmentObject var tv: TVPlayback
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        List {
            if downloads.items.isEmpty {
                Text("Aucune vidéo téléchargée. Ouvre une vidéo YouTube et touche « Télécharger » en bas.")
                    .foregroundStyle(.secondary)
            }
            ForEach(downloads.items) { item in
                Button {
                    let file = downloads.url(for: item)
                    dismiss()
                    // Laisse la feuille se fermer avant d'ouvrir le lecteur plein écran.
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                        tv.play(file: file, deleteOnClose: false)
                    }
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "play.rectangle.fill").font(.title2).foregroundStyle(.tint)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.title).lineLimit(2)
                            Text("\(item.date.formatted(date: .abbreviated, time: .shortened)) · \(ByteCountFormatter.string(fromByteCount: item.bytes, countStyle: .file))")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .onDelete { offsets in offsets.map { downloads.items[$0] }.forEach(downloads.delete) }
        }
        .navigationTitle("Mes vidéos")
    }
}
