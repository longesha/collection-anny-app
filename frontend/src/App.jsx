const categories = [
  { name: "Robes", description: "Des pièces pour chaque occasion", symbol: "✿" },
  { name: "Ensembles", description: "Des looks faciles à adopter", symbol: "◇" },
  { name: "Accessoires", description: "La touche qui change tout", symbol: "♡" }
];

function App() {
  return (
    <div className="site-shell">
      <div className="announcement">
        COLLECTION ANNY <span>—</span> L'élégance au quotidien
      </div>

      <header className="site-header">
        <a className="brand" href="/" aria-label="Collection Anny, accueil">
          <span className="brand-mark">CA</span>
          <span>
            <strong>Collection Anny</strong>
            <small>MODE & ACCESSOIRES</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Navigation principale">
          <a href="#accueil">Accueil</a>
          <a href="#categories">Catégories</a>
          <a href="#boutique">La boutique</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="header-action" href="#contact">Nous contacter <span>↗</span></a>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero-copy">
            <p className="eyebrow">LE STYLE QUI VOUS RESSEMBLE</p>
            <h1>Votre élégance,<br /><em>votre signature.</em></h1>
            <p className="hero-description">
              Découvrez une sélection de vêtements et d'accessoires pensés
              pour révéler votre style, chaque jour.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#categories">Explorer la collection <span>→</span></a>
              <a className="text-link" href="#boutique">Découvrir la boutique</a>
            </div>
            <div className="hero-note">
              <span className="note-line" />
              <span>Une mode inspirante, à votre image.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Illustration décorative de mode">
            <div className="art-circle circle-one" />
            <div className="art-circle circle-two" />
            <div className="art-card">
              <span className="art-small">COLLECTION</span>
              <span className="art-big">Style<br /><i>with</i><br />confidence.</span>
              <span className="art-bottom">COLLECTION ANNY · LUBUMBASHI</span>
            </div>
            <span className="art-star star-one">✳</span>
            <span className="art-star star-two">✦</span>
            <span className="art-caption">NEW SEASON / YOUR STYLE</span>
          </div>
        </section>

        <section className="benefits" aria-label="Nos engagements">
          <div><span>01</span><p>Une sélection soignée</p></div>
          <div><span>02</span><p>Un style qui vous ressemble</p></div>
          <div><span>03</span><p>À Lubumbashi et ailleurs</p></div>
        </section>

        <section className="categories section" id="categories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TROUVEZ VOTRE STYLE</p>
              <h2>Explorez nos univers</h2>
            </div>
            <p>Des essentiels aux pièces qui attirent les regards,<br />trouvez votre prochain coup de cœur.</p>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => (
              <article className={`category-card category-${index + 1}`} key={category.name}>
                <span className="category-symbol">{category.symbol}</span>
                <div>
                  <p>{category.description}</p>
                  <h3>{category.name}</h3>
                  <a href="#contact" aria-label={`Demander les articles de la catégorie ${category.name}`}>Découvrir <span>↗</span></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about section" id="boutique">
          <div className="about-decoration">A.</div>
          <div>
            <p className="eyebrow">BIENVENUE CHEZ COLLECTION ANNY</p>
            <h2>La mode est une façon<br /><em>de s'exprimer.</em></h2>
            <p>
              Notre boutique met à l'honneur les vêtements et accessoires
              féminins. Notre ambition : vous aider à trouver des pièces
              dans lesquelles vous vous sentez belle et confiante.
            </p>
          </div>
        </section>

        <section className="contact section" id="contact">
          <p className="eyebrow">RESTONS EN CONTACT</p>
          <h2>Un article vous intéresse ?</h2>
          <p>Écrivez-nous pour connaître les articles disponibles et les modalités de commande.</p>
          <a className="button button-light" href="mailto:contact@collectionanny.com">Contacter la boutique <span>↗</span></a>
          <small>Les coordonnées officielles seront ajoutées après confirmation.</small>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#accueil">Collection Anny</a>
        <span>© {new Date().getFullYear()} Collection Anny. Tous droits réservés.</span>
        <a href="#accueil">Retour en haut ↑</a>
      </footer>
    </div>
  );
}

export default App;
