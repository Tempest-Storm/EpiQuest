# ⚡ EpiQuest

> Jeu interactif accessible par QR code pour les Journées Portes Ouvertes d'Epitech.

![Status](https://img.shields.io/badge/status-en%20développement-yellow)
![Tek](https://img.shields.io/badge/Epitech-Tek2-blue)
![Type](https://img.shields.io/badge/type-Projet%20Libre-purple)

🔗 **Démo en ligne : [epiquest.vercel.app](https://epiquest.vercel.app)**

---

## 🎯 C'est quoi ?

EpiQuest est une web app qui permet aux visiteurs d'une JPO Epitech de découvrir l'école de façon ludique. Ils scannent un QR code affiché sur le stand, jouent à des mini-jeux sur Epitech, et s'affrontent sur un leaderboard en temps réel — sans aucune installation.

---

## ✨ Fonctionnalités

- 📱 **Accès par QR code** — aucune installation, fonctionne sur tous les smartphones
- 🔐 **Connexion Google** — profil joueur (pseudo + avatar) en un clic
- 🎮 **Trois jeux** partageant le même compte et un leaderboard par jeu :
  - 🧠 **Quiz Epitech** — questions sur la pédagogie, l'histoire et la vie étudiante (tirage aléatoire dans un pool)
  - 🃏 **Mémoire Epitech** — retrouve les paires le plus vite possible
  - 🧩 **Code dans l'ordre** — remets les lignes d'un extrait de code dans le bon ordre
- 🏆 **Leaderboard live** — classement par jeu, mis à jour en temps réel via WebSocket

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express |
| Base de données | PostgreSQL |
| Temps réel | WebSocket (Socket.io) |
| Déploiement | Docker + VPS |

---

## 🚀 Lancer le projet

### Prérequis

- Node.js 18+ (le backend utilise le test runner intégré `node --test`)
- PostgreSQL en cours d'exécution
- Des identifiants OAuth Google (Google Cloud Console)

### Base de données

Crée une base vide :

```bash
createdb epiquest
```

Le backend applique automatiquement le schéma au démarrage (création des
tables `users`, `players`, `questions`) et insère un quiz Epitech par
défaut si la table `questions` est vide. Le schéma de référence est versionné
dans [`database/schema.sql`](database/schema.sql).

### Backend

```bash
cd backend
npm install
cp .env.example .env   # puis renseigne les variables (DB, secrets, OAuth Google)
npm run dev            # démarre l'API + WebSocket sur le PORT configuré
npm test               # lance la suite de tests
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # optionnel : VITE_API_URL (défaut http://localhost:3001)
npm run dev
```

> La configuration Docker sera ajoutée au fur et à mesure des sprints.

---

## 📁 Structure du projet

```
EpiQuest/
├── frontend/       # React app (Vite + Tailwind)
│   └── src/
│       ├── pages/        # Home, Games (hub), Quiz, Memory, CodeOrder, Leaderboard
│       ├── hooks/        # useAuth (session partagée entre les jeux)
│       └── lib/          # scoring pur & testable (score, memoryScore, codeScore)
├── backend/        # API REST + WebSocket (Express + Socket.io)
│   ├── index.js          # point d'entrée serveur
│   ├── auth.js           # middleware d'authentification JWT
│   ├── scoreGuard.js     # validation anti-triche des scores par jeu
│   ├── seedQuestions.js  # pool de questions Epitech par défaut
│   └── test/             # tests (node --test)
└── database/       # Schéma SQL de référence
```

## ☁️ Déploiement

- **Frontend** → Vercel (config : `frontend/vercel.json`).
- **Backend + PostgreSQL** → Render (blueprint : `render.yaml`). Vercel ne peut
  pas héberger le serveur WebSocket persistant ni la base de données.

---

## 👥 Équipe

Projet réalisé par des étudiants Tek2 — Epitech Bénin.
TOGBE Naofal
OROUNLA Sèdjro
ONAMBELE Charly-Luck
ALAO OLAIFE
Kimberly DEGNON — Assistante Frontend Engineer

---

## 📄 Licence

MIT
