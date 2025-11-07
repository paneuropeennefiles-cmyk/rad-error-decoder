# RAD Error Decoder ✈️

> Application web pour décoder rapidement les erreurs de plan de vol en référençant le RAD (Route Availability Document) d'EUROCONTROL.

[![Deploy Status](https://github.com/[votre-compte]/rad-error-decoder/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/[votre-compte]/rad-error-decoder/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Problème résolu

Les pilotes reçoivent des erreurs comme :
```
RS: TRAFFIC VIA OMASI IS ON FORBIDDEN ROUTE REF:[LSLF1139C] RAD ANNEX 2B LSASFRA
```

Le fichier Excel RAD (>2MB, 10+ feuilles) est **illisible sur smartphone**. Cette app permet de :
- ✅ Coller l'erreur complète et obtenir la règle exacte
- ✅ Chercher par balise, aérodrome, route, FIR
- ✅ Fonctionner **hors-ligne** une fois chargée
- ✅ S'installer comme une **PWA native**

## 🚀 Demo

**Live:** https://[votre-compte].github.io/rad-error-decoder/

## 🏗️ Stack technique

- **Frontend:** React 18 + Vite + TailwindCSS
- **Recherche:** Fuse.js (recherche floue)
- **Cache:** IndexedDB + Service Worker
- **Hosting:** GitHub Pages (gratuit)
- **Parser:** Python 3.10+ (pandas + openpyxl)

## 📦 Installation

### Prérequis

```bash
node --version   # v18+
python --version # 3.10+
git --version
```

### Clone & Setup

```bash
# 1. Cloner
git clone https://github.com/[votre-compte]/rad-error-decoder.git
cd rad-error-decoder

# 2. Frontend
cd frontend
npm install

# 3. Python (pour parser RAD)
cd ../scripts
pip install -r requirements.txt

# 4. Retour à la racine
cd ..
```

## 🔧 Développement

### Lancer le dev server

```bash
cd frontend
npm run dev
```

Ouvrir http://localhost:5173

### Structure du projet

```
rad-error-decoder/
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/    # Composants UI
│   │   ├── services/      # Logique métier
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilitaires
│   ├── public/
│   │   ├── rad-data.json  # Données RAD compilées
│   │   └── metadata.json  # Métadonnées (cycle AIRAC)
│   └── package.json
├── scripts/               # Scripts Python
│   ├── rad_parser.py      # Excel → JSON
│   └── update_rad.sh      # Script de mise à jour
├── data/                  # Données RAD (gitignored)
└── docs/                  # Documentation
```

## 📊 Parser le RAD

### Première utilisation

```bash
# 1. Télécharger le RAD Excel depuis:
#    https://www.nm.eurocontrol.int/RAD/

# 2. Placer dans data/raw/
cp ~/Downloads/RAD_2511_v1_17.xlsx data/raw/

# 3. Parser
python scripts/rad_parser.py \
  data/raw/RAD_2511_v1_17.xlsx \
  frontend/public/rad-data.json

# Cela génère:
# - frontend/public/rad-data.json (~500KB)
# - Structure optimisée pour recherche
```

### Mise à jour mensuelle (tous les 28 jours)

```bash
# Script automatisé
./scripts/update_rad.sh data/raw/RAD_2512_v1_01.xlsx

# Ce script:
# 1. Parse Excel → JSON
# 2. Valide structure
# 3. Copie vers frontend/public/
# 4. Met à jour metadata.json
# 5. Crée commit Git
```

## 🌐 Déploiement

### GitHub Pages (recommandé)

```bash
# 1. Créer repo sur GitHub

# 2. Pousser le code
git remote add origin https://github.com/[votre-compte]/rad-error-decoder.git
git push -u origin main

# 3. Activer GitHub Pages
#    Settings → Pages → Source: GitHub Actions

# 4. Le déploiement est automatique via .github/workflows/deploy.yml
```

Le site sera accessible à : `https://[votre-compte].github.io/rad-error-decoder/`

### Build local

```bash
cd frontend
npm run build

# Les fichiers sont dans frontend/dist/
# Testez avec: npm run preview
```

## 🔄 Workflow de mise à jour AIRAC

**Tous les 28 jours :**

1. Télécharger nouveau RAD Excel
2. `./scripts/update_rad.sh data/raw/RAD_XXXX_vX_XX.xlsx`
3. `git push origin main`
4. GitHub Actions déploie automatiquement (~2 min)

## 🧪 Tests

```bash
# Frontend
cd frontend
npm run test

# Parser Python
cd scripts
python -m pytest test_rad_parser.py
```

## 📱 Utilisation

### Décoder une erreur

```
1. Copier l'erreur eurofpl complète
2. Coller dans la barre de recherche
3. ✅ Résultat affiché avec détails
```

### Recherche libre

```
- Balise:     OMASI
- Aérodrome:  LSGG
- Route:      L856
- FIR:        LSAS
- ID direct:  LS2857
```

### Mode hors-ligne

```
1. Ouvrir l'app une fois (télécharge ~500KB)
2. Installer en PWA (bouton "Ajouter à l'écran d'accueil")
3. Fonctionne entièrement sans connexion
```

## 🛠️ Scripts disponibles

```bash
# Frontend
npm run dev          # Dev server
npm run build        # Build production
npm run preview      # Preview build local
npm run lint         # ESLint

# Parser
python scripts/rad_parser.py <input.xlsx> <output.json>
python scripts/validate_rad.py <rad-data.json>
./scripts/update_rad.sh <rad-file.xlsx>
```

## 📚 Documentation

- [Guide utilisateur](docs/USER_GUIDE.md)
- [Guide de déploiement](docs/DEPLOYMENT.md)
- [Maintenance AIRAC](docs/MAINTENANCE.md)
- [Documentation technique](claude.md)

## 🤝 Contribution

Les contributions sont bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

MIT License - Voir [LICENSE](LICENSE)

## 👨‍💻 Auteur

Créé pour faciliter la vie des pilotes ✈️

## 🙏 Remerciements

- [EUROCONTROL](https://www.eurocontrol.int/) pour le RAD
- [eurofpl.eu](https://www.eurofpl.eu/) pour le système de dépôt
- Tous les pilotes qui utilisent cette app

---

**Questions ?** Ouvrez une [issue](https://github.com/[votre-compte]/rad-error-decoder/issues)
