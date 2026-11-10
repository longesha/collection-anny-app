# Cahier des charges — Collection Anny

## 1. Présentation
Collection Anny est une boutique en ligne spécialisée dans les vêtements et accessoires féminins. Le service vise d'abord les clientes de Lubumbashi, avec une possibilité de vente et de livraison dans d'autres villes de la RDC.

## 2. Problématique
La découverte des articles, la vérification des prix et des disponibilités ainsi que la prise de commande peuvent être dispersées entre plusieurs canaux de communication. La boutique a besoin d'un espace numérique centralisé, accessible et facile à utiliser.

## 3. Objectif général
Concevoir et réaliser une application web permettant de présenter les articles de Collection Anny et de gérer le processus de commande.

## 4. Objectifs spécifiques
- Présenter les produits avec des informations fiables et des photos.
- Organiser les produits par catégories.
- Permettre la recherche et le filtrage des articles.
- Permettre aux clientes de constituer un panier et d'envoyer une commande.
- Permettre à l'équipe de gérer les produits, les stocks et les commandes.
- Faciliter le contact avec la boutique et l'organisation de la livraison.

## 5. Acteurs
- **Visiteur :** consulte les pages publiques et le catalogue.
- **Cliente :** consulte les produits, gère son panier et passe des commandes.
- **Administrateur :** gère les produits, catégories, stocks, clientes et commandes.

## 6. Exigences fonctionnelles

### 6.1 Catalogue
- Afficher les produits disponibles.
- Afficher les détails : nom, description, prix, photos, tailles, couleurs et stock.
- Classer les articles par catégories.
- Rechercher et filtrer les produits.

### 6.2 Panier et commandes
- Ajouter et retirer un article du panier.
- Modifier les quantités.
- Calculer le sous-total.
- Saisir les informations nécessaires à la commande.
- Enregistrer la commande et son statut.

### 6.3 Comptes et administration
- Prévoir l'inscription et la connexion des clientes.
- Protéger les fonctions réservées à l'administration.
- Ajouter, modifier et désactiver les produits.
- Consulter et mettre à jour les commandes.
- Suivre les quantités en stock.

### 6.4 Livraison et paiement
- Enregistrer l'adresse et les coordonnées de livraison.
- Prévoir plusieurs modes de paiement selon les solutions réellement disponibles.
- Enregistrer le statut du paiement sans prétendre qu'un paiement est confirmé avant vérification.

### 6.5 Contact
- Faciliter le contact avec la boutique, notamment par WhatsApp.

## 7. Exigences non fonctionnelles
- Interface responsive pour téléphone, tablette et ordinateur.
- Navigation claire et accessible.
- Validation des données côté client et côté serveur.
- Mots de passe stockés sous forme hachée.
- Protection des routes et des opérations d'administration.
- Secrets et identifiants conservés dans des variables d'environnement.
- Gestion cohérente des erreurs et des stocks.

## 8. Technologies envisagées
- React.js + Vite pour le frontend.
- Node.js + Express pour l'API.
- MySQL pour la persistance des données.
- Git et GitHub pour le suivi du code.

## 9. Périmètre initial (MVP)
La première version doit permettre de consulter le catalogue, voir une fiche produit, gérer un panier et transmettre une commande. L'administration des produits et des commandes sera ajoutée dans les premières étapes du développement.

Les paiements en ligne et les intégrations de livraison seront intégrés après validation des prestataires et de leurs conditions techniques.

## 10. Critères de réussite
- Les pages principales fonctionnent sur mobile et ordinateur.
- Les produits affichés proviennent de la base de données.
- Une cliente peut préparer et soumettre une commande.
- L'administrateur peut gérer les produits et consulter les commandes.
- Les données sensibles sont protégées.
- Les erreurs de validation sont compréhensibles.

## 11. Points à confirmer avec la responsable de la boutique
- Devise d'affichage des prix (USD, CDF ou les deux).
- Zones et tarifs de livraison.
- Moyens de paiement réellement acceptés.
- Politique de réservation, annulation et retour.
- Coordonnées WhatsApp et réseaux sociaux officiels.
- Tailles, couleurs et catégories réellement utilisées.
