# GitHub Actions : Automatisation sans PC local

**Document d'explication - RAD Error Decoder**
**Date :** Novembre 2025
**Projet :** https://github.com/paneuropeennefiles-cmyk/rad-error-decoder

---

## 📋 Table des matières

1. [Réponse courte](#réponse-courte)
2. [Fonctionnement détaillé](#fonctionnement-détaillé)
3. [Qu'est-ce qu'un GitHub Runner ?](#quest-ce-quun-github-runner)
4. [Comparaison : Local vs GitHub Actions](#comparaison--local-vs-github-actions)
5. [Workflow 100% cloud](#workflow-100-cloud)
6. [Quand ai-je besoin de mon PC local ?](#quand-ai-je-besoin-de-mon-pc-local)
7. [Sécurité & Permissions](#sécurité--permissions)
8. [Architecture complète](#architecture-complète)
9. [Conclusion](#conclusion)

---

## Réponse courte

### 🎯 GitHub Actions fonctionne uniquement sur GitHub !

**Points clés :**
- ✅ **Aucun PC local nécessaire** (ni allumé, ni connecté)
- ✅ Tout s'exécute sur les **serveurs de GitHub** (runners Ubuntu)
- ✅ Une fois le workflow poussé, c'est **complètement autonome**
- ✅ Votre PC peut être éteint, en vacances, n'importe où !

**En d'autres termes :**
Une fois que vous avez poussé le fichier `.github/workflows/update-rad.yml` sur GitHub, votre PC n'est PLUS DU TOUT nécessaire pour les mises à jour automatiques.

---

## Fonctionnement détaillé

### Quand vous poussez le workflow sur GitHub

```
Votre PC local (Windows)
    ↓
    git push
    ↓
GitHub Repository (serveurs GitHub)
    ↓
Workflow stocké dans .github/workflows/update-rad.yml
```

**À partir de ce moment, votre PC n'est PLUS nécessaire !**

### Quand le workflow s'exécute (tous les jeudis 8h UTC)

```
1. GitHub Actions Scheduler (Horloge de GitHub)
      ↓
   Déclenche le workflow automatiquement

2. GitHub Runner (Machine virtuelle Ubuntu créée temporairement)
      ↓
   Clone votre dépôt depuis GitHub

3. Installation des dépendances
      ↓
   pip install requests beautifulsoup4 pandas openpyxl

4. Téléchargement des RAD
      ↓
   rad_downloader.py télécharge depuis EUROCONTROL

5. Parsing des fichiers
      ↓
   rad_parser.py convertit Excel → JSON

6. Commit automatique
      ↓
   git commit + git push vers votre dépôt

7. Déploiement automatique
      ↓
   GitHub Pages rebuild l'application

8. Destruction du Runner
      ↓
   La machine virtuelle est détruite (économie de ressources)
```

**Tout se passe sur les serveurs de GitHub !**

---

## Qu'est-ce qu'un GitHub Runner ?

Un **GitHub Runner** est une **machine virtuelle temporaire** fournie par GitHub pour exécuter votre workflow.

### Caractéristiques techniques

```
GitHub Runner
├─ Système d'exploitation : Ubuntu 22.04 LTS
├─ CPU : 2 cores
├─ RAM : 7 GB
├─ Stockage : 14 GB SSD
├─ Durée de vie : Uniquement pendant l'exécution (~3-5 minutes)
├─ Coût pour vous : GRATUIT (2000 minutes/mois incluses)
└─ Après exécution : Destruction automatique
```

### Analogie simple

C'est comme si GitHub vous **prêtait un ordinateur virtuel** pendant 5 minutes :
- Vous lui donnez des instructions (le workflow YAML)
- Il exécute vos commandes
- Il rend le résultat (commit dans votre dépôt)
- Puis il disparaît (destruction de la VM)

**Vous n'avez pas besoin de fournir l'ordinateur, GitHub s'en charge !**

---

## Comparaison : Local vs GitHub Actions

### Tableau comparatif

| Aspect | PC Local (Task Scheduler) | GitHub Actions |
|--------|---------------------------|----------------|
| **PC allumé 24/7** | ✅ OUI - Obligatoire | ❌ NON - Pas nécessaire |
| **Consommation électrique** | 💰 ~10€/mois | 🆓 Gratuit (inclus) |
| **Où ça s'exécute** | Votre PC Windows | Serveurs GitHub (Ubuntu) |
| **Maintenance** | Vous (Windows updates, etc.) | GitHub (zéro maintenance) |
| **En vacances** | ❌ Arrête de fonctionner | ✅ Continue de tourner |
| **Panne de PC** | ❌ Plus de mises à jour | ✅ Continue normalement |
| **Coupure Internet** | ❌ Arrête de fonctionner | ✅ Continue normalement |
| **Déménagement** | ⚠️ Reconfiguration nécessaire | ✅ Aucun impact |
| **Accès depuis smartphone** | ❌ Difficile | ✅ GitHub mobile app |
| **Logs** | ⚠️ Fichiers locaux | ✅ Interface web GitHub |
| **Rollback** | ⚠️ Manuel | ✅ Git history automatique |

### Coût sur 1 an

**PC Local (Task Scheduler Windows) :**
```
Électricité : 10€/mois × 12 = 120€/an
Usure PC : ~50€/an (ventilateurs, disque)
Total : ~170€/an
```

**GitHub Actions :**
```
Coût : 0€/an (2000 minutes/mois gratuit)
Maintenance : 0€/an
Total : 0€/an
```

**Économie : 170€/an**

---

## Workflow 100% cloud

### Diagramme détaillé

```
┌───────────────────────────────────────────────────────────┐
│                INFRASTRUCTURE GITHUB                      │
│                  (Tout est dans le cloud)                 │
└───────────────────────────────────────────────────────────┘

1. ⏰ Jeudi 8h00 UTC
   │
   ├─> GitHub Scheduler déclenche automatiquement
   │
   └─> Aucune intervention humaine nécessaire

2. 🖥️ Création du Runner
   │
   ├─> GitHub instancie une VM Ubuntu 22.04
   │
   └─> RAM : 7GB, CPU : 2 cores, SSD : 14GB

3. 📥 Clonage du dépôt
   │
   ├─> git clone https://github.com/paneuropeennefiles-cmyk/...
   │
   └─> Tous les fichiers du projet sont copiés dans le Runner

4. 🐍 Installation de Python et dépendances
   │
   ├─> Python 3.12 (déjà préinstallé)
   ├─> pip install requests beautifulsoup4
   ├─> pip install pandas openpyxl
   │
   └─> Durée : ~30 secondes

5. 🌐 Téléchargement depuis EUROCONTROL
   │
   ├─> Exécution de scripts/rad_downloader.py
   ├─> Scraping de https://www.nm.eurocontrol.int/RAD/
   ├─> Télécharge RAD_2511_v1_19.xlsx (Current)
   ├─> Télécharge RAD_2512_v1_9.xlsx (Future)
   │
   └─> Durée : ~20 secondes

6. 📊 Parsing des fichiers Excel
   │
   ├─> Exécution de scripts/rad_parser.py
   ├─> Parse RAD Current → rad-data-current.json (16 MB)
   ├─> Parse RAD Future → rad-data-future.json (16 MB)
   ├─> Création de metadata-current.json
   ├─> Création de metadata-future.json
   ├─> Création de rad-versions.json
   │
   └─> Durée : ~2 minutes

7. 🔍 Vérification des changements
   │
   ├─> git diff --cached
   ├─> Compare avec les versions précédentes
   │
   └─> Si identique : Arrêt ici (pas de commit inutile)

8. ✅ Commit des changements (si modifiés)
   │
   ├─> git config user.name "github-actions[bot]"
   ├─> git config user.email "github-actions[bot]@users.noreply.github.com"
   ├─> git commit -m "Auto-update RAD: cycles 2511/2512"
   ├─> git push origin main
   │
   └─> Durée : ~10 secondes

9. 🚀 Déploiement automatique (GitHub Pages)
   │
   ├─> Le push déclenche automatiquement le workflow de déploiement
   ├─> Build du frontend (Vite)
   ├─> Déploiement sur GitHub Pages
   │
   └─> Application mise à jour en production

10. 🗑️ Destruction du Runner
    │
    ├─> Tous les fichiers temporaires sont supprimés
    ├─> La VM Ubuntu est détruite
    │
    └─> Économie de ressources

TOTAL : ~4-5 minutes
```

**Votre PC n'intervient JAMAIS dans ce processus !**

---

## Quand ai-je besoin de mon PC local ?

### Cas où votre PC est nécessaire

#### 1. Développement et modifications du code

**Exemples :**
- Modifier l'interface utilisateur (App.jsx, Header.jsx)
- Ajouter de nouvelles fonctionnalités
- Corriger des bugs
- Améliorer le design

**Workflow :**
```
PC Local
  ↓
Édition du code
  ↓
Test local : npm run dev
  ↓
git add + git commit
  ↓
git push origin main
  ↓
GitHub déploie automatiquement
```

#### 2. Tester localement avant de déployer

**Commandes :**
```bash
cd frontend
npm install
npm run dev
# Ouvrir http://localhost:5174/
```

**Pourquoi ?**
- Vérifier que l'interface fonctionne correctement
- Tester le sélecteur de versions
- S'assurer qu'il n'y a pas de bugs

#### 3. Récupérer les mises à jour automatiques (optionnel)

**Si vous voulez les dernières données JSON en local :**
```bash
git pull origin main
```

**Mais pas obligatoire !** L'application en production est automatiquement mise à jour.

---

### Cas où votre PC N'EST PAS nécessaire

#### ❌ Mise à jour automatique des RAD

- **Téléchargement** : GitHub Actions ✅
- **Parsing** : GitHub Actions ✅
- **Commit** : GitHub Actions ✅
- **Déploiement** : GitHub Pages ✅

**PC local : AUCUN BESOIN**

#### ❌ Surveillance des exécutions

- **Via smartphone** : GitHub mobile app
- **Via navigateur** : GitHub.com → Actions tab
- **Notifications email** : Automatiques en cas d'échec

**PC local : AUCUN BESOIN**

#### ❌ Correction d'une exécution échouée

Si le workflow échoue (ex : EUROCONTROL down), GitHub retente automatiquement ou vous pouvez :
- Cliquer "Re-run workflow" depuis l'interface web
- Depuis n'importe quel appareil (smartphone, tablette, cyber-café...)

**PC local : AUCUN BESOIN**

---

## Sécurité & Permissions

### Question légitime

**"Comment GitHub peut-il pusher sur mon dépôt sans mes identifiants ?"**

### Réponse : Permissions du workflow

Dans le fichier `.github/workflows/update-rad.yml` :

```yaml
permissions:
  contents: write  # Autorise l'écriture dans le dépôt
```

### Comment ça fonctionne ?

```
1. Vous créez le workflow et le poussez sur GitHub
   ↓
2. GitHub enregistre ce workflow dans votre dépôt
   ↓
3. Quand le workflow s'exécute :
   ├─ GitHub crée un token d'accès TEMPORAIRE
   ├─ Ce token a les permissions définies (contents: write)
   ├─ Le token est valide UNIQUEMENT pendant l'exécution
   └─ Le token est automatiquement révoqué après

RÉSULTAT : Sécurisé et traçable
```

### Garanties de sécurité

✅ **Permissions limitées** :
- Le workflow ne peut que modifier le contenu du dépôt
- Pas d'accès à vos autres dépôts
- Pas d'accès à vos secrets personnels

✅ **Traçabilité complète** :
- Tous les commits sont signés "github-actions[bot]"
- Logs complets de chaque exécution
- Historique Git conservé

✅ **Révocable à tout moment** :
- Supprimer le fichier `.github/workflows/update-rad.yml`
- Désactiver le workflow dans Settings → Actions

✅ **Aucun accès à vos credentials** :
- Le workflow n'utilise PAS votre mot de passe GitHub
- Le workflow n'utilise PAS vos SSH keys
- Tout est géré par des tokens temporaires GitHub

---

## Architecture complète

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE GITHUB                      │
│                    (Cloud complet)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  GitHub Repository                              │   │
│  │  paneuropeennefiles-cmyk/rad-error-decoder     │   │
│  │                                                  │   │
│  │  ├─ 📂 Code source                              │   │
│  │  │   ├─ frontend/src/App.jsx                   │   │
│  │  │   ├─ frontend/src/components/Header.jsx     │   │
│  │  │   └─ scripts/rad_downloader.py              │   │
│  │  │                                               │   │
│  │  ├─ 📂 Workflows                                │   │
│  │  │   └─ .github/workflows/update-rad.yml       │   │
│  │  │                                               │   │
│  │  └─ 📂 Données JSON                             │   │
│  │      ├─ frontend/public/rad-data-current.json  │   │
│  │      ├─ frontend/public/rad-data-future.json   │   │
│  │      └─ frontend/public/rad-versions.json      │   │
│  └────────────────────────────────────────────────┘   │
│                           ↓ ↑                           │
│  ┌────────────────────────────────────────────────┐   │
│  │  GitHub Actions Scheduler                       │   │
│  │                                                  │   │
│  │  ⏰ Cron: 0 8 * * 4                            │   │
│  │  (Tous les jeudis à 8h00 UTC)                  │   │
│  │                                                  │   │
│  │  ✅ Déclenche automatiquement le workflow      │   │
│  └────────────────────────────────────────────────┘   │
│                           ↓                             │
│  ┌────────────────────────────────────────────────┐   │
│  │  GitHub Runner (VM Ubuntu)                      │   │
│  │                                                  │   │
│  │  📥 1. Clone le dépôt                           │   │
│  │  🐍 2. Install Python + dépendances            │   │
│  │  🌐 3. Télécharge RAD depuis EUROCONTROL       │   │
│  │  📊 4. Parse Excel → JSON                       │   │
│  │  🔍 5. Vérifie si versions changées            │   │
│  │  ✅ 6. Commit + Push (si changements)          │   │
│  │                                                  │   │
│  │  Durée totale : ~4-5 minutes                    │   │
│  │  Puis : Destruction automatique de la VM       │   │
│  └────────────────────────────────────────────────┘   │
│                           ↓                             │
│  ┌────────────────────────────────────────────────┐   │
│  │  GitHub Pages                                   │   │
│  │                                                  │   │
│  │  🔨 Rebuild automatique après chaque push      │   │
│  │  🚀 Deploy vers : rad-error-decoder.github.io  │   │
│  │                                                  │   │
│  │  Durée : ~2-3 minutes                           │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
                            │
                   Accès via Internet
                            │
                            ↓
                    ┌───────────────┐
                    │  👨‍✈️ Pilotes   │
                    │               │
                    │  Accèdent à   │
                    │  l'application│
                    └───────────────┘
```

### Où se trouve quoi ?

| Élément | Localisation | Toujours disponible ? |
|---------|-------------|----------------------|
| Code source | GitHub Repository | ✅ Oui (24/7) |
| Workflows | GitHub Repository | ✅ Oui (24/7) |
| Données JSON | GitHub Repository | ✅ Oui (24/7) |
| Exécution du workflow | GitHub Runner (temporaire) | ⏰ Jeudi 8h uniquement |
| Application déployée | GitHub Pages | ✅ Oui (24/7) |
| **Votre PC** | **Chez vous** | **❌ Pas nécessaire** |

---

## Conclusion

### Résumé en 3 points

1. **GitHub Actions = 100% Cloud**
   - Tout s'exécute sur les serveurs de GitHub
   - Aucun PC local nécessaire
   - Gratuit jusqu'à 2000 minutes/mois

2. **Automatisation complète**
   - Téléchargement automatique tous les jeudis
   - Parsing et déploiement automatiques
   - Vous pouvez partir en vacances tranquille

3. **Zéro maintenance**
   - Pas de PC à laisser allumé
   - Pas d'électricité gaspillée
   - Pas de maintenance logicielle

### Votre rôle

**Vous n'intervenez que pour :**
- ✏️ Développer de nouvelles fonctionnalités
- 🧪 Tester localement
- 📤 Pousser vers GitHub

**GitHub Actions s'occupe de :**
- ⏰ Déclencher le workflow automatiquement
- 📥 Télécharger les RAD
- 📊 Parser en JSON
- ✅ Commiter et pousser
- 🚀 Déployer l'application

### Économie réalisée

```
Solution PC Local :
- Électricité : ~120€/an
- Usure matériel : ~50€/an
- Total : ~170€/an

Solution GitHub Actions :
- Coût : 0€/an
- Total : 0€/an

ÉCONOMIE : 170€/an
```

### Fiabilité

```
PC Local : Disponibilité ~95%
- Pannes : 2%
- Coupures électricité : 1%
- Maintenance : 2%

GitHub Actions : Disponibilité ~99.9%
- Infrastructure redondante
- Serveurs professionnels
- Monitoring 24/7
```

### Écologie

**PC Local allumé 24/7 :**
- Consommation : ~50W × 24h × 365j = 438 kWh/an
- CO2 : ~88 kg/an (France, mix électrique)

**GitHub Actions :**
- VM allumée : 5 min/semaine = ~4h/an
- Consommation : ~0.2 kWh/an
- CO2 : ~0.04 kg/an

**Réduction CO2 : 99.95%** 🌱

---

## Annexe : Questions fréquentes

### Q1 : Que se passe-t-il si EUROCONTROL est en panne ?

**Réponse :**
- Le workflow détecte l'erreur
- Il échoue proprement (pas de commit)
- Vous recevez un email de notification
- Le workflow réessayera jeudi prochain
- Vos données actuelles restent intactes

### Q2 : Puis-je lancer le workflow manuellement ?

**Réponse :**
Oui ! Via l'interface GitHub :
1. GitHub → Repository → Actions
2. Sélectionner "Auto-update RAD"
3. Cliquer "Run workflow"
4. Peut être fait depuis n'importe quel appareil

### Q3 : Comment voir les logs d'exécution ?

**Réponse :**
1. GitHub → Repository → Actions
2. Cliquer sur une exécution
3. Logs détaillés de chaque étape
4. Durée, erreurs, résultats

### Q4 : Puis-je désactiver l'automatisation ?

**Réponse :**
Oui, plusieurs méthodes :
- Supprimer `.github/workflows/update-rad.yml`
- Settings → Actions → Disable workflow
- Commenter la ligne `schedule:` dans le YAML

### Q5 : Que se passe-t-il si je supprime mon PC local ?

**Réponse :**
**Rien du tout !** L'automatisation continue de fonctionner normalement. Votre PC n'est nécessaire que pour développer du nouveau code.

---

**Document créé le :** 11 novembre 2025
**Projet :** RAD Error Decoder
**GitHub :** https://github.com/paneuropeennefiles-cmyk/rad-error-decoder
**Automatisation :** GitHub Actions
**Coût :** 0€
**Maintenance :** 0 minutes

---

*Ce document peut être imprimé ou converti en PDF pour archivage.*
