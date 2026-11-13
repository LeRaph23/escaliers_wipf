import SwiftUI
import AVKit

/// « Lire sur la télé » en 1080p.
///
/// Le site mobile de YouTube joue ses vidéos via Media Source Extensions : iOS ne peut pas les envoyer
/// en AirPlay (seul le son part). Et chez YouTube, la 1080p n'existe qu'en pistes vidéo et audio séparées,
/// qu'AirPlay ne sait pas relire telles quelles. On prépare donc d'abord un MP4 1080p complet
/// (VideoDownloader, mode .tv), puis on le lit dans le lecteur natif d'iOS : l'iPhone le diffuse
/// en AirPlay, image + son, en pleine qualité.
@MainActor
final class TVPlayback: ObservableObject {
    @Published private(set) var player: AVPlayer?
    private var file: URL?

    func play(file: URL) {
        // Arrête une éventuelle lecture précédente sans effacer le nouveau fichier (même chemin en cache).
        player?.pause()
        player = nil
        if let old = self.file, old != file { try? FileManager.default.removeItem(at: old) }
        self.file = file
        let p = AVPlayer(url: file)
        p.allowsExternalPlayback = true
        player = p
        p.play()
    }

    func close() {
        player?.pause()
        player = nil
        if let file { try? FileManager.default.removeItem(at: file) }
        file = nil
    }
}

/// Lecteur plein écran d'iOS, avec son propre bouton AirPlay.
struct NativePlayerView: UIViewControllerRepresentable {
    let player: AVPlayer

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let vc = AVPlayerViewController()
        vc.player = player
        vc.allowsPictureInPicturePlayback = true
        return vc
    }

    func updateUIViewController(_ vc: AVPlayerViewController, context: Context) {
        if vc.player !== player { vc.player = player }
    }
}
