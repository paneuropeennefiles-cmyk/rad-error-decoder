# ⚡ Quick Start : Mise à jour RAD (une page)

**Guide ultra-rapide pour mettre à jour le RAD tous les 28 jours**

---

## 🎯 Résumé en 30 secondes

```
1. Télécharger nouveau RAD Excel → Placer dans data\raw\
2. Exécuter script PowerShell → .\update_rad.ps1
3. Tester en local → npm run dev
4. Pousser sur GitHub → git push
5. ✅ Déploiement automatique (2-3 min)
```

---

## 📋 Commandes à copier-coller

### **Étape 1 : Télécharger le RAD**

1. Site EUROCONTROL : https://www.nm.eurocontrol.int/RAD/
2. Télécharger : `RAD_XXXX_vX_XX.xlsx` (ex: `RAD_2512_v1_01.xlsx`)
3. Placer dans : `C:\Users\pbaty\rad-error-decoder\rad-error-decoder\data\raw\`

---

### **Étape 2 : Exécuter le script de mise à jour**

```powershell
# Ouvrir PowerShell dans le dossier du projet
cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder

# Exécuter le script (REMPLACER le nom du fichier !)
.\update_rad.ps1 -RadFile "data\raw\RAD_2512_v1_01.xlsx"

# Le script va :
# - Parser Excel → JSON
# - Mettre à jour metadata.json
# - Créer un commit Git
# Suivre les instructions à l'écran
```

---

### **Étape 3 : Tester localement (RECOMMANDÉ)**

```powershell
# Lancer le serveur local
cd frontend
npm run dev

# Ouvrir dans le navigateur : http://localhost:5174/

# VÉRIFIER :
# ✅ Le cycle AIRAC affiché (ex: 2512 v1.01)
# ✅ Les recherches fonctionnent
# ✅ Tester : LS2857, OMASI, LSGG

# Arrêter le serveur : Ctrl + C
```

---

### **Étape 4 : Pousser sur GitHub (déploiement automatique)**

```powershell
# Retour à la racine du projet
cd ..

# Pousser vers GitHub
git push origin main

# Authentification :
# Username: [votre-nom-utilisateur-github]
# Password: [votre-personal-access-token]  ← PAS votre mot de passe !
```

---

### **Étape 5 : Vérifier le déploiement**

1. **GitHub Actions :**
   - Aller sur : `https://github.com/[votre-compte]/rad-error-decoder/actions`
   - Vérifier que le workflow **"Deploy to GitHub Pages"** est ✅ **vert**
   - Attendre 2-3 minutes

2. **Tester l'application en production :**
   - Ouvrir : `https://[votre-compte].github.io/rad-error-decoder/`
   - Vérifier que le cycle AIRAC est mis à jour
   - Faire quelques recherches de test

3. **✅ C'EST FAIT !**

---

## 🆘 En cas de problème

| Problème | Solution rapide |
|----------|----------------|
| ❌ Script PowerShell échoue | Vérifier que le fichier Excel est dans `data\raw\` avec le bon nom |
| ❌ `git push` rejette le mot de passe | Utiliser votre **Personal Access Token**, pas votre mot de passe GitHub |
| ❌ Workflow GitHub Actions rouge | Cliquer dessus pour voir les logs → Noter l'erreur → Contacter support |
| ❌ L'app affiche l'ancien cycle | Vider le cache navigateur : `Ctrl + Shift + R` |
| ❌ "not a git repository" | Mauvais dossier → `cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder` |

**Guide complet :** Voir [GUIDE_MISE_A_JOUR_RAD.md](./GUIDE_MISE_A_JOUR_RAD.md)

---

## 📅 Calendrier AIRAC 2025

| Cycle | Date effective | Date limite de mise à jour |
|-------|----------------|---------------------------|
| 2501  | 02 Jan 2025    | 01 Jan 2025               |
| 2502  | 30 Jan 2025    | 29 Jan 2025               |
| 2503  | 27 Fév 2025    | 26 Fév 2025               |
| 2504  | 27 Mar 2025    | 26 Mar 2025               |
| 2505  | 24 Avr 2025    | 23 Avr 2025               |
| 2506  | 22 Mai 2025    | 21 Mai 2025               |
| 2507  | 19 Juin 2025   | 18 Juin 2025              |
| 2508  | 17 Juil 2025   | 16 Juil 2025              |
| 2509  | 14 Août 2025   | 13 Août 2025              |
| 2510  | 11 Sep 2025    | 10 Sep 2025               |
| 2511  | 09 Oct 2025    | 08 Oct 2025               |
| 2512  | 06 Nov 2025    | 05 Nov 2025               |
| 2513  | 04 Déc 2025    | 03 Déc 2025               |

**⚠️ Toujours mettre à jour AVANT la date effective !**

---

## 🔗 Liens utiles

- **Site RAD EUROCONTROL :** https://www.nm.eurocontrol.int/RAD/
- **Application en production :** https://[votre-compte].github.io/rad-error-decoder/
- **GitHub Actions (suivi déploiements) :** https://github.com/[votre-compte]/rad-error-decoder/actions
- **Guide complet :** [GUIDE_MISE_A_JOUR_RAD.md](./GUIDE_MISE_A_JOUR_RAD.md)

---

## ✅ Checklist rapide

```
☐ Télécharger RAD Excel depuis EUROCONTROL
☐ Placer dans data\raw\RAD_XXXX_vX_XX.xlsx
☐ Exécuter: .\update_rad.ps1 -RadFile "data\raw\RAD_XXXX_vX_XX.xlsx"
☐ Tester localement: npm run dev (vérifier cycle + recherches)
☐ Git push origin main
☐ Vérifier GitHub Actions (✅ vert)
☐ Tester en production
☐ ✅ TERMINÉ !
```

**Temps total : 10-15 minutes**

---

**Document créé le :** 2025-11-07 | **Version :** 1.0
