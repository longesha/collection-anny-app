import { Router } from "express";
import database from "../config/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
const router = Router();

async function ensureTables() {
  await database.query(`CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY, reference VARCHAR(40) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id), customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL, total NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','delivered','cancelled','cancellation_requested')),
    cancellation_note TEXT, stock_restored BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await database.query(`CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY, order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL, product_name VARCHAR(160) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL, quantity INTEGER NOT NULL CHECK (quantity > 0), line_total NUMERIC(12,2) NOT NULL
  )`);
}
router.use(async (_req,res,next)=>{try{await ensureTables();next();}catch(e){console.error(e);res.status(500).json({success:false,message:"Service des commandes indisponible."});}});
const ref=()=> "CA-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase();

router.post("/",requireAuth,async(req,res)=>{
 const items=Array.isArray(req.body?.items)?req.body.items:[];
 if(!items.length||items.length>30)return res.status(400).json({success:false,message:"Votre panier est vide ou invalide."});
 const client=await database.connect();
 try{
  await client.query("BEGIN");
  const ur=await client.query("SELECT id,name,phone FROM users WHERE id=$1 FOR UPDATE",[req.auth.sub]);
  if(!ur.rowCount){await client.query("ROLLBACK");return res.status(404).json({success:false,message:"Compte introuvable."});}
  const user=ur.rows[0];
  if(!user.phone?.trim()){await client.query("ROLLBACK");return res.status(400).json({success:false,message:"Ajoutez votre numéro de téléphone à votre profil avant de commander."});}
  const quantities=new Map();
  for(const item of items){const id=Number(item.id),q=Number(item.quantity);if(!Number.isInteger(id)||id<1||!Number.isInteger(q)||q<1||q>50){await client.query("ROLLBACK");return res.status(400).json({success:false,message:"Article invalide."});}quantities.set(id,(quantities.get(id)||0)+q);}
  const ids=[...quantities.keys()];
  const pr=await client.query("SELECT id,name,price,stock FROM products WHERE id=ANY($1::bigint[]) FOR UPDATE",[ids]);
  if(pr.rowCount!==ids.length){await client.query("ROLLBACK");return res.status(400).json({success:false,message:"Un produit n'est plus disponible."});}
  let total=0;const lines=[];
  for(const p of pr.rows){const q=quantities.get(Number(p.id));if(!q||Number(p.stock)<q){await client.query("ROLLBACK");return res.status(409).json({success:false,message:"Stock insuffisant pour "+p.name+"."});}const price=Number(p.price),lineTotal=price*q;total+=lineTotal;lines.push({id:p.id,name:p.name,price,quantity:q,lineTotal});}
  const reference=ref();
  const inserted=await client.query("INSERT INTO orders(reference,user_id,customer_name,customer_phone,total) VALUES($1,$2,$3,$4,$5) RETURNING *",[reference,user.id,user.name,user.phone,total]);
  for(const line of lines){await client.query("INSERT INTO order_items(order_id,product_id,product_name,unit_price,quantity,line_total) VALUES($1,$2,$3,$4,$5,$6)",[inserted.rows[0].id,line.id,line.name,line.price,line.quantity,line.lineTotal]);await client.query("UPDATE products SET stock=stock-$1,updated_at=NOW() WHERE id=$2",[line.quantity,line.id]);}
  await client.query("COMMIT");res.status(201).json({success:true,order:{...inserted.rows[0],items:lines}});
 }catch(e){await client.query("ROLLBACK");console.error("Create order:",e);res.status(500).json({success:false,message:"Impossible d'enregistrer la commande."});}finally{client.release();}
});

router.get("/mine",requireAuth,async(req,res)=>{
 try{const r=await database.query("SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC",[req.auth.sub]);const orders=await Promise.all(r.rows.map(async o=>{const i=await database.query("SELECT product_name,unit_price,quantity,line_total FROM order_items WHERE order_id=$1 ORDER BY id",[o.id]);return {...o,items:i.rows};}));res.json({success:true,orders});}
 catch(e){console.error(e);res.status(500).json({success:false,message:"Impossible de charger vos commandes."});}
});
router.post("/:id/cancel-request",requireAuth,async(req,res)=>{
 try{const r=await database.query("UPDATE orders SET status='cancellation_requested',cancellation_note='Demande envoyée par WhatsApp',updated_at=NOW() WHERE id=$1 AND user_id=$2 AND status IN ('pending','confirmed') RETURNING reference",[req.params.id,req.auth.sub]);if(!r.rowCount)return res.status(409).json({success:false,message:"Cette commande ne peut plus être annulée depuis votre espace."});res.json({success:true,reference:r.rows[0].reference});}
 catch(e){console.error(e);res.status(500).json({success:false,message:"Impossible d'enregistrer la demande."});}
});
router.get("/admin",requireAuth,requireAdmin,async(_req,res)=>{
 try{const r=await database.query(`SELECT o.*,u.email AS customer_email,COALESCE(json_agg(json_build_object('name',i.product_name,'price',i.unit_price,'quantity',i.quantity,'line_total',i.line_total)) FILTER(WHERE i.id IS NOT NULL),'[]') AS items FROM orders o JOIN users u ON u.id=o.user_id LEFT JOIN order_items i ON i.order_id=o.id GROUP BY o.id,u.email ORDER BY o.created_at DESC`);res.json({success:true,orders:r.rows});}
 catch(e){console.error(e);res.status(500).json({success:false,message:"Impossible de charger les commandes."});}
});
router.put("/admin/:id/status",requireAuth,requireAdmin,async(req,res)=>{
 const allowed=["confirmed","preparing","delivered","cancelled"];if(!allowed.includes(req.body?.status))return res.status(400).json({success:false,message:"Statut invalide."});
 const c=await database.connect();try{await c.query("BEGIN");const f=await c.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE",[req.params.id]);if(!f.rowCount){await c.query("ROLLBACK");return res.status(404).json({success:false,message:"Commande introuvable."});}const o=f.rows[0];if(["cancelled","delivered"].includes(o.status)){await c.query("ROLLBACK");return res.status(409).json({success:false,message:"Commande déjà terminée."});}
 if(req.body.status==="cancelled"&&!o.stock_restored){const its=await c.query("SELECT product_id,quantity FROM order_items WHERE order_id=$1",[o.id]);for(const i of its.rows)if(i.product_id)await c.query("UPDATE products SET stock=stock+$1,updated_at=NOW() WHERE id=$2",[i.quantity,i.product_id]);}
 const u=await c.query("UPDATE orders SET status=$1,stock_restored=$2,updated_at=NOW() WHERE id=$3 RETURNING *",[req.body.status,o.stock_restored||req.body.status==="cancelled",o.id]);await c.query("COMMIT");res.json({success:true,order:u.rows[0]});
 }catch(e){await c.query("ROLLBACK");console.error(e);res.status(500).json({success:false,message:"Impossible de modifier le statut."});}finally{c.release();}
});
export default router;
