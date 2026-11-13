import SwiftUI
import AVKit
import YouTubeKit

/// « Lire sur la télé » : rejoue la vidéo YouTube affichée dans le lecteur natif d'iOS (AVPlayer),
/// qui sait envoyer image + son en AirPlay.
///
/// Pourquoi c'est nécessaire : le site mobile de YouTube joue ses vidéos via Media Source Extensions
/// (des morceaux assemblés dans la page). iOS ne peut pas transmettre ce type de vidéo en AirPlay :
/// seule la sortie audio de l'app part vers la télé. Le lecteur natif, lui, lit une URL de flux que
/// l'Apple TV / la télé AirPlay récupère directement.
@MainActor
final class TVPlayback: ObservableObject {
    @Published private(set) var player: AVPlayer?
    @Published private(set) var loading = false

    func open(videoID: String, onError: @escaping (String) -> Void) {
        guard !loading else { return }
        loading = true
        Task {
            defer { loading = false }
            do {
                let streams = try await YouTube(videoID: videoID, methods: [.local, .remote]).streams
                // Flux unique vidéo + audio : c'est ce qu'AirPlay sait lire directement.
                guard let stream = streams.filterVideoAndAudio()
                    .filter({ $0.isNativelyPlayable })
                    .highestResolutionStream()
                else { throw DownloadError.noStream }
                let p = AVPlayer(url: stream.url)
                p.allowsExternalPlayback = true
                player = p
                p.play()
            } catch {
                onError("Lecture impossible : \(error.localizedDescription)")
            }
        }
    }

    func close() {
        player?.pause()
        player = nil
    }
}

/// Lecteur plein écran d'iOS, avec son propre bouton AirPlay et l'image en plein écran.
struct NativePlayerView: UIViewControllerRepresentable {
    let player: AVPlayer

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let vc = AVPlayerViewController()
        vc.player = player
        vc.allowsPictureInPicturePlayback = true
        vc.canStartPictureInPictureAutomaticallyFromInline = true
        return vc
    }

    func updateUIViewController(_ vc: AVPlayerViewController, context: Context) {
        if vc.player !== player { vc.player = player }
    }
}
