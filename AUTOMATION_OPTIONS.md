# 🤖 Options d'automatisation pour la mise à jour RAD

Ce document compare les différentes solutions pour automatiser complètement le workflow de mise à jour des RAD.

## 📋 Workflow à automatiser

```
1. Télécharger RAD Current + Future depuis EUROCONTROL
2. Parser Excel → JSON
3. Vérifier si les versions ont changé
4. Si changement : Commit + Push → Déploiement automatique
```

---

## ✅ Solution 1 : GitHub Actions (RECOMMANDÉ)

### Avantages
- ✅ **Gratuit** : 2000 minutes/mois pour dépôts publics
- ✅ **Intégré** : Pas de configuration externe
- ✅ **Zéro maintenance** : Infrastructure gérée par GitHub
- ✅ **Logs visibles** : Interface GitHub Actions
- ✅ **Sécurisé** : Secrets gérés par GitHub
- ✅ **Déclenche le déploiement** : Automatiquement après push

### Inconvénients
- ⚠️ Limité à 2000 minutes/mois (largement suffisant ici)
- ⚠️ Runners Ubuntu seulement pour gratuit (pas Windows)

### Configuration

**Fichier créé :** `.github/workflows/update-rad.yml`

**Schedule :**
```yaml
schedule:
  - cron: '0 8 * * 4'  # Tous les jeudis à 8h UTC
```

**Cycles AIRAC :** Tous les 28 jours, mais les MAJ EUROCONTROL sont publiées le jeudi généralement.

### Fonctionnement

1. **Déclenchement automatique** :
   - Tous les jeudis à 8h UTC (9h Paris hiver)
   - OU manuellement via l'interface GitHub Actions

2. **Exécution** :
   ```
   ├─ Install Python + dependencies
   ├─ Download RAD (rad_downloader.py)
   ├─ Parse Excel → JSON (rad_parser.py)
   ├─ Create metadata files
   ├─ Check if versions changed
   └─ If changed: Commit + Push
   ```

3. **Après le push** :
   - Le workflow de déploiement existant se déclenche automatiquement
   - GitHub Pages est mis à jour
   - Application disponible avec les nouvelles versions

### Activation

```bash
# Commiter le workflow
git add .github/workflows/update-rad.yml
git commit -m "Add GitHub Actions auto-update workflow"
git push origin main
```

**Vérifier :**
- GitHub → Repository → Actions tab
- Vous verrez "Auto-update RAD (Current + Future)"
- Cliquer "Run workflow" pour tester manuellement

### Surveillance

**Notifications automatiques :**
- GitHub envoie un email si le workflow échoue
- Configurable dans : Settings → Notifications

**Dashboard :**
- Actions tab → Historique de toutes les exécutions
- Logs détaillés de chaque étape
- Summary avec cycles mis à jour

---

## 🔧 Solution 2 : n8n (Self-hosted)

### Avantages
- ✅ **Très flexible** : Interface visuelle pour workflows complexes
- ✅ **Multi-intégrations** : Peut intégrer emails, Slack, Discord, etc.
- ✅ **Conditions complexes** : Logique if/else, boucles, transformations
- ✅ **Webhooks** : Peut réagir à des événements externes

### Inconvénients
- ❌ **Serveur requis** : Self-hosted (Docker, VPS, etc.)
- ❌ **Maintenance** : Mises à jour, sécurité à gérer
- ❌ **Plus complexe** : Courbe d'apprentissage
- ❌ **Coût** : Serveur (~5€/mois minimum)

### Architecture proposée

```
┌─────────────────────────────────────────────┐
│         n8n Workflow (VPS/Docker)           │
├─────────────────────────────────────────────┤
│                                             │
│  1. Schedule Trigger (Cron: 0 8 * * 4)     │
│       ↓                                     │
│  2. Execute Python Script (SSH/API)         │
│       ├─ rad_downloader.py                  │
│       └─ rad_parser.py                      │
│       ↓                                     │
│  3. Check if versions changed               │
│       ↓                                     │
│  4. IF changed:                             │
│       ├─ Git commit + push (GitHub API)     │
│       ├─ Send Slack notification            │
│       └─ Send email summary                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Configuration

**1. Installer n8n :**
```bash
# Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**2. Créer le workflow :**
- Cron Trigger → tous les jeudis 8h
- Execute Command (SSH vers votre machine)
- HTTP Request (GitHub API pour commit)
- Conditionnels (IF versions changed)
- Notifications (Slack, Email, Discord...)

### Cas d'usage idéal pour n8n

Si vous voulez **plus que juste mettre à jour** :
- 📧 Envoyer un email récapitulatif aux pilotes
- 💬 Poster sur Discord/Slack "Nouveaux cycles RAD disponibles"
- 📊 Logger dans une base de données
- 🔔 Alertes si échec de téléchargement
- 📈 Statistiques d'utilisation

**Exemple workflow n8n étendu :**
```
Schedule Trigger
  → Download & Parse RAD
  → Check Changes
  → IF Changed:
      ├─ Commit to GitHub
      ├─ Send email to pilots mailing list
      ├─ Post to Discord #updates channel
      ├─ Update Google Sheets log
      └─ Send metrics to monitoring
```

---

## 🖥️ Solution 3 : Scheduled Task Windows + Script

### Avantages
- ✅ **Simple** : Pas de cloud/serveur externe
- ✅ **Windows natif** : Task Scheduler intégré
- ✅ **PowerShell** : Votre script update_rad_multi.ps1 existant

### Inconvénients
- ❌ **Machine allumée** : PC doit tourner 24/7
- ❌ **Push manuel** : Doit configurer auth Git
- ❌ **Pas de logs centralisés**

### Configuration

**1. Créer un script wrapper :**

`auto_update_rad.ps1` :
```powershell
# Naviguer vers le projet
cd "C:\Users\pbaty\rad-error-decoder\rad-error-decoder-main"

# Exécuter la mise à jour
.\update_rad_multi.ps1

# Si succès, commit et push
if ($LASTEXITCODE -eq 0) {
    # Vérifier si changements
    git add frontend/public/*.json
    $changes = git diff --cached --quiet

    if ($LASTEXITCODE -ne 0) {
        # Récupérer les versions
        $versions = Get-Content frontend\public\rad-versions.json | ConvertFrom-Json
        $current = $versions.versions.current.cycle
        $future = $versions.versions.future.cycle

        # Commit et push
        git commit -m "Auto-update RAD: cycles $current/$future"
        git push origin main

        Write-Host "✅ RAD mis à jour et poussé sur GitHub"
    } else {
        Write-Host "ℹ️ Aucun changement détecté"
    }
}
```

**2. Configurer Task Scheduler :**
```
Trigger : Tous les jeudis à 8h
Action  : powershell.exe -File "C:\...\auto_update_rad.ps1"
```

---

## ☁️ Solution 4 : Cloud Functions (Azure / AWS Lambda)

### Avantages
- ✅ **Serverless** : Pas de serveur à gérer
- ✅ **Scalable** : Automatique
- ✅ **Pay-per-use** : Très peu cher (quasi-gratuit)

### Inconvénients
- ❌ **Configuration complexe** : Azure/AWS setup
- ❌ **Limites** : Timeout (15 min max Lambda)
- ❌ **Overkill** : Pour un simple cron job

### Architecture

**Azure Functions :**
```
Timer Trigger (Cron: 0 8 * * 4)
  → Function Python
    ├─ Download RAD
    ├─ Parse JSON
    └─ Push to GitHub (API)
```

**AWS Lambda + EventBridge :**
```
EventBridge Rule (Cron)
  → Lambda Function (Python)
    → GitHub API
```

---

## 📊 Comparaison

| Solution | Coût | Complexité | Maintenance | Flexibilité | Recommandé pour |
|----------|------|------------|-------------|-------------|-----------------|
| **GitHub Actions** | Gratuit | ⭐ Facile | ⭐ Aucune | ⭐⭐⭐ Bonne | **95% des cas** |
| **n8n** | ~5€/mois | ⭐⭐⭐ Moyenne | ⭐⭐ Moyenne | ⭐⭐⭐⭐⭐ Excellente | Workflows complexes |
| **Task Scheduler** | Gratuit | ⭐⭐ Facile | ⭐⭐⭐ Élevée | ⭐⭐ Limitée | PC toujours allumé |
| **Cloud Functions** | ~0.50€/mois | ⭐⭐⭐⭐ Difficile | ⭐⭐ Moyenne | ⭐⭐⭐⭐ Excellente | Projets enterprise |

---

## 🎯 Recommandation finale

### Pour votre cas (RAD Error Decoder) :

**Utilisez GitHub Actions** ✅

**Pourquoi ?**
1. ✅ **Gratuit et intégré** : Pas de serveur externe
2. ✅ **Fiable** : Infrastructure GitHub
3. ✅ **Simple** : Un seul fichier YAML
4. ✅ **Logs accessibles** : Interface GitHub
5. ✅ **Déploiement automatique** : Déjà configuré

**Quand envisager n8n ?**

Si vous voulez ajouter :
- 📧 Notifications email automatiques aux utilisateurs
- 💬 Intégration Discord/Slack pour alertes
- 📊 Logs dans une base de données
- 🔔 Alertes complexes (ex: si >10 nouvelles règles)
- 🤖 Workflows multi-étapes avec conditions

---

## 🚀 Mise en place de l'automatisation GitHub Actions

### Étape 1 : Activer le workflow

```bash
cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder-main

# Commiter le workflow
git add .github/workflows/update-rad.yml AUTOMATION_OPTIONS.md
git commit -m "Add automated RAD update via GitHub Actions"
git push origin main
```

### Étape 2 : Tester manuellement

1. Aller sur GitHub : https://github.com/paneuropeennefiles-cmyk/rad-error-decoder
2. Onglet **Actions**
3. Sélectionner "Auto-update RAD (Current + Future)"
4. Cliquer **"Run workflow"** → **"Run workflow"**
5. Attendre ~5 minutes
6. Vérifier les logs

### Étape 3 : Surveillance

**Notifications par email :**
- GitHub → Settings → Notifications
- Cocher "Send notifications for failed workflows"

**Vérifier régulièrement :**
- Actions tab → Historique des exécutions
- Tous les jeudis, vérifier qu'une exécution a eu lieu

### Étape 4 : Ajustements (optionnels)

**Changer la fréquence :**
```yaml
schedule:
  # Tous les jours à 8h (détection plus rapide)
  - cron: '0 8 * * *'

  # Ou 2 fois par semaine (mercredi + jeudi)
  - cron: '0 8 * * 3,4'
```

**Ajouter des notifications Slack :**
```yaml
- name: Notify Slack
  if: steps.check_changes.outputs.changed == 'true'
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🆕 RAD updated: Cycles ${{ steps.download.outputs.current_cycle }}/${{ steps.download.outputs.future_cycle }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 💡 Conseils

### Sécurité
- Les secrets GitHub (tokens, API keys) sont automatiquement masqués dans les logs
- Le workflow n'a accès qu'au dépôt (isolation)

### Debugging
Si le workflow échoue :
1. Aller dans Actions → Workflow échoué
2. Cliquer sur l'étape en erreur
3. Lire les logs détaillés
4. Fix → Push → Auto-retry

### Optimisations futures
- Cache pip dependencies (déjà activé : `cache: 'pip'`)
- Paralléliser download current/future (si gros gains)
- Ajouter des tests automatiques avant deploy

---

## 📞 Support

**GitHub Actions docs :**
- https://docs.github.com/en/actions

**n8n docs :**
- https://docs.n8n.io/

**Questions ?**
- Vérifier les logs GitHub Actions
- Issues sur le dépôt GitHub
