# 🚀 Déploiement GitHub Pages - Guide complet

**Guide pour configurer le déploiement automatique de l'application RAD Error Decoder**

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration initiale (une seule fois)](#configuration-initiale)
3. [Déploiement automatique](#déploiement-automatique)
4. [Mise à jour du RAD après déploiement](#mise-à-jour-du-rad)
5. [Dépannage](#dépannage)

---

## 🎯 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Un compte GitHub (gratuit) : [https://github.com](https://github.com)
- ✅ Git installé sur votre ordinateur
- ✅ Le projet RAD Error Decoder cloné localement
- ✅ Node.js et Python installés (déjà fait si vous avez suivi GETTING_STARTED.md)

---

## ⚙️ Configuration initiale

### **Étape 1 : Créer un repository GitHub**

1. Connectez-vous sur [GitHub](https://github.com)

2. Cliquez sur **"New"** (ou le bouton "+" en haut à droite → "New repository")

3. **Configuration du repository :**
   ```
   Repository name: rad-error-decoder
   Description: Application web pour décoder les erreurs de plan de vol EUROCONTROL
   Visibility: ✓ Public (recommandé pour GitHub Pages gratuit)

   ❌ NE PAS cocher "Initialize with README"
   ```

4. Cliquez sur **"Create repository"**

5. **Copiez l'URL du repository** affichée (format : `https://github.com/[votre-compte]/rad-error-decoder.git`)

---

### **Étape 2 : Configurer Git localement**

Ouvrez PowerShell ou Invite de commandes dans le dossier du projet :

```powershell
cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder

# Initialiser Git (si pas déjà fait)
git init

# Configurer votre identité
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - RAD Error Decoder cycle 2511"

# Renommer la branche en 'main'
git branch -M main

# Lier au repository GitHub (REMPLACEZ [votre-compte] !)
git remote add origin https://github.com/[votre-compte]/rad-error-decoder.git

# Pousser vers GitHub
git push -u origin main
```

**🔑 Authentification GitHub :**

Lors du `git push`, GitHub vous demandera :
- **Username :** Votre nom d'utilisateur GitHub
- **Password :** Votre **Personal Access Token** (voir section ci-dessous)

---

### **Étape 3 : Créer un Personal Access Token (PAT)**

GitHub ne permet plus l'authentification par mot de passe. Vous devez créer un token :

1. Sur GitHub, cliquez sur votre **avatar** (en haut à droite) → **Settings**

2. Dans le menu de gauche, cliquez sur **"Developer settings"** (tout en bas)

3. Cliquez sur **"Personal access tokens"** → **"Tokens (classic)"**

4. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**

5. **Configuration du token :**
   ```
   Note: RAD Error Decoder - Update Token
   Expiration: No expiration (ou 1 year si vous préférez)

   Scopes (cochez UNIQUEMENT) :
   ✓ repo (Full control of private repositories)
   ```

6. Cliquez sur **"Generate token"**

7. ⚠️ **IMPORTANT :** Copiez le token `ghp_xxxxxxxxxxxxxxxxxxxx` et **sauvegardez-le** dans un endroit sûr
   - Vous ne pourrez plus le revoir !
   - Ce token sera votre "mot de passe" lors du `git push`

---

### **Étape 4 : Activer GitHub Pages**

1. Allez sur votre repository : `https://github.com/[votre-compte]/rad-error-decoder`

2. Cliquez sur **"Settings"** (⚙️ onglet en haut)

3. Dans le menu de gauche, cliquez sur **"Pages"**

4. **Configuration GitHub Pages :**
   ```
   Build and deployment
   └─ Source: ⦿ GitHub Actions (IMPORTANT : pas "Deploy from a branch")
   ```

5. **Sauvegardez** (si un bouton "Save" apparaît)

---

### **Étape 5 : Vérifier le workflow GitHub Actions**

Le fichier `.github/workflows/deploy.yml` doit déjà être présent dans le projet.

**Vérification :**

```powershell
# Vérifier que le fichier existe
dir .github\workflows\deploy.yml
```

Si le fichier existe ✅, passez à l'étape suivante.

Si le fichier n'existe pas ❌, contactez le support technique.

---

### **Étape 6 : Déclencher le premier déploiement**

Le déploiement se fera automatiquement lors du prochain push :

```powershell
# Petit changement pour déclencher un déploiement
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

**Suivre le déploiement :**

1. Allez sur votre repository GitHub

2. Cliquez sur l'onglet **"Actions"**

3. Vous verrez le workflow **"Deploy to GitHub Pages"** :
   - 🟡 **Jaune (en cours)** : Déploiement en cours... Attendez 2-3 minutes
   - ✅ **Vert (succès)** : Déploiement réussi !
   - ❌ **Rouge (échec)** : Erreur (voir logs pour détails)

4. **Cliquez sur le workflow** pour voir les détails en temps réel

---

### **Étape 7 : Accéder à votre application**

Une fois le déploiement réussi (✅ vert), votre application est en ligne !

🌐 **URL de l'application :**

```
https://[votre-compte].github.io/rad-error-decoder/
```

**Exemple :** Si votre compte GitHub est `aviation-tools`, l'URL sera :
```
https://aviation-tools.github.io/rad-error-decoder/
```

**Vérifications :**
- ✅ L'application s'affiche correctement
- ✅ Le cycle AIRAC est affiché (ex: 2511 v1.17)
- ✅ Les recherches fonctionnent
- ✅ Le certificat SSL est actif (cadenas 🔒 dans le navigateur)

---

## 🔄 Déploiement automatique

### **Comment ça fonctionne ?**

Une fois configuré, **TOUT se fait automatiquement** :

```
1. Vous modifiez le code (ou mettez à jour le RAD)
      ↓
2. Vous faites: git add . && git commit -m "..." && git push
      ↓
3. GitHub détecte le push sur la branche 'main'
      ↓
4. GitHub Actions démarre automatiquement:
   - Installation de Node.js
   - Installation des dépendances (npm ci)
   - Build de l'application (npm run build)
   - Déploiement sur GitHub Pages
      ↓
5. ✅ L'application est mise à jour (2-3 minutes)
      ↓
6. Tous les utilisateurs voient la nouvelle version
```

**Aucune intervention manuelle nécessaire !** 🎉

---

## 📝 Mise à jour du RAD après déploiement

Une fois l'application déployée, voici comment mettre à jour le RAD :

### **Option A : Utilisation du script PowerShell (RECOMMANDÉ)**

```powershell
cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder

# Placer le nouveau fichier RAD dans data\raw\
# Exemple: data\raw\RAD_2512_v1_01.xlsx

# Exécuter le script automatisé
.\update_rad.ps1 -RadFile "data\raw\RAD_2512_v1_01.xlsx"

# Le script va :
# 1. Parser Excel → JSON
# 2. Mettre à jour metadata.json
# 3. Créer un commit Git
# 4. Vous demander de faire git push
```

**Ensuite :**

```powershell
# Tester localement (RECOMMANDÉ)
cd frontend
npm run dev
# → Vérifier que tout fonctionne sur http://localhost:5174/

# Pousser vers GitHub (déploiement automatique)
git push origin main
```

### **Option B : Mise à jour manuelle (pas à pas)**

Suivez le guide détaillé : **[GUIDE_MISE_A_JOUR_RAD.md](./GUIDE_MISE_A_JOUR_RAD.md)**

---

## 🎯 Workflow complet de mise à jour RAD

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Télécharger nouveau RAD depuis EUROCONTROL               │
│    → Placer dans data\raw\RAD_XXXX_vX_XX.xlsx               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Exécuter le script PowerShell                            │
│    .\update_rad.ps1 -RadFile "data\raw\RAD_XXXX_vX_XX.xlsx" │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Tester localement                                        │
│    cd frontend                                              │
│    npm run dev                                              │
│    → Vérifier http://localhost:5174/                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Pousser vers GitHub                                      │
│    git push origin main                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. GitHub Actions déploie automatiquement (2-3 min)         │
│    → Suivre sur github.com/.../actions                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Vérifier l'application en production                     │
│    → https://[votre-compte].github.io/rad-error-decoder/    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Dépannage

### **Problème : Le déploiement GitHub Actions échoue (❌ rouge)**

**Solution :**

1. Cliquez sur le workflow en échec dans l'onglet "Actions"
2. Regardez les logs pour identifier l'erreur
3. Erreurs courantes :

   **a) Erreur lors de `npm ci` :**
   ```
   Solution: Supprimer frontend/package-lock.json localement
   → Faire: npm install
   → Commit et push
   ```

   **b) Erreur lors de `npm run build` :**
   ```
   Solution: Tester le build en local :
   → cd frontend
   → npm run build
   → Corriger les erreurs affichées
   ```

   **c) Permissions GitHub Pages :**
   ```
   Solution: Vérifier Settings → Pages → Source = "GitHub Actions"
   ```

---

### **Problème : `git push` demande un mot de passe mais le rejette**

**Solution :**

GitHub ne permet plus les mots de passe. Vous devez utiliser un **Personal Access Token** :

1. Créez un token (voir Étape 3 ci-dessus)
2. Lors du `git push` :
   - **Username :** votre nom d'utilisateur GitHub
   - **Password :** collez votre token `ghp_xxxxx` (PAS votre mot de passe !)

---

### **Problème : L'application affiche l'ancien cycle RAD**

**Solutions possibles :**

1. **Vider le cache du navigateur :**
   - Appuyez sur `Ctrl + Shift + R` (Windows/Linux)
   - ou `Cmd + Shift + R` (Mac)

2. **Vérifier que le déploiement a réussi :**
   - Allez sur GitHub → onglet "Actions"
   - Vérifiez que le dernier workflow est ✅ vert

3. **Vérifier les fichiers sur GitHub :**
   - Allez sur `frontend/public/metadata.json` sur GitHub
   - Vérifiez que le cycle est correct

---

### **Problème : "fatal: not a git repository"**

**Solution :**

```powershell
# Vous n'êtes pas dans le bon dossier
cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder

# Vérifier que c'est un repo Git
git status
```

---

### **Problème : Le serveur local ne démarre pas (npm run dev échoue)**

**Solution :**

```powershell
# Supprimer node_modules et réinstaller
cd frontend
rm -r node_modules
rm package-lock.json
npm install
npm run dev
```

---

## 📊 Architecture du déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                    VOTRE ORDINATEUR LOCAL                   │
│                                                             │
│  rad-error-decoder/                                         │
│  ├── frontend/                                              │
│  │   ├── src/                  (Code source React)          │
│  │   ├── public/                                            │
│  │   │   ├── rad-data.json     ← Données RAD                │
│  │   │   └── metadata.json     ← Métadonnées (cycle, etc.) │
│  │   └── package.json                                       │
│  ├── scripts/                                               │
│  │   └── rad_parser.py         ← Convertisseur Excel→JSON   │
│  └── .github/workflows/                                     │
│      └── deploy.yml            ← Configuration CI/CD        │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ git push origin main
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                         GITHUB                              │
│                                                             │
│  Repository: [votre-compte]/rad-error-decoder               │
│                                                             │
│  → Détecte le push sur 'main'                               │
│  → Déclenche GitHub Actions (deploy.yml)                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS                           │
│                                                             │
│  Étapes du workflow:                                        │
│  1. Checkout du code                                        │
│  2. Setup Node.js 18                                        │
│  3. npm ci (installation dépendances)                       │
│  4. npm run build (build Vite)                              │
│  5. Upload artifact (frontend/dist/)                        │
│  6. Deploy to GitHub Pages                                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB PAGES                           │
│                                                             │
│  URL: https://[votre-compte].github.io/rad-error-decoder/   │
│                                                             │
│  → CDN mondial (distribution rapide)                        │
│  → HTTPS automatique (SSL gratuit)                          │
│  → Mise à jour automatique à chaque push                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   UTILISATEURS FINAUX                       │
│                                                             │
│  → Pilotes, dispatcheurs, etc.                              │
│  → Accès instant depuis n'importe où                        │
│  → Version toujours à jour                                  │
│  → Fonctionne hors-ligne après premier chargement (PWA)     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de déploiement initial

Utilisez cette checklist pour votre première configuration :

- [ ] Compte GitHub créé
- [ ] Repository GitHub créé (`rad-error-decoder`)
- [ ] Personal Access Token (PAT) créé et sauvegardé
- [ ] Git configuré localement (user.name, user.email)
- [ ] Code poussé vers GitHub (`git push -u origin main`)
- [ ] GitHub Pages activé (Settings → Pages → Source: GitHub Actions)
- [ ] Premier workflow exécuté avec succès (Actions → ✅ vert)
- [ ] Application accessible en ligne (`https://[compte].github.io/rad-error-decoder/`)
- [ ] Tests effectués (recherches, affichage cycle AIRAC, etc.)
- [ ] Guide `GUIDE_MISE_A_JOUR_RAD.md` fourni à la personne en charge
- [ ] Script `update_rad.ps1` testé et fonctionnel

---

## 📞 Support

**Documentation complète :**
- Guide de mise à jour RAD : [GUIDE_MISE_A_JOUR_RAD.md](./GUIDE_MISE_A_JOUR_RAD.md)
- Guide de démarrage : [GETTING_STARTED.md](./GETTING_STARTED.md)
- README principal : [README.md](./README.md)

**Ressources externes :**
- Documentation GitHub Pages : https://docs.github.com/pages
- Documentation GitHub Actions : https://docs.github.com/actions
- Documentation Vite : https://vitejs.dev/guide/

---

**Document créé le :** 2025-11-07
**Dernière mise à jour :** 2025-11-07
**Version :** 1.0
