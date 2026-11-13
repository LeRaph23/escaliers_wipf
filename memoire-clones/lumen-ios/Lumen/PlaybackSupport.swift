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

    /// Configuration WKWebView : lecture inline, PiP et AirPlay (image + son) autorisés.
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
        // Hygiène de sécurité : AUCUN script injecté sur les pages d'authentification. Une app-navigateur peut
        // techniquement lire tout ce qui est saisi dans ses pages (mots de passe compris) : c'est le risque n°1
        // de cette catégorie d'apps, et la raison pour laquelle on s'abstient ici explicitement.
        let keepAlive = WKUserScript(source: """
            (() => {
            const authHosts = /(^|\\.)(accounts\\.google\\.com|accounts\\.youtube\\.com|appleid\\.apple\\.com|login\\.live\\.com|login\\.microsoftonline\\.com)$/;
            if (authHosts.test(location.hostname)) return;
            Object.defineProperty(document, 'hidden', { get: () => false });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
            document.addEventListener('visibilitychange', e => e.stopImmediatePropagation(), true);
            // Note : plus aucun observateur de la page ici. L'ancien script AirPlay surveillait chaque
            // modification du DOM de YouTube (qui change en continu pendant la lecture) et faisait ramer
            // l'app ; l'AirPlay image + son passe désormais par le lecteur natif (« Sur la télé »).
            })();
            """, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        config.userContentController.addUserScript(keepAlive)
        return config
    }
}
