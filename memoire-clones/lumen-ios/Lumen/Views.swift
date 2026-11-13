import SwiftUI
import WebKit
import AVKit

struct RootView: View {
    @EnvironmentObject var browser: BrowserModel
    @EnvironmentObject var store: PremiumStore
    @StateObject private var downloader = VideoDownloader()
    @StateObject private var tv = TVPlayback()
    @StateObject private var downloads = DownloadsStore()
    @State private var showBookmarks = false
    @State private var showPremium = false
    @State private var showDownloads = false

    var body: some View {
        VStack(spacing: 0) {
            AddressBar()
            if browser.progress < 1 && browser.progress > 0 {
                ProgressView(value: browser.progress).progressViewStyle(.linear)
            }
            WebViewContainer().ignoresSafeArea(edges: .bottom)
            DownloadBanner().padding(.vertical, 6)
            Toolbar(showBookmarks: $showBookmarks, showPremium: $showPremium, showDownloads: $showDownloads)
        }
        .environmentObject(downloader)
        .environmentObject(tv)
        .environmentObject(downloads)
        // Fichier MP4 terminé : rangé dans Téléchargements, ou ouvert directement dans le lecteur (AirPlay 1080p).
        .onChange(of: downloader.finished) { _, done in
            guard let done else { return }
            downloader.finished = nil
            switch done.purpose {
            case .library:
                do { try downloads.add(file: done.file, videoID: done.videoID, title: done.title) }
                catch { downloader.phase = .failed("rangement impossible : \(error.localizedDescription)") }
            case .tv:
                downloader.dismiss()
                tv.play(file: done.file, deleteOnClose: true)
            }
        }
        .sheet(isPresented: $showBookmarks) { BookmarksView() }
        .sheet(isPresented: $showPremium) { PremiumView() }
        .sheet(isPresented: $showDownloads) { NavigationStack { DownloadsView() } }
        .fullScreenCover(isPresented: Binding(
            get: { tv.player != nil },
            set: { if !$0 { tv.close() } }
        )) {
            if let player = tv.player {
                NativePlayerView(player: player)
                    .ignoresSafeArea()
                    .overlay(alignment: .topLeading) {
                        Button { tv.close() } label: {
                            Label("Fermer", systemImage: "chevron.down")
                                .font(.subheadline.weight(.semibold))
                                .padding(.horizontal, 12).padding(.vertical, 8)
                                .background(.ultraThinMaterial, in: Capsule())
                        }
                        .padding(.leading, 16).padding(.top, 56)
                    }
            }
        }
        .alert("Lumen", isPresented: Binding(
            get: { browser.downloadNotice != nil },
            set: { if !$0 { browser.downloadNotice = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(browser.downloadNotice ?? "")
        }
    }
}

struct AddressBar: View {
    @EnvironmentObject var browser: BrowserModel
    var body: some View {
        HStack {
            Image(systemName: browser.blockerEnabled ? "shield.fill" : "shield.slash")
                .foregroundStyle(browser.blockerEnabled ? .green : .secondary)
                .onTapGesture { browser.toggleBlocker() }
                .accessibilityLabel("Bloqueur de publicités")
            TextField("Rechercher ou saisir une adresse", text: $browser.addressText)
                .textInputAutocapitalization(.never)
                .keyboardType(.webSearch)
                .autocorrectionDisabled()
                .onSubmit { browser.submitAddress() }
        }
        .padding(10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal).padding(.vertical, 6)
    }
}

struct Toolbar: View {
    @EnvironmentObject var browser: BrowserModel
    @EnvironmentObject var downloader: VideoDownloader
    @Binding var showBookmarks: Bool
    @Binding var showPremium: Bool
    @Binding var showDownloads: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            ToolItem("Retour", systemImage: "chevron.left", action: browser.back)
                .disabled(!browser.canGoBack)
            ToolItem("Accueil", systemImage: "house", action: browser.goHome)
            ToolItem("Sur la télé", systemImage: "tv",
                     busy: downloader.isActive && downloader.purpose == .tv, action: playOnTV)
                .disabled(downloader.isActive)
            ToolItem("Télécharger", systemImage: "arrow.down.circle",
                     busy: downloader.isActive && downloader.purpose == .library, action: download)
                .disabled(downloader.isActive)
            ToolItem("Mes vidéos", systemImage: "tray.full") { showDownloads = true }
            Menu {
                Button("Avancer", systemImage: "chevron.right", action: browser.forward)
                    .disabled(!browser.canGoForward)
                Button("Recharger", systemImage: "arrow.clockwise", action: browser.reload)
                Button("Favoris", systemImage: "book") { showBookmarks = true }
                Button("Premium", systemImage: "star") { showPremium = true }
            } label: {
                ToolLabel(title: "Plus", systemImage: "ellipsis.circle", busy: false)
            }
            .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, 4).padding(.top, 8).padding(.bottom, 2)
        .background(.bar)
    }

    /// Relit la vidéo affichée en 1080p dans le lecteur natif (AirPlay image + son).
    private func playOnTV() {
        guard let id = browser.currentVideoID else {
            browser.downloadNotice = "Ouvre d'abord une vidéo YouTube, puis touche « Sur la télé »."
            return
        }
        // Met en pause la vidéo de la page pour ne pas avoir deux sons en même temps.
        browser.webView?.evaluateJavaScript("document.querySelectorAll('video').forEach(v => v.pause())")
        downloader.start(videoID: id, title: browser.videoTitle, purpose: .tv)
    }

    /// Télécharge la vidéo affichée dans « Mes vidéos ».
    private func download() {
        guard let id = browser.currentVideoID else {
            browser.downloadNotice = "Ouvre d'abord une vidéo YouTube, puis touche « Télécharger »."
            return
        }
        downloader.start(videoID: id, title: browser.videoTitle, purpose: .library)
    }
}

/// Bouton de la barre du bas : icône + nom en dessous.
struct ToolItem: View {
    let title: String
    let systemImage: String
    var busy = false
    let action: () -> Void

    init(_ title: String, systemImage: String, busy: Bool = false, action: @escaping () -> Void) {
        self.title = title
        self.systemImage = systemImage
        self.busy = busy
        self.action = action
    }

    var body: some View {
        Button(action: action) { ToolLabel(title: title, systemImage: systemImage, busy: busy) }
            .frame(maxWidth: .infinity)
            .accessibilityLabel(title)
    }
}

struct ToolLabel: View {
    let title: String
    let systemImage: String
    let busy: Bool

    var body: some View {
        VStack(spacing: 3) {
            Group {
                if busy { ProgressView() } else { Image(systemName: systemImage).font(.system(size: 20)) }
            }
            .frame(height: 24)
            Text(title).font(.caption2).lineLimit(1).minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .contentShape(Rectangle())
    }
}

/// Progression du téléchargement, au-dessus de la barre d'outils.
struct DownloadBanner: View {
    @EnvironmentObject var downloader: VideoDownloader

    var body: some View {
        if downloader.phase != .idle {
            HStack(spacing: 12) {
                Image(systemName: symbol)
                    .font(.title3)
                    .foregroundStyle(tint)
                VStack(alignment: .leading, spacing: 4) {
                    Text(label).font(.subheadline.weight(.semibold)).lineLimit(2)
                    if !downloader.title.isEmpty {
                        Text(downloader.title).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                    }
                    if let fraction {
                        ProgressView(value: fraction).progressViewStyle(.linear)
                    } else if downloader.isActive {
                        ProgressView().progressViewStyle(.linear)
                    }
                }
                Spacer(minLength: 0)
                if downloader.isActive {
                    Button("Annuler", role: .cancel) { downloader.cancel() }.font(.subheadline)
                } else {
                    Button { downloader.dismiss() } label: { Image(systemName: "xmark.circle.fill") }
                        .foregroundStyle(.secondary)
                        .accessibilityLabel("Fermer")
                }
            }
            .padding(12)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
            .padding(.horizontal)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }

    private var label: String {
        switch downloader.phase {
        case .idle: return ""
        case .analyzing: return downloader.purpose == .tv ? "Préparation en 1080p pour la télé…" : "Analyse de la vidéo…"
        case .video(let p): return "Vidéo · \(Int(p * 100)) %"
        case .audio(let p): return "Audio · \(Int(p * 100)) %"
        case .merging: return "Assemblage vidéo + audio…"
        case .done: return downloader.purpose == .tv ? "Prête : lecture sur la télé" : "Enregistrée dans « Mes vidéos »"
        case .failed(let message): return "Échec : \(message)"
        }
    }

    private var fraction: Double? {
        switch downloader.phase {
        case .video(let p), .audio(let p): return p
        default: return nil
        }
    }

    private var symbol: String {
        switch downloader.phase {
        case .done: return "checkmark.circle.fill"
        case .failed: return "exclamationmark.triangle.fill"
        default: return "arrow.down.circle"
        }
    }

    private var tint: Color {
        switch downloader.phase {
        case .done: return .green
        case .failed: return .orange
        default: return .accentColor
        }
    }
}

struct WebViewContainer: UIViewRepresentable {
    @EnvironmentObject var browser: BrowserModel
    func makeUIView(context: Context) -> UIView { UIView() }
    func updateUIView(_ host: UIView, context: Context) {
        guard let wv = browser.webView, wv.superview !== host else { return }
        host.subviews.forEach { $0.removeFromSuperview() }
        wv.frame = host.bounds
        wv.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        host.addSubview(wv)
    }
}

/// Sélecteur de sortie AirPlay système.
struct AirPlayButton: UIViewRepresentable {
    func makeUIView(context: Context) -> AVRoutePickerView {
        let v = AVRoutePickerView()
        v.prioritizesVideoDevices = true
        return v
    }
    func updateUIView(_ uiView: AVRoutePickerView, context: Context) {}
}

struct BookmarksView: View {
    @EnvironmentObject var browser: BrowserModel
    @Environment(\.dismiss) var dismiss
    var body: some View {
        NavigationStack {
            List {
                NavigationLink {
                    DownloadsView()
                } label: {
                    Label("Mes vidéos", systemImage: "tray.full")
                }
                Button("Ajouter la page actuelle") { browser.bookmarkCurrent() }
                ForEach(browser.bookmarks) { b in
                    Button { browser.open(b.url); dismiss() } label: {
                        VStack(alignment: .leading) {
                            Text(b.title)
                            Text(b.url.host ?? "").font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete { browser.bookmarks.remove(atOffsets: $0) }
            }
            .navigationTitle("Favoris")
        }
    }
}
