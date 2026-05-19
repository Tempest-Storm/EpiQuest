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

```bash
# Cloner le repo
git clone https://github.com/Tempest-Storm/EpiQuest.git
cd EpiQuest

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd ../backend
npm install
cp .env.example .env
npm run dev
```

> Les variables d'environnement et la config Docker seront ajoutées au fur et à mesure des sprints.

---

## 📁 Structure du projet

```
EpiQuest/
├── frontend/       # React app
├── backend/        # API REST + WebSocket
├── database/       # Schéma SQL et migrations
└── docs/           # Cahier des charges + maquettes
```

---

## 👥 Équipe

Projet réalisé par des étudiants Tek2 — Epitech Bénin.
TOGBE Naofal
OROUNLA Sèdjro
ONAMBELE Charly-Luck
ALAO OLAIFE

---

## 📄 Licence

MIT
