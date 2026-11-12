import { useEffect, useMemo, useState } from "react";

const money = value => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(value || 0));
const statuses = { pending: "En attente", confirmed: "Confirmée", preparing: "En préparation", delivered: "Livrée", cancelled: "Annulée", cancellation_requested: "Annulation demandée" };

export default function AdminCustomersPanel() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const token = localStorage.getItem("collection_anny_token");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/customers", { headers: { Authorization: "Bearer " + token } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Impossible de charger les clients.");
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function removeCustomer(customer) {
    if (Number(customer.order_count) > 0) {
      setError("Ce client possède un historique de commandes : son compte ne peut pas être supprimé pour préserver les ventes.");
      return;
    }
    if (!window.confirm("Supprimer définitivement le compte de " + customer.name + " ? Cette action est irréversible.")) return;
    setDeletingId(customer.id);
    setError("");
    try {
      const response = await fetch("/api/admin/customers/" + customer.id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Impossible de supprimer le client.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(c => [c.name, c.email, c.phone].join(" ").toLowerCase().includes(term));
  }, [customers, search]);

  return <section className="admin-panel" id="admin-customers">
    <div className="admin-panel-heading">
      <div><p className="eyebrow">RELATION CLIENT</p><h2>Gestion des clients</h2></div>
      <button className="admin-secondary" onClick={load}>Actualiser</button>
    </div>
    <div className="customers-toolbar">
      <input aria-label="Rechercher un client" placeholder="Rechercher par nom, e-mail ou téléphone..." value={search} onChange={e => setSearch(e.target.value)} />
      <span>{filtered.length} client(s)</span>
    </div>
    {error && <p className="admin-alert error">{error}</p>}
    {loading ? <p>Chargement des clients...</p> : filtered.length === 0 ? <p className="admin-empty">{customers.length ? "Aucun client ne correspond à cette recherche." : "Aucun client inscrit pour le moment."}</p> :
      <div className="admin-customers-list">
        {filtered.map(customer => {
          const waPhone = String(customer.phone || "").replace(/\D/g, "").replace(/^0/, "243");
          return <details className="admin-customer" key={customer.id}>
            <summary>
              <span className="admin-customer-avatar">{customer.avatar_url ? <img src={customer.avatar_url} alt="" /> : (customer.name || "C").charAt(0).toUpperCase()}</span>
              <span className="admin-customer-identity"><strong>{customer.name}</strong><small>{customer.email}</small><small>{customer.phone || "Téléphone non renseigné"}</small></span>
              <span className="admin-customer-metrics"><strong>{customer.order_count} commande(s)</strong><small>{money(customer.total_spent)} au total</small></span>
              <span className="admin-customer-chevron">⌄</span>
            </summary>
            <div className="admin-customer-details">
              <p><strong>Inscription :</strong> {new Date(customer.created_at).toLocaleDateString("fr-FR")}</p>
              <p><strong>Dernière commande :</strong> {customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString("fr-FR") : "Aucune commande"}</p>
              {waPhone && <a className="admin-customer-whatsapp" href={"https://wa.me/" + waPhone} target="_blank" rel="noreferrer">Contacter sur WhatsApp ↗</a>}
              <button
                className="admin-customer-delete"
                disabled={Number(customer.order_count) > 0 || deletingId === customer.id}
                onClick={() => removeCustomer(customer)}
                title={Number(customer.order_count) > 0 ? "Un client avec des commandes ne peut pas être supprimé" : "Supprimer ce compte client"}
              >{deletingId === customer.id ? "Suppression..." : "Supprimer le client"}</button>
              {Number(customer.order_count) > 0 && <small className="admin-customer-delete-note">Suppression désactivée : historique de commandes à conserver.</small>}
              <h3>Historique des commandes</h3>
              {customer.orders.length ? <div className="admin-customer-orders">{customer.orders.map(order => <div key={order.id}><span><strong>{order.reference}</strong><small>{new Date(order.created_at).toLocaleDateString("fr-FR")}</small></span><span className={"order-status status-" + order.status}>{statuses[order.status] || order.status}</span><strong>{money(order.total)}</strong></div>)}</div> : <p className="customer-empty">Ce client n'a pas encore passé de commande.</p>}
            </div>
          </details>;
        })}
      </div>
    }
  </section>;
}
