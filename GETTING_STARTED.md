# 🚀 Guide de démarrage rapide

## Étape 1: Installer les dépendances

```bash
# Frontend
cd frontend
npm install

# Python (pour parser RAD)
cd ../scripts
pip install -r requirements.txt
cd ..
```

## Étape 2: Parser le RAD

```bash
# Le fichier RAD a déjà été parsé et se trouve dans data/processed/
# Copions-le vers le frontend
cp data/processed/rad-data.json frontend/public/

# Créer un metadata.json
cat > frontend/public/metadata.json <<EOF
{
  "cycle": "2511",
  "effectiveDate": "2025-10-30",
  "version": "1.17",
  "generatedAt": "$(date -Iseconds)",
  "source": "RAD_2511_v1_17.xlsx"
}
EOF
```

## Étape 3: Lancer le dev server

```bash
cd frontend
npm run dev
```

Ouvrir http://localhost:5173

## Étape 4: Tester

1. Coller une erreur eurofpl complète:
   ```
   RS: TRAFFIC VIA OMASI IS ON FORBIDDEN ROUTE REF:[LSLF1139C] RAD ANNEX 2B LSASFRA
   ```

2. Ou chercher directement:
   - `LS2857` (ID)
   - `OMASI` (balise)
   - `LSGG` (aérodrome)

## Prochaines étapes

### Pour développer:
- Les composants sont dans `frontend/src/components/`
- Le moteur de recherche: `frontend/src/services/searchEngine.js`
- Le parser Python: `scripts/rad_parser.py`

### Pour déployer:
1. Créer un repo GitHub
2. Pousser le code
3. Activer GitHub Pages (Settings → Pages → Source: GitHub Actions)
4. Le déploiement est automatique !

### Pour mettre à jour le RAD:
```bash
./scripts/update_rad.sh data/raw/RAD_XXXX_vX_XX.xlsx
git push
```

## 🆘 Aide

**Erreur lors de `npm install`:**
- Vérifier Node.js version: `node --version` (doit être 18+)
- Supprimer `node_modules` et `package-lock.json`, réessayer

**Le parser Python ne fonctionne pas:**
- Vérifier Python version: `python --version` (doit être 3.10+)
- Installer les dépendances: `pip install -r scripts/requirements.txt --break-system-packages`

**Aucun résultat de recherche:**
- Vérifier que `frontend/public/rad-data.json` existe
- Vérifier la console du navigateur (F12) pour erreurs

## 📚 Documentation complète

Voir [claude.md](claude.md) pour la documentation technique détaillée.
