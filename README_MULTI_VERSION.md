# 📥 Mise à jour automatique multi-versions RAD

Ce document explique comment utiliser le nouveau système de gestion multi-versions des RAD (Current + Future).

## 🎯 Fonctionnalités

### Backend
- ✅ **Téléchargement automatique** : Récupère les RAD Current et Future depuis EUROCONTROL
- ✅ **Parsing intelligent** : Convertit chaque Excel en JSON optimisé
- ✅ **Métadonnées enrichies** : Extraction automatique du cycle, version, dates effectives
- ✅ **Structure multi-fichiers** :
  - `rad-data-current.json` / `rad-data-future.json`
  - `metadata-current.json` / `metadata-future.json`
  - `rad-versions.json` (index global)

### Frontend
- ✅ **Sélection automatique** : Choix intelligent basé sur la date effective du cycle AIRAC
- ✅ **Sélecteur manuel** : Interface utilisateur pour choisir la version (Auto / Current / Future)
- ✅ **Rétrocompatibilité** : Fallback automatique vers l'ancien système si les fichiers multi-versions n'existent pas

## 🚀 Utilisation

### Option 1 : Mise à jour automatique complète (RECOMMANDÉ)

```powershell
# Télécharge automatiquement Current + Future depuis EUROCONTROL
# Parse les deux fichiers
# Crée toutes les métadonnées
.\update_rad_multi.ps1
```

**Ce script fait tout automatiquement :**
1. Télécharge les RAD Current et Future depuis le site EUROCONTROL
2. Parse chaque fichier Excel en JSON
3. Crée les métadonnées avec cycles, versions, dates
4. Déploie tous les fichiers dans `frontend/public/`

### Option 2 : Téléchargement seul

```powershell
# Télécharge uniquement les fichiers RAD (sans parsing)
python scripts\rad_downloader.py --output-dir data\raw
```

**Options disponibles :**
- `--output-dir` : Répertoire de destination (default: `data/raw`)
- `--verbose` : Affichage détaillé

### Option 3 : Mise à jour manuelle (ancien système)

```powershell
# Si vous avez déjà un fichier RAD local
.\update_rad.ps1 -RadFile "data\raw\RAD_2512_v1_01.xlsx"
```

## 📁 Structure des fichiers

```
rad-error-decoder-main/
├── scripts/
│   ├── rad_downloader.py      ← Nouveau : Téléchargement automatique
│   ├── rad_parser.py           ← Existant : Parsing Excel → JSON
│   └── validate_rad.py
│
├── data/
│   └── raw/
│       ├── RAD_2511_vX_YY.xlsx              ← Current
│       ├── RAD_2512_vX_YY.xlsx              ← Future
│       └── rad_downloads_metadata.json       ← Métadonnées téléchargement
│
├── frontend/
│   └── public/
│       ├── rad-data-current.json            ← Données Current
│       ├── rad-data-future.json             ← Données Future
│       ├── metadata-current.json            ← Métadonnées Current
│       ├── metadata-future.json             ← Métadonnées Future
│       └── rad-versions.json                ← Index global
│
├── update_rad.ps1              ← Ancien : Mise à jour simple
└── update_rad_multi.ps1        ← Nouveau : Mise à jour automatique
```

## 🎨 Interface utilisateur

### Sélecteur de version

Dans l'interface web, cliquez sur le badge de version (en haut à droite) pour ouvrir le sélecteur :

- **🤖 Automatique** : Sélection intelligente basée sur la date
  - Si aujourd'hui < date effective Future → Charge Current
  - Si aujourd'hui ≥ date effective Future → Charge Future

- **🟢 Cycle Actuel** : Force l'utilisation du cycle actuel (CURRENT_AIRAC)

- **🔵 Cycle Futur** : Force l'utilisation du prochain cycle (AIRAC+1)

### Indication visuelle

- Badge **bleu** : Cycle Current chargé
- Badge **violet** : Cycle Future chargé
- Icône **🤖** : Mode automatique activé

## 🔧 Dépendances Python

Le script de téléchargement nécessite :

```bash
pip install requests beautifulsoup4 pandas openpyxl
```

## 📊 Métadonnées générées

### `rad-versions.json` (index global)
```json
{
  "lastUpdate": "2025-11-11T14:30:00Z",
  "versions": {
    "current": {
      "cycle": "2511",
      "effectiveDate": "2025-10-30",
      "version": "1.19"
    },
    "future": {
      "cycle": "2512",
      "effectiveDate": "2025-11-27",
      "version": "1.9"
    }
  }
}
```

### `metadata-current.json` / `metadata-future.json`
```json
{
  "cycle": "2511",
  "effectiveDate": "2025-10-30",
  "version": "1.19",
  "generatedAt": "2025-11-11T14:30:00Z",
  "source": "RAD_2511_v1_19.xlsx",
  "downloadedAt": "2025-11-11T14:25:00Z",
  "type": "current"
}
```

## 🧪 Test local

1. **Lancer la mise à jour** :
   ```powershell
   .\update_rad_multi.ps1
   ```

2. **Démarrer le frontend** :
   ```bash
   cd frontend
   npm run dev
   ```

3. **Ouvrir le navigateur** :
   - URL : http://localhost:5174/
   - Vérifier le badge de version en haut à droite
   - Cliquer sur le badge pour tester le sélecteur
   - Vérifier que les données chargent correctement

## 🔄 Workflow de mise à jour recommandé

```powershell
# 1. Télécharger et parser les nouvelles versions
.\update_rad_multi.ps1

# 2. Tester localement
cd frontend
npm run dev

# 3. Vérifier dans le navigateur
# → Tester le sélecteur de version
# → Vérifier les métadonnées affichées
# → Faire quelques recherches test

# 4. Commiter les changements
git add public/*.json
git commit -m "Update RAD to cycles 2511/2512"
git push origin main

# 5. Le déploiement se fait automatiquement via GitHub Actions
```

## 🐛 Dépannage

### Erreur de téléchargement
```
❌ Erreur lors du téléchargement
```
**Solution** : Vérifier la connexion Internet et que le site EUROCONTROL est accessible

### Fichiers manquants
```
❌ rad-data-current.json : NON TROUVÉ
```
**Solution** : Relancer le script `update_rad_multi.ps1` complet

### Parsing échoué
```
❌ Erreur lors du parsing de current
```
**Solution** :
1. Vérifier que pandas et openpyxl sont installés : `pip install pandas openpyxl`
2. Vérifier que le fichier Excel n'est pas corrompu

### Frontend ne charge pas les versions
**Solution** :
1. Vérifier que `rad-versions.json` existe dans `frontend/public/`
2. Ouvrir la console navigateur (F12) pour voir les erreurs
3. L'application bascule automatiquement en mode legacy si les fichiers multi-versions sont absents

## 📝 Notes importantes

- **Cycles AIRAC** : Les cycles changent tous les 28 jours
- **Mise à jour recommandée** : Lancer `update_rad_multi.ps1` à chaque nouveau cycle
- **Rétrocompatibilité** : L'ancien système (`update_rad.ps1`) reste fonctionnel
- **Fallback automatique** : Si les fichiers multi-versions n'existent pas, le frontend charge automatiquement `rad-data.json` (ancien système)

## 🎯 Avantages du nouveau système

| Fonctionnalité | Ancien système | Nouveau système |
|----------------|----------------|-----------------|
| Téléchargement | ❌ Manuel | ✅ Automatique |
| Versions gérées | 1 (écrasement) | 2 (current + future) |
| Sélection date | ❌ Non | ✅ Automatique |
| Interface choix | ❌ Non | ✅ Sélecteur UI |
| Métadonnées | ⚠️ Basiques | ✅ Enrichies |
| Planning anticipé | ❌ Non | ✅ Cycle futur disponible |

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les dépendances Python : `pip list`
2. Vérifier les logs détaillés : `python scripts\rad_downloader.py --verbose`
3. Consulter la console navigateur (F12) pour les erreurs frontend

---

**🎉 Profitez du nouveau système de gestion multi-versions !**
