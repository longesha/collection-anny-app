import { useEffect, useState } from "react";

const emptyForm = { name: "", category: "Boubous", price: "", color: "", image_url: "", description: "", stock: "0" };
const money = (value) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(value || 0));

export default function AdminDashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("collection_anny_token");

  async function request(path = "", options = {}) {
    const response = await fetch("/api/admin/products" + path, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token, ...(options.headers || {}) }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Une erreur est survenue.");
    return data;
  }

  async function loadProducts() {
    setLoading(true);
    setError("");
    try { const data = await request(); setProducts(data.products || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      const data = await request(editingId ? "/" + editingId : "", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setMessage(editingId ? "Produit modifié avec succès." : "Produit ajouté avec succès.");
      setForm(emptyForm); setEditingId(null);
      await loadProducts();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  function edit(product) {
    setEditingId(product.id);
    setForm({ name: product.name, category: product.category, price: String(product.price), color: product.color || "", image_url: product.image_url || "", description: product.description || "", stock: String(product.stock) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(product) {
    if (!window.confirm("Supprimer « " + product.name + " » ?")) return;
    setError(""); setMessage("");
    try { await request("/" + product.id, { method: "DELETE" }); setMessage("Produit supprimé."); await loadProducts(); }
    catch (err) { setError(err.message); }
  }

  const stockTotal = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="#admin">CA <span>Collection Anny</span></a>
      <p className="admin-sidebar-label">ESPACE DE GESTION</p>
      <a className="admin-nav active" href="#admin">▦ Tableau de bord</a>
      <a className="admin-nav" href="#admin-products">◇ Produits</a>
      <span className="admin-nav muted">▤ Commandes — bientôt</span>
      <span className="admin-nav muted">♙ Clients — bientôt</span>
      <span className="admin-nav muted">▥ Statistiques — bientôt</span>
      <div className="admin-sidebar-bottom"><small>Connecté en tant que</small><strong>{user.name}</strong><button onClick={onLogout}>Déconnexion</button></div>
    </aside>
    <main className="admin-main" id="admin">
      <header className="admin-topbar"><div><p className="eyebrow">COLLECTION ANNY · ADMINISTRATION</p><h1>Bonjour, {user.name}</h1><p>Gérez votre boutique depuis cet espace.</p></div><span className="admin-avatar">{(user.name || "A").charAt(0).toUpperCase()}</span></header>
      <section className="admin-stat-grid">
        <article className="admin-stat"><span>Produits enregistrés</span><strong>{products.length}</strong><small>Dans votre catalogue</small></article>
        <article className="admin-stat"><span>Unités en stock</span><strong>{stockTotal}</strong><small>Quantité cumulée</small></article>
        <article className="admin-stat"><span>Produits en rupture</span><strong>{products.filter((p) => Number(p.stock) === 0).length}</strong><small>Stock égal à zéro</small></article>
      </section>
      <section className="admin-panel" id="admin-products">
        <div className="admin-panel-heading"><div><p className="eyebrow">CATALOGUE</p><h2>{editingId ? "Modifier un produit" : "Ajouter un produit"}</h2></div></div>
        <form className="admin-product-form" onSubmit={submit}>
          <label>Nom du produit<input name="name" required maxLength="160" value={form.name} onChange={updateField} placeholder="Ex. Boubou Bleu Royal"/></label>
          <label>Catégorie<select name="category" value={form.category} onChange={updateField}><option>Boubous</option><option>Accessoires</option><option>Robes</option><option>Autres</option></select></label>
          <label>Prix (USD)<input name="price" type="number" min="0.01" step="0.01" required value={form.price} onChange={updateField} placeholder="58"/></label>
          <label>Stock initial<input name="stock" type="number" min="0" step="1" required value={form.stock} onChange={updateField}/></label>
          <label>Couleur<input name="color" value={form.color} onChange={updateField} placeholder="Bleu royal"/></label>
          <label>URL de la photo<input name="image_url" type="url" value={form.image_url} onChange={updateField} placeholder="https://..."/></label>
          <label className="wide">Description<textarea name="description" rows="3" value={form.description} onChange={updateField} placeholder="Description du produit"/></label>
          <div className="admin-form-actions"><button className="admin-primary" disabled={saving}>{saving ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : "Ajouter le produit"}</button>{editingId && <button type="button" className="admin-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Annuler</button>}</div>
        </form>
        {error && <p className="admin-alert error">{error}</p>}{message && <p className="admin-alert success">{message}</p>}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">INVENTAIRE</p><h2>Vos produits</h2></div><button className="admin-secondary" onClick={loadProducts}>Actualiser</button></div>
        {loading ? <p>Chargement des produits...</p> : products.length === 0 ? <p className="admin-empty">Aucun produit enregistré. Ajoutez votre premier article ci-dessus.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-name">{product.image_url && <img src={product.image_url} alt=""/>}<strong>{product.name}</strong></div></td><td>{product.category}</td><td>{money(product.price)}</td><td><span className={Number(product.stock) === 0 ? "stock-zero" : "stock-ok"}>{product.stock}</span></td><td><div className="admin-row-actions"><button onClick={() => edit(product)}>Modifier</button><button onClick={() => remove(product)}>Supprimer</button></div></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  </div>;
}
