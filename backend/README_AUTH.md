# Comptes clients et administrateur — Collection Anny

Les routes d'authentification sont disponibles sous `/api/auth` :
- `POST /register` : crée un compte client.
- `POST /login` : ouvre une session.
- `GET /me` : retourne le profil de l'utilisateur connecté (en-tête `Authorization: Bearer <token>`).

La table MySQL `users` est créée automatiquement au premier appel d'authentification.

## Configuration obligatoire

Dans `backend/.env`, définir deux secrets uniques et privés :

```dotenv
JWT_SECRET=remplacer_par_une_cle_aleatoire_d_au_moins_32_caracteres
ADMIN_INVITE_CODE=choisir_un_code_secret_long_et_prive
```

Ne jamais publier ces valeurs sur GitHub ni les communiquer aux clients. Le code d'invitation est nécessaire pour créer un compte administrateur. Sans ce code, personne ne peut s'inscrire comme administrateur. Les clients peuvent créer leur compte normalement.

Les mots de passe sont hachés avec scrypt et ne sont jamais renvoyés à l'interface. Les sessions expirent après 7 jours.

**Important :** la création de compte et la connexion sont reliées à MySQL. Le tableau de bord d'administration, les commandes, les produits et le stock feront l'objet des modules suivants.
