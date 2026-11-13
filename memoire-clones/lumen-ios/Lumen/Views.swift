import SwiftUI
import WebKit
import AVKit

struct RootView: View {
    @EnvironmentObject var browser: BrowserModel
    @EnvironmentObject var store: PremiumStore
    @State private var showBookmarks = false
    @State private var showPremium = false

    var body: some View {
        VStack(spacing: 0) {
            AddressBar()
            if browser.progress < 1 && browser.progress > 0 {
                ProgressView(value: browser.progress).progressViewStyle(.linear)
            }
            WebViewContainer().ignoresSafeArea(edges: .bottom)
            Toolbar(showBookmarks: $showBookmarks, showPremium: $showPremium)
        }
        .sheet(isPresented: $showBookmarks) { BookmarksView() }
        .sheet(isPresented: $showPremium) { PremiumView() }
        .alert("Téléchargement", isPresented: Binding(
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
    @Binding var showBookmarks: Bool
    @Binding var showPremium: Bool
    var body: some View {
        HStack {
            Button(action: browser.back) { Image(systemName: "chevron.left") }.disabled(!browser.canGoBack)
            Spacer()
            Button(action: browser.forward) { Image(systemName: "chevron.right") }.disabled(!browser.canGoForward)
            Spacer()
            Button(action: browser.reload) { Image(systemName: "arrow.clockwise") }
            Spacer()
            AirPlayButton().frame(width: 28, height: 28)
            Spacer()
            Button(action: browser.sendCurrentVideoToShortcut) { Image(systemName: "arrow.down.circle") }
                .accessibilityLabel("Télécharger la vidéo")
            Spacer()
            Button { showBookmarks = true } label: { Image(systemName: "book") }
            Spacer()
            Button { showPremium = true } label: { Image(systemName: "star") }
        }
        .font(.title3)
        .padding(.horizontal, 24).padding(.vertical, 10)
        .background(.bar)
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
