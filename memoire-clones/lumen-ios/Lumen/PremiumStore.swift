import StoreKit
import SwiftUI

/// Modèle freemium observé : abonnement + achat à vie (StoreKit 2).
/// Identifiants produits fictifs, à déclarer dans un fichier .storekit pour tester.
@MainActor
final class PremiumStore: ObservableObject {
    static let productIDs = ["lumen.premium.monthly", "lumen.premium.yearly", "lumen.premium.lifetime"]

    @Published var products: [Product] = []
    @Published var isPremium = false
    private var updates: Task<Void, Never>?

    init() {
        updates = Task { [weak self] in
            for await result in Transaction.updates {
                if case .verified(let t) = result { await t.finish() }
                await self?.refresh()
            }
        }
    }

    func refresh() async {
        products = (try? await Product.products(for: Self.productIDs)) ?? []
        var active = false
        for await result in Transaction.currentEntitlements {
            if case .verified(let t) = result, t.revocationDate == nil { active = true }
        }
        isPremium = active
    }

    func buy(_ product: Product) async {
        guard let result = try? await product.purchase() else { return }
        if case .success(.verified(let t)) = result { await t.finish() }
        await refresh()
    }
}

struct PremiumView: View {
    @EnvironmentObject var store: PremiumStore
    var body: some View {
        NavigationStack {
            List {
                Section {
                    Label("Blocage des publicités", systemImage: "shield")
                    Label("Lecture en arrière-plan", systemImage: "speaker.wave.2")
                    Label("Picture in Picture & AirPlay", systemImage: "pip")
                }
                Section(store.isPremium ? "Premium actif" : "Passer Premium") {
                    ForEach(store.products, id: \.id) { p in
                        Button { Task { await store.buy(p) } } label: {
                            HStack { Text(p.displayName); Spacer(); Text(p.displayPrice) }
                        }
                    }
                    Button("Restaurer les achats") { Task { try? await AppStore.sync(); await store.refresh() } }
                }
            }
            .navigationTitle("Lumen Premium")
        }
    }
}
