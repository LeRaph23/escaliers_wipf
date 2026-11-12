import SwiftUI
import AVFoundation

/// Point d'entrée. Équivalent fonctionnel « navigateur vidéo avec bloqueur de pub ».
/// Réimplémentation clean-room : aucune ressource ni code de l'app d'origine.
@main
struct LumenApp: App {
    @StateObject private var browser = BrowserModel()
    @StateObject private var store = PremiumStore()

    init() {
        PlaybackSupport.configureAudioSession()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(browser)
                .environmentObject(store)
                .task { await browser.loadBlocker() }
                .task { await store.refresh() }
        }
    }
}
