#!/bin/bash
# Script de mise à jour du RAD tous les 28 jours
# Usage: ./update_rad.sh path/to/RAD_YYMM_vX_YY.xlsx

set -e  # Arrêt si erreur

RAD_FILE=$1

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$RAD_FILE" ]; then
    echo -e "${RED}❌ Erreur: Fichier RAD manquant${NC}"
    echo "Usage: ./update_rad.sh path/to/RAD_YYMM_vX_YY.xlsx"
    exit 1
fi

if [ ! -f "$RAD_FILE" ]; then
    echo -e "${RED}❌ Fichier non trouvé: $RAD_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}🔄 Mise à jour du RAD...${NC}"
echo ""

# Extract cycle number from filename
FILENAME=$(basename "$RAD_FILE")
CYCLE=$(echo "$FILENAME" | grep -oP 'RAD_\K\d{4}')

if [ -z "$CYCLE" ]; then
    echo -e "${YELLOW}⚠️  Impossible d'extraire le cycle depuis le nom du fichier${NC}"
    echo "Format attendu: RAD_YYMM_vX_YY.xlsx"
    read -p "Entrez le cycle manuellement (ex: 2511): " CYCLE
fi

echo -e "📅 Cycle AIRAC: ${GREEN}$CYCLE${NC}"
echo ""

# 1. Parse Excel → JSON
echo "📊 Parsing Excel..."
python scripts/rad_parser.py "$RAD_FILE" data/processed/rad-data.json

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du parsing${NC}"
    exit 1
fi
echo ""

# 2. Validate JSON structure
echo "✅ Validation..."
python scripts/validate_rad.py data/processed/rad-data.json

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la validation${NC}"
    exit 1
fi
echo ""

# 3. Copy to frontend public
echo "📦 Copie vers frontend..."
cp data/processed/rad-data.json frontend/public/

# 4. Update metadata
echo "📝 Mise à jour metadata..."
cat > frontend/public/metadata.json <<EOF
{
  "cycle": "$CYCLE",
  "effectiveDate": "$(date -I)",
  "version": "1.0",
  "generatedAt": "$(date -Iseconds)",
  "source": "$FILENAME"
}
EOF

echo ""

# 5. Git add and commit
echo "💾 Commit Git..."
git add frontend/public/rad-data.json frontend/public/metadata.json
git commit -m "Update RAD to cycle $CYCLE

- Source: $FILENAME
- Generated: $(date -I)
- Auto-update via update_rad.sh"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ RAD mis à jour avec succès !${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "  1. Vérifiez le commit: git log -1"
    echo "  2. Poussez vers GitHub: git push origin main"
    echo "  3. Le déploiement se fera automatiquement"
else
    echo -e "${YELLOW}⚠️  Pas de changements à commiter${NC}"
fi
