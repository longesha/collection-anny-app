import { useMemo, useState } from "react";

const products = [
  { id: 1, name: "Robe Élégance", category: "Robes", price: 38, tag: "NOUVEAUTÉ", color: "Noir", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85", description: "Une silhouette élégante pour vos sorties et occasions spéciales." },
  { id: 2, name: "Ensemble Sable", category: "Ensembles", price: 46, tag: "COUP DE CŒUR", color: "Beige", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85", description: "Un ensemble facile à porter, pensé pour un look chic sans effort." },
  { id: 3, name: "Sac Signature", category: "Accessoires", price: 32, tag: "SÉLECTION", color: "Camel", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85", description: "La touche finale qui accompagne vos essentiels au quotidien." },
  { id: 4, name: "Robe Lumière", category: "Robes", price: 42, tag: "NOUVEAUTÉ", color: "Écru", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85", description: "Une pièce féminine aux lignes délicates et intemporelles." },
  { id: 5, name: "Ensemble Urbain", category: "Ensembles", price: 49, tag: "ÉDITION STYLE", color: "Noir", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", description: "Une allure moderne pour vos journées actives." },
  { id: 6, name: "Lunettes Chic", category: "Accessoires", price: 18, tag: "PETIT PRIX", color: "Doré", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85", description: "Un accessoire affirmé pour compléter votre style." }
];
const categories = ["Tout voir", "Robes", "Ensembles", "Accessoires"];
const money = (value) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function App() {
  const [category, setCategory] = useState("Tout voir");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");

  const visibleProducts = useMemo(() => {
    let list = products.filter((product) =>
      (category === "Tout voir" || product.category === category) &&
      (product.name.toLowerCase().includes(search.toLowerCase()) || product.category.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, search, sort]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product) {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      return found
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    setNotice(product.name + " ajouté au panier");
    window.setTimeout(() => setNotice(""), 2600);
  }

  function changeQuantity(id, amount) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  }

  function sendOrder() {
    if (!cart.length) return;
    const lines = cart.map((item) => "• " + item.name + " x" + item.quantity + " — " + money(item.price * item.quantity)).join("\n");
    const message = ["Bonjour Collection Anny, je souhaite commander :", lines, "", "Total indicatif : " + money(total), "Merci de confirmer la disponibilité et les modalités de livraison."].join("\n");
    window.open("https://wa.me/24382074897?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="site-shell">
      <div className="announcement">COLLECTION ANNY <span>✦</span> L'ÉLÉGANCE AU QUOTIDIEN <span>✦</span> LUBUMBASHI</div>
      <header className="site-header">
        <a className="brand" href="#accueil" aria-label="Collection Anny, accueil"><span className="brand-mark">CA</span><span><strong>Collection Anny</strong><small>MODE & ACCESSOIRES</small></span></a>
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Ouvrir le menu">{mobileOpen ? "✕" : "☰"}</button>
        <nav className={"main-nav " + (mobileOpen ? "is-open" : "")} aria-label="Navigation principale">
          <a onClick={() => setMobileOpen(false)} href="#accueil">Accueil</a><a onClick={() => setMobileOpen(false)} href="#boutique">Boutique</a><a onClick={() => setMobileOpen(false)} href="#histoire">Notre histoire</a><a onClick={() => setMobileOpen(false)} href="#contact">Contact</a>
        </nav>
        <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={"Ouvrir le panier, " + cartCount + " articles"}><span>Panier</span><span className="cart-count">{cartCount}</span></button>
      </header>
      <main>
        <section className="hero" id="accueil">
          <div className="hero-copy"><p className="eyebrow"><span /> LA MODE, À VOTRE IMAGE</p><h1>L'élégance est<br />dans <em>chaque détail.</em></h1><p className="hero-description">Des pièces choisies avec soin pour révéler votre personnalité. Trouvez votre prochain coup de cœur chez Collection Anny.</p><div className="hero-actions"><a className="button button-dark" href="#boutique">Découvrir la collection <span>↗</span></a><a className="text-link" href="#histoire">Notre univers</a></div><div className="hero-note"><span className="note-line" /> Une allure qui vous appartient.</div></div>
          <div className="hero-visual"><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=90" alt="Silhouette élégante dans une tenue de mode" /><div className="hero-stamp"><span>COLLECTION</span><strong>ANNY</strong><small>STYLE · CONFIANCE · ÉLÉGANCE</small></div><span className="hero-side-note">YOUR STYLE, YOUR STORY</span></div>
          <div className="hero-bottom"><span>01 / 03</span><span>COLLECTION ANNY — LUBUMBASHI, RDC</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>
        <section className="benefits" aria-label="Nos engagements"><div><span className="benefit-icon">✧</span><p><strong>Style soigneusement choisi</strong><small>Des pièces qui font la différence</small></p></div><div><span className="benefit-icon">◇</span><p><strong>Une expérience simple</strong><small>Un contact direct avec la boutique</small></p></div><div><span className="benefit-icon">♡</span><p><strong>À votre écoute</strong><small>Conseils et informations personnalisés</small></p></div></section>
        <section className="shop-section section" id="boutique">
          <div className="section-heading"><div><p className="eyebrow">LA SÉLECTION ANNY</p><h2>Vos prochains <em>essentiels.</em></h2></div><p>Explorez une sélection pensée pour<br />accompagner chaque moment de votre vie.</p></div>
          <div className="shop-toolbar"><div className="category-tabs" aria-label="Filtrer par catégorie">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="shop-controls"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un article" aria-label="Rechercher un article" /></label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Trier les articles"><option value="featured">À la une</option><option value="low">Prix croissant</option><option value="high">Prix décroissant</option></select></div></div>
          <div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><button className="product-image" onClick={() => setSelected(product)} aria-label={"Voir " + product.name}><img src={product.image} alt={product.name} loading="lazy" /><span className="product-tag">{product.tag}</span><span className="quick-view">Voir le détail ↗</span></button><div className="product-info"><div><p>{product.category} · {product.color}</p><h3>{product.name}</h3></div><strong>{money(product.price)}</strong></div><button className="add-button" onClick={() => addToCart(product)}>Ajouter au panier <span>＋</span></button></article>)}{!visibleProducts.length && <div className="empty-results"><span>⌕</span><h3>Aucun article trouvé</h3><p>Essayez un autre mot ou une autre catégorie.</p><button onClick={() => { setSearch(""); setCategory("Tout voir"); }}>Réinitialiser les filtres</button></div>}</div>
          <p className="catalog-note">Sélection de démonstration : les articles, prix et disponibilités seront remplacés par les données réelles de la boutique.</p>
        </section>
        <section className="editorial section" id="histoire"><div className="editorial-image"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85" alt="Sélection de looks mode" loading="lazy" /><span>THE ANNY EDIT</span></div><div className="editorial-copy"><p className="eyebrow">L'ESPRIT COLLECTION ANNY</p><h2>Le style n'est pas<br />une tendance.<br /><em>C'est votre signature.</em></h2><p>Collection Anny célèbre une mode féminine, expressive et accessible. Nous voulons vous aider à trouver des pièces dans lesquelles vous vous sentez belle, libre et pleinement vous-même.</p><a className="text-link" href="#contact">Parlons de votre style ↗</a></div></section>
        <section className="contact section" id="contact"><p className="eyebrow">UNE QUESTION ? UN COUP DE CŒUR ?</p><h2>Nous sommes à<br /><em>votre écoute.</em></h2><p>Besoin d'un renseignement sur un article ou d'un conseil ? Écrivez directement à notre équipe.</p><div className="contact-actions"><a className="button button-gold" href="https://wa.me/24382074897" target="_blank" rel="noreferrer">Écrire sur WhatsApp <span>↗</span></a><a className="contact-email" href="mailto:longeshaandy@gmail.com">longeshaandy@gmail.com</a></div><small>LUBUMBASHI · RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</small></section>
      </main>
      <footer className="site-footer"><a className="footer-brand" href="#accueil">Collection Anny<span>.</span></a><span>© {new Date().getFullYear()} Collection Anny. Tous droits réservés.</span><a href="#accueil">Retour en haut ↑</a></footer>
      {notice && <div className="toast" role="status">{notice}</div>}
      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><p className="eyebrow">VOTRE SÉLECTION</p><h2>Mon panier <span>({cartCount})</span></h2></div><button onClick={() => setCartOpen(false)} aria-label="Fermer le panier">✕</button></div>
        {cart.length ? <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div className="cart-item-info"><strong>{item.name}</strong><small>{money(item.price)} · {item.color}</small><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label="Diminuer">−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label="Augmenter">＋</button></div></div><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="cart-summary"><div><span>Sous-total indicatif</span><strong>{money(total)}</strong></div><small>La disponibilité, le prix final et la livraison seront confirmés par la boutique.</small><button className="button button-dark checkout-button" onClick={sendOrder}>Continuer sur WhatsApp <span>↗</span></button></div></> : <div className="cart-empty"><span>♡</span><h3>Votre panier est vide</h3><p>Ajoutez vos coups de cœur pour les retrouver ici.</p><button className="button button-dark" onClick={() => setCartOpen(false)}>Explorer la boutique</button></div>}
      </aside></div>}
      {selected && <div className="overlay modal-overlay" onClick={() => setSelected(null)}><section className="product-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Fermer">✕</button><img src={selected.image} alt={selected.name} /><div className="modal-copy"><p className="eyebrow">{selected.category} · {selected.color}</p><h2>{selected.name}</h2><strong>{money(selected.price)}</strong><p>{selected.description}</p><small>Article de démonstration — disponibilité à confirmer.</small><button className="button button-dark" onClick={() => { addToCart(selected); setSelected(null); setCartOpen(true); }}>Ajouter au panier <span>＋</span></button></div></section></div>}
    </div>
  );
}
export default App;
