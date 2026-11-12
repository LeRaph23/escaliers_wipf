import AVFoundation
import WebKit

/// Ce qui permet la lecture en arrière-plan, le PiP et AirPlay.
/// Prérequis Info.plist : UIBackgroundModes = [audio].
enum PlaybackSupport {
    /// La catégorie `.playback` fait continuer l'audio écran verrouillé.
    static func configureAudioSession() {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.playback, mode: .moviePlayback, policy: .longFormVideo)
            try session.setActive(true)
        } catch {
            print("AudioSession: \(error)")
        }
    }

    /// Configuration WKWebView : lecture inline, PiP et AirPlay autorisés.
    static func makeConfiguration(blocker: WKContentRuleList?) -> WKWebViewConfiguration {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.allowsPictureInPictureMediaPlayback = true
        config.allowsAirPlayForMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.websiteDataStore = .default()
        if let blocker { config.userContentController.add(blocker) }
        // Les sites mettent souvent en pause sur `visibilitychange` : on masque l'état
        // « hidden » pour que la lecture survive au passage en arrière-plan.
        let keepAlive = WKUserScript(source: """
            Object.defineProperty(document, 'hidden', { get: () => false });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
            document.addEventListener('visibilitychange', e => e.stopImmediatePropagation(), true);
            """, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        config.userContentController.addUserScript(keepAlive)
        return config
    }
}
