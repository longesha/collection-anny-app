# Comptes clients et administrateur — Collection Anny

Les routes d'authentification sont disponibles sous `/api/auth` :
- `POST /register` : crée un compte client.
- `POST /login` : ouvre une session.
- `GET /me` : retourne le profil de l'utilisateur connecté (en-tête `Authorization: Bearer <token>`).

La table PostgreSQL `users` est créée automatiquement au premier appel d'authentification.

## Configuration obligatoire

Dans `backend/.env`, définir :
- `DATABASE_URL` : chaîne de connexion privée fournie par Neon.
- `JWT_SECRET` : secret unique d'au moins 32 caractères.
- `ADMIN_INVITE_CODE` : code privé pour créer un compte administrateur.

Ne jamais publier ces valeurs sur GitHub ni les communiquer aux clients. Les mots de passe sont hachés avec scrypt et ne sont jamais renvoyés à l'interface. Les sessions expirent après 7 jours.

La base utilisée par le backend est PostgreSQL. Les données présentes dans l'ancienne base MySQL locale ne sont pas automatiquement copiées : il faut effectuer une migration contrôlée avant de supprimer ou abandonner la base locale.