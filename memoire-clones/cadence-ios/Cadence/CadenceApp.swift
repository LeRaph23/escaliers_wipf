import SwiftUI
import AVFoundation

/// Cadence natif : enveloppe iOS de l'app web Cadence (lecteur musical adossé à YouTube).
/// L'interface est le bundle web embarqué (dossier `cadence-pwa`), chargé localement depuis l'app.
/// Clean-room : aucun code ni ressource de l'app d'origine.
@main
struct CadenceApp: App {
    init() {
        // Session audio « lecture » : permet la lecture écran verrouillé / en arrière-plan.
        // Prérequis Info.plist : UIBackgroundModes = [audio].
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, mode: .moviePlayback, policy: .longFormVideo)
        try? session.setActive(true)
    }

    var body: some Scene {
        WindowGroup {
            CadenceWebView()
                .ignoresSafeArea()
                .preferredColorScheme(nil) // suit le thème système (clair/sombre)
        }
    }
}
