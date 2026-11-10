# Collection Anny

Collection Anny est une application web de commerce en ligne dédiée à la vente de vêtements et d'accessoires féminins à Lubumbashi et dans toute la République démocratique du Congo.

## Technologies

- Frontend : React.js + Vite
- Backend : Node.js + Express
- Base de données : MySQL
- Gestion de versions : Git et GitHub

## Prérequis

- Node.js 20 ou une version plus récente
- npm
- MySQL Server
- Git

## Structure du dépôt

```text
collection-anny-app/
├── frontend/       # Interface React
├── backend/        # API Express
├── database/       # Schéma et scripts SQL
├── docs/           # Documentation
└── README.md
```

## Lancer le projet en local

### 1. Récupérer le dépôt

```bash
git clone https://github.com/longesha/collection-anny-app.git
cd collection-anny-app
```

### 2. Démarrer le frontend

Dans un premier terminal :

```bash
cd frontend
npm install
npm run dev
```

Vite affiche l'adresse locale du site, généralement `http://localhost:5173`.

### 3. Démarrer le backend

Dans un deuxième terminal, à partir de la racine du dépôt :

```bash
cd backend
npm install
```

Copier `.env.example` vers `.env`, puis adapter les paramètres à votre installation MySQL.

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Sous macOS/Linux :

```bash
cp .env.example .env
```

Démarrer ensuite l'API :

```bash
npm run dev
```

L'API sera disponible par défaut sur `http://localhost:5000`. Vérifier son état sur `http://localhost:5000/api/health`.

## Sécurité

- Ne jamais publier le fichier `.env`.
- Ne jamais placer de mot de passe ou de clé secrète dans le frontend.
- `.env.example` contient uniquement des noms de variables et des valeurs locales indicatives.

## Documentation

- [Cahier des charges](docs/cahier-des-charges.md)
- [Frontend](frontend/README.md)
- [Backend](backend/README.md)
- [Base de données](database/README.md)

## État du projet

- [x] Documentation initiale
- [x] Structure frontend et backend
- [x] Configuration de démarrage React/Vite et Express
- [ ] Conception du schéma MySQL
- [ ] Développement des fonctionnalités métier
- [ ] Tests et déploiement
