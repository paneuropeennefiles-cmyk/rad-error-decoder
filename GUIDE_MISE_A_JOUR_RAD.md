# 📋 Guide de mise à jour du RAD - RAD Error Decoder

**Pour la personne en charge des mises à jour AIRAC**

---

## 📅 Quand mettre à jour ?

Le RAD EUROCONTROL se met à jour tous les **28 jours** (cycle AIRAC).

**Calendrier des cycles AIRAC 2025 :**
- Cycle 2501 : 02 Jan 2025 → 29 Jan 2025
- Cycle 2502 : 30 Jan 2025 → 26 Fév 2025
- Cycle 2503 : 27 Fév 2025 → 26 Mar 2025
- ... (tous les 28 jours)

⚠️ **IMPORTANT :** La mise à jour doit être faite **AVANT** la date effective du nouveau cycle.

---

## 🎯 Vue d'ensemble du processus

```
1️⃣ Télécharger le nouveau RAD Excel
       ↓
2️⃣ Convertir Excel → JSON (script Python)
       ↓
3️⃣ Vérifier que tout fonctionne localement
       ↓
4️⃣ Pousser sur GitHub (git push)
       ↓
5️⃣ ✅ GitHub déploie automatiquement (2-3 min)
       ↓
6️⃣ ✅ L'application est mise à jour pour tous les utilisateurs
```

**Temps total estimé :** 10-15 minutes

---

## 📝 Procédure détaillée

### **Étape 1 : Télécharger le nouveau RAD Excel**

1. Allez sur le site EUROCONTROL :
   **[https://www.nm.eurocontrol.int/RAD/](https://www.nm.eurocontrol.int/RAD/)**

2. Connectez-vous avec vos identifiants EUROCONTROL

3. Téléchargez le fichier Excel du nouveau cycle
   - Format : `RAD_YYMM_vX_YY.xlsx`
   - Exemple : `RAD_2512_v1_01.xlsx` (cycle décembre 2025, version 1.01)

4. Placez le fichier téléchargé dans le dossier :
   ```
   C:\Users\pbaty\rad-error-decoder\rad-error-decoder\data\raw\
   ```

---

### **Étape 2 : Convertir le fichier Excel en JSON**

1. Ouvrez un terminal (PowerShell ou Invite de commandes)

2. Naviguez vers le dossier du projet :
   ```bash
   cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder
   ```

3. Exécutez le script de conversion Python :
   ```bash
   python scripts/rad_parser.py data/raw/RAD_2512_v1_01.xlsx frontend/public/rad-data.json
   ```
   ⚠️ **Remplacez** `RAD_2512_v1_01.xlsx` par le nom exact de votre fichier !

4. **Vérifiez la sortie du script :**

   Vous devriez voir quelque chose comme :
   ```
   📖 Lecture de RAD_2512_v1_01.xlsx
   📅 Cycle AIRAC: 2512 - Version: 1.01
     ⚙️  Parsing Annex 1...
       ✅ 245 entrées
     ⚙️  Parsing Annex 2A...
       ✅ 189 entrées
     ⚙️  Parsing Annex 2B...
       ✅ 1543 entrées
     ⚙️  Parsing Annex 2C...
       ✅ 78 entrées
     ⚙️  Parsing Annex 3A Conditions...
       ✅ 56 entrées
     ... etc ...
   ✅ Total: 2456 entrées parsées
   💾 Sauvegarde vers frontend/public/rad-data.json
   ✅ Fichier généré:
      - 2456 entrées totales
      - 487.3 KB
   🎉 Parsing terminé avec succès!
   ```

   ✅ **Si vous voyez ce message de succès, passez à l'étape suivante.**

   ❌ **Si vous voyez des erreurs :**
   - Vérifiez que le fichier Excel est bien placé dans `data/raw/`
   - Vérifiez que le nom du fichier est correct
   - Contactez le support technique si le problème persiste

---

### **Étape 3 : Mettre à jour les métadonnées**

1. Ouvrez le fichier `frontend/public/metadata.json` avec un éditeur de texte (Notepad++, VS Code, ou même Bloc-notes)

2. Mettez à jour les informations :
   ```json
   {
     "cycle": "2512",                      ← Nouveau cycle AIRAC
     "effectiveDate": "2025-11-27",        ← Date effective du cycle
     "version": "1.01",                    ← Version du RAD
     "generatedAt": "2025-11-07T10:30:00Z", ← Date/heure de génération (format ISO)
     "source": "RAD_2512_v1_01.xlsx"       ← Nom du fichier source
   }
   ```

3. **Sauvegardez** le fichier

**💡 Astuce :** Vous pouvez copier la date/heure actuelle au format ISO depuis [https://www.timestamp-converter.com/](https://www.timestamp-converter.com/)

---

### **Étape 4 : Tester localement (IMPORTANT)**

Avant de déployer en production, testez que tout fonctionne :

1. Ouvrez un terminal dans le dossier frontend :
   ```bash
   cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder\frontend
   npm run dev
   ```

2. Ouvrez votre navigateur : [http://localhost:5174/](http://localhost:5174/)

3. **Vérifications à faire :**
   - ✅ Le cycle AIRAC affiché en haut à droite est le bon (ex: "2512 v1.01")
   - ✅ La recherche fonctionne correctement
   - ✅ Testez quelques recherches :
     - Recherchez un ID connu : `LS2857`
     - Recherchez une balise : `OMASI`
     - Recherchez un aérodrome : `LSGG`
   - ✅ Les résultats s'affichent correctement avec les bonnes informations

4. **Si tout fonctionne :** Fermez le serveur local (Ctrl+C dans le terminal)

5. **Si des problèmes :** Notez les erreurs et contactez le support technique

---

### **Étape 5 : Commiter et pousser sur GitHub**

1. Ouvrez un terminal dans le dossier du projet :
   ```bash
   cd C:\Users\pbaty\rad-error-decoder\rad-error-decoder
   ```

2. Ajoutez les fichiers modifiés :
   ```bash
   git add frontend/public/rad-data.json frontend/public/metadata.json
   ```

3. Créez un commit avec un message descriptif :
   ```bash
   git commit -m "Update RAD to cycle 2512 v1.01 (effective 2025-11-27)"
   ```
   ⚠️ **Remplacez** les valeurs par celles de votre cycle !

4. Poussez vers GitHub :
   ```bash
   git push origin main
   ```

5. **GitHub vous demandera vos identifiants :**
   - **Username :** Votre nom d'utilisateur GitHub
   - **Password :** Votre Personal Access Token (PAS votre mot de passe GitHub)

   💡 **Note :** Si vous n'avez pas de token, suivez la section "Obtenir un Personal Access Token" ci-dessous.

---

### **Étape 6 : Vérifier le déploiement automatique**

1. Allez sur GitHub : [https://github.com/[votre-compte]/rad-error-decoder](https://github.com/[votre-compte]/rad-error-decoder)

2. Cliquez sur l'onglet **"Actions"**

3. Vous verrez le workflow **"Deploy to GitHub Pages"** en cours :
   - 🟡 **Jaune (en cours)** : Le déploiement est en cours... Attendez 2-3 minutes
   - ✅ **Vert (succès)** : Le déploiement est réussi ! L'application est mise à jour
   - ❌ **Rouge (échec)** : Erreur lors du déploiement → Contactez le support technique

4. **Une fois le déploiement réussi (vert) :**
   - L'application est automatiquement mise à jour
   - Tous les utilisateurs verront la nouvelle version au prochain refresh

---

### **Étape 7 : Vérifier l'application en production**

1. Ouvrez l'application en production :
   **[https://[votre-compte].github.io/rad-error-decoder/](https://[votre-compte].github.io/rad-error-decoder/)**

2. **Vérifications finales :**
   - ✅ Le cycle AIRAC affiché est le bon
   - ✅ Les recherches fonctionnent
   - ✅ Testez avec quelques exemples réels

3. **Si tout est OK :** ✅ **Mise à jour terminée avec succès !**

4. **Si des problèmes :** Notez les erreurs et contactez le support technique

---

## 🔐 Annexe : Obtenir un Personal Access Token (PAT)

GitHub nécessite un token pour pousser du code (plus de mot de passe simple).

### **Étapes pour créer un token :**

1. Allez sur GitHub → **Settings** (cliquez sur votre avatar en haut à droite)

2. Dans le menu de gauche, cliquez sur **"Developer settings"** (tout en bas)

3. Cliquez sur **"Personal access tokens"** → **"Tokens (classic)"**

4. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**

5. Remplissez :
   - **Note :** `RAD Updater Token`
   - **Expiration :** Sélectionnez `No expiration` ou `1 year`
   - **Scopes :** Cochez UNIQUEMENT `repo` (accès complet aux repositories)

6. Cliquez sur **"Generate token"**

7. ⚠️ **IMPORTANT :** Copiez le token et **sauvegardez-le dans un endroit sûr** (Notepad, gestionnaire de mots de passe)
   - Vous ne pourrez plus le revoir !
   - Ce token remplace votre mot de passe lors du `git push`

8. **Utilisation :**
   ```
   Username: votre-nom-utilisateur-github
   Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxx  ← Collez votre token ici
   ```

---

## 📞 Support et contact

**En cas de problème :**

1. **Erreurs lors du parsing Python :**
   - Vérifiez que le fichier Excel est bien placé dans `data/raw/`
   - Vérifiez que le nom du fichier correspond au format : `RAD_YYMM_vX_YY.xlsx`
   - Vérifiez que Python et les dépendances sont installés : `pip list | findstr pandas`

2. **Erreurs lors du git push :**
   - Vérifiez votre Personal Access Token
   - Vérifiez votre connexion internet
   - Essayez de faire `git pull` avant `git push`

3. **Déploiement GitHub Actions échoue :**
   - Vérifiez les logs dans l'onglet "Actions" sur GitHub
   - Cliquez sur le workflow en échec pour voir les détails

4. **Questions générales :**
   - Consultez le README.md du projet
   - Consultez le fichier GETTING_STARTED.md

---

## ✅ Checklist rapide

**Avant chaque mise à jour :**

- [ ] Télécharger le nouveau RAD Excel depuis EUROCONTROL
- [ ] Placer dans `data/raw/RAD_XXXX_vX_XX.xlsx`
- [ ] Exécuter : `python scripts/rad_parser.py data/raw/RAD_XXXX_vX_XX.xlsx frontend/public/rad-data.json`
- [ ] Vérifier les logs (nombre d'entrées, taille du fichier)
- [ ] Mettre à jour `frontend/public/metadata.json`
- [ ] Tester en local : `npm run dev`
- [ ] Vérifier que le cycle AIRAC s'affiche correctement
- [ ] Faire quelques recherches de test
- [ ] Git add + commit
- [ ] Git push origin main
- [ ] Vérifier le déploiement sur GitHub Actions
- [ ] Tester l'application en production
- [ ] ✅ Mise à jour terminée !

---

## 📊 Historique des mises à jour

**Format :** `Date | Cycle AIRAC | Version | Notes`

| Date       | Cycle | Version | Notes                              |
|------------|-------|---------|------------------------------------|
| 2025-11-07 | 2511  | 1.17    | Déploiement initial                |
| YYYY-MM-DD | XXXX  | X.XX    | (à remplir lors des mises à jour)  |

---

**Document créé le :** 2025-11-07
**Dernière mise à jour :** 2025-11-07
**Version du guide :** 1.0
