import SwiftUI
import UIKit
import WebKit

struct Bookmark: Codable, Identifiable, Hashable {
    var id = UUID()
    var title: String
    var url: URL
}

/// État du navigateur : barre d'adresse, historique, favoris (persistés en UserDefaults).
@MainActor
final class BrowserModel: NSObject, ObservableObject, WKNavigationDelegate {
    @Published var addressText = ""
    @Published var title = ""
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var progress: Double = 0
    @Published var blockerEnabled = true
    @Published var bookmarks: [Bookmark] = [] { didSet { saveBookmarks() } }

    private(set) var webView: WKWebView?
    private var blocker: WKContentRuleList?
    private var observers: [NSKeyValueObservation] = []

    /// Page ouverte au lancement de l'app.
    static let homeURL = URL(string: "https://m.youtube.com")!

    static let defaultSites: [Bookmark] = [
        // Connexion, historique, recommandations : fournis par le site lui-même, pas par l'app.
        Bookmark(title: "YouTube", url: URL(string: "https://m.youtube.com")!),
        Bookmark(title: "Vimeo", url: URL(string: "https://vimeo.com")!),
        Bookmark(title: "Dailymotion", url: URL(string: "https://www.dailymotion.com")!),
        Bookmark(title: "Arte", url: URL(string: "https://www.arte.tv")!),
    ]

    override init() {
        super.init()
        if let data = UserDefaults.standard.data(forKey: "bookmarks"),
           let saved = try? JSONDecoder().decode([Bookmark].self, from: data) {
            bookmarks = saved
        } else {
            bookmarks = Self.defaultSites
        }
    }

    func loadBlocker() async {
        blocker = await ContentBlocker.load()
        rebuildWebView()
    }

    func rebuildWebView() {
        let config = PlaybackSupport.makeConfiguration(blocker: blockerEnabled ? blocker : nil)
        let wv = WKWebView(frame: .zero, configuration: config)
        wv.navigationDelegate = self
        wv.allowsBackForwardNavigationGestures = true
        wv.customUserAgent = nil // UA Safari mobile par défaut
        // Ne publie que les vrais changements : chaque publication redessine toute l'interface,
        // et YouTube fait bouger sa progression de chargement en continu.
        observers = [
            wv.observe(\.estimatedProgress) { [weak self] v, _ in
                let p = (v.estimatedProgress * 20).rounded() / 20   // paliers de 5 %
                Task { @MainActor in if self?.progress != p { self?.progress = p } } },
            wv.observe(\.canGoBack) { [weak self] v, _ in
                let b = v.canGoBack
                Task { @MainActor in if self?.canGoBack != b { self?.canGoBack = b } } },
            wv.observe(\.canGoForward) { [weak self] v, _ in
                let f = v.canGoForward
                Task { @MainActor in if self?.canGoForward != f { self?.canGoForward = f } } },
        ]
        // Au lancement (aucune page précédente), on ouvre directement YouTube.
        let previous = webView?.url
        webView = wv
        wv.load(URLRequest(url: previous ?? Self.homeURL))
        objectWillChange.send()
    }

    func toggleBlocker() {
        blockerEnabled.toggle()
        rebuildWebView()
    }

    /// Saisie libre : URL directe ou recherche.
    func submitAddress() {
        let text = addressText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        let url: URL?
        if text.contains("."), !text.contains(" ") {
            url = URL(string: text.hasPrefix("http") ? text : "https://\(text)")
        } else {
            var c = URLComponents(string: "https://duckduckgo.com/")!
            c.queryItems = [URLQueryItem(name: "q", value: text)]
            url = c.url
        }
        if let url { open(url) }
    }

    func open(_ url: URL) { webView?.load(URLRequest(url: url)) }
    func back() { webView?.goBack() }
    func forward() { webView?.goForward() }
    func reload() { webView?.reload() }
    func goHome() { open(Self.homeURL) }

    // MARK: Téléchargement
    /// Message affiché quand le téléchargement ne peut pas démarrer.
    @Published var downloadNotice: String?

    /// Titre de la vidéo affichée, sans le suffixe « - YouTube » ajouté par le site.
    var videoTitle: String {
        var t = title.trimmingCharacters(in: .whitespacesAndNewlines)
        if t.hasSuffix(" - YouTube") { t = String(t.dropLast(" - YouTube".count)) }
        return t.isEmpty ? (currentVideoID ?? "Vidéo") : t
    }

    /// Identifiant de la vidéo YouTube affichée, ou nil si la page n'est pas une vidéo.
    var currentVideoID: String? { webView?.url.flatMap(Self.youtubeVideoID(from:)) }

    /// Reconnaît une page de vidéo YouTube (watch, Shorts, live, youtu.be) et renvoie son identifiant.
    static func youtubeVideoID(from url: URL) -> String? {
        guard let host = url.host?.lowercased() else { return nil }
        var id: String?
        if host == "youtu.be" {
            id = url.pathComponents.dropFirst().first
        } else if host == "youtube.com" || host.hasSuffix(".youtube.com") {
            let parts = url.pathComponents
            if url.path == "/watch" {
                id = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                    .queryItems?.first(where: { $0.name == "v" })?.value
            } else if parts.count >= 3, ["shorts", "live", "embed"].contains(parts[1]) {
                id = parts[2]
            }
        }
        guard let id, id.count == 11 else { return nil }
        return id
    }

    func bookmarkCurrent() {
        guard let url = webView?.url else { return }
        bookmarks.append(Bookmark(title: title.isEmpty ? url.host ?? "Site" : title, url: url))
    }

    private func saveBookmarks() {
        if let data = try? JSONEncoder().encode(bookmarks) {
            UserDefaults.standard.set(data, forKey: "bookmarks")
        }
    }

    // MARK: WKNavigationDelegate
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        title = webView.title ?? ""
        addressText = webView.url?.absoluteString ?? ""
    }
}
