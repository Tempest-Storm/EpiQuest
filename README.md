# ⚡ EpiQuest

> Jeu interactif accessible par QR code pour les Journées Portes Ouvertes d'Epitech.

![Status](https://img.shields.io/badge/status-en%20développement-yellow)
![Tek](https://img.shields.io/badge/Epitech-Tek2-blue)
![Type](https://img.shields.io/badge/type-Projet%20Libre-purple)

---

## 🎯 C'est quoi ?

EpiQuest est une web app qui permet aux visiteurs d'une JPO Epitech de découvrir l'école de façon ludique. Ils scannent un QR code affiché sur le stand, jouent un quiz sur Epitech, et s'affrontent sur un leaderboard en temps réel — sans aucune installation.

---

## ✨ Fonctionnalités

- 📱 **Accès par QR code** — aucune installation, fonctionne sur tous les smartphones
- 🧠 **Quiz Epitech** — questions sur la pédagogie, l'histoire et la vie étudiante
- 🏆 **Leaderboard live** — classement mis à jour en temps réel via WebSocket
- 🎭 **Profil joueur** — pseudo + avatar personnalisé
- 🔧 **Dashboard admin** — gestion des questions sans toucher au code

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
├── backend/        # API REST + WebSocket (Express + Socket.io)
│   ├── index.js          # point d'entrée serveur
│   ├── auth.js           # middleware d'authentification JWT
│   ├── seedQuestions.js  # quiz Epitech par défaut
│   └── test/             # tests (node --test)
└── database/       # Schéma SQL de référence
```

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
