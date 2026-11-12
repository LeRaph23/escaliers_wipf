import WebKit

/// Blocage des publicités : moteur natif WebKit (WKContentRuleList), le même format JSON
/// que les extensions « Content Blocker » de Safari. Règles génériques (style EasyList),
/// rien de spécifique à un site.
enum ContentBlocker {
    static let identifier = "lumen.rules.v1"

    static func load() async -> WKContentRuleList? {
        let store = WKContentRuleListStore.default()!
        if let cached = try? await store.contentRuleList(forIdentifier: identifier) {
            return cached
        }
        guard let url = Bundle.main.url(forResource: "blocker-rules", withExtension: "json"),
              let json = try? String(contentsOf: url, encoding: .utf8) else { return nil }
        return try? await store.compileContentRuleList(forIdentifier: identifier,
                                                       encodedContentRuleList: json)
    }
}
