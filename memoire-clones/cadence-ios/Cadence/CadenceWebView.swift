import SwiftUI
import WebKit

/// Charge l'interface web embarquée (dossier `cadence-pwa` ajouté comme référence de dossier au bundle).
struct CadenceWebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.allowsPictureInPictureMediaPlayback = true
        config.allowsAirPlayForMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.websiteDataStore = .default() // persiste la bibliothèque (localStorage)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsLinkPreview = false
        if #available(iOS 16.4, *) { webView.isInspectable = true } // débogage via Safari (Mac)

        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "cadence-pwa") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            let html = "<h2 style='font-family:-apple-system;padding:24px'>Ressources web introuvables.<br>Vérifie que le dossier <code>cadence-pwa</code> est bien référencé dans le projet.</h2>"
            webView.loadHTMLString(html, baseURL: nil)
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
