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
        observers = [
            wv.observe(\.estimatedProgress) { [weak self] v, _ in
                Task { @MainActor in self?.progress = v.estimatedProgress } },
            wv.observe(\.canGoBack) { [weak self] v, _ in
                Task { @MainActor in self?.canGoBack = v.canGoBack } },
            wv.observe(\.canGoForward) { [weak self] v, _ in
                Task { @MainActor in self?.canGoForward = v.canGoForward } },
        ]
        let previous = webView?.url
        webView = wv
        if let previous { wv.load(URLRequest(url: previous)) }
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

    // MARK: Relais vers le raccourci de téléchargement de l'utilisateur
    /// Message affiché à l'utilisateur après un essai de téléchargement.
    @Published var downloadNotice: String?

    /// Nom exact du raccourci iOS créé par l'utilisateur (voir README).
    static let downloadShortcutName = "YT HD"

    /// L'app ne télécharge rien elle-même : elle transmet le lien de la vidéo affichée au raccourci
    /// « YT HD » de l'utilisateur, qui fait tout le travail en dehors de l'app (démonstration
    /// de reproductibilité pour le mémoire ; usage personnel uniquement).
    func sendCurrentVideoToShortcut() {
        guard let url = webView?.url, let videoURL = Self.youtubeVideoURL(from: url) else {
            downloadNotice = "Ouvre d'abord une vidéo YouTube, puis touche Télécharger."
            return
        }
        // Copie aussi le lien : le raccourci se rabat sur le presse-papiers s'il ne reçoit pas d'entrée.
        UIPasteboard.general.string = videoURL.absoluteString
        var c = URLComponents(string: "shortcuts://run-shortcut")!
        c.queryItems = [
            URLQueryItem(name: "name", value: Self.downloadShortcutName),
            URLQueryItem(name: "input", value: "text"),
            URLQueryItem(name: "text", value: videoURL.absoluteString),
        ]
        guard let shortcutURL = c.url else { return }
        UIApplication.shared.open(shortcutURL) { [weak self] ok in
            Task { @MainActor in
                if !ok { self?.downloadNotice = "Impossible d'ouvrir Raccourcis. Vérifie que le raccourci « \(Self.downloadShortcutName) » existe." }
            }
        }
    }

    /// Reconnaît une page de vidéo YouTube et renvoie son lien canonique.
    static func youtubeVideoURL(from url: URL) -> URL? {
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
        return URL(string: "https://www.youtube.com/watch?v=\(id)")
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
