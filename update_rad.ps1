# ============================================================================
# Script PowerShell : Mise à jour du RAD pour Windows
# ============================================================================
# Usage: .\update_rad.ps1 -RadFile "data\raw\RAD_2512_v1_01.xlsx"
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$RadFile
)

# Couleurs pour l'affichage
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error-Custom { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning-Custom { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }

# Bannière
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   🔄 RAD Error Decoder - Mise à jour automatique         " -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Vérifier que le fichier existe
if (-not (Test-Path $RadFile)) {
    Write-Error-Custom "Fichier non trouvé: $RadFile"
    Write-Host ""
    Write-Host "Usage: .\update_rad.ps1 -RadFile 'data\raw\RAD_2512_v1_01.xlsx'" -ForegroundColor Yellow
    exit 1
}

# Extraire les informations du nom de fichier
$FileName = Split-Path $RadFile -Leaf
Write-Info "Fichier source: $FileName"

# Regex pour extraire cycle et version
if ($FileName -match 'RAD_(\d{4})_v(\d+)_(\d+)\.xlsx') {
    $Cycle = $Matches[1]
    $VersionMajor = $Matches[2]
    $VersionMinor = $Matches[3]
    $Version = "$VersionMajor.$VersionMinor"

    Write-Success "Cycle AIRAC: $Cycle"
    Write-Success "Version: $Version"
} else {
    Write-Warning-Custom "Impossible d'extraire le cycle depuis le nom du fichier"
    Write-Warning-Custom "Format attendu: RAD_YYMM_vX_YY.xlsx"

    $Cycle = Read-Host "Entrez le cycle manuellement (ex: 2512)"
    $Version = Read-Host "Entrez la version (ex: 1.01)"
}

Write-Host ""

# ============================================================================
# Étape 1: Parser Excel → JSON
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Étape 1/6: Parsing Excel → JSON" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$OutputJson = "frontend\public\rad-data.json"

Write-Info "Exécution du parser Python..."
python scripts\rad_parser.py "$RadFile" "$OutputJson"

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Erreur lors du parsing"
    exit 1
}

Write-Success "Parsing terminé avec succès"
Write-Host ""

# ============================================================================
# Étape 2: Mise à jour des métadonnées
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📝 Étape 2/6: Mise à jour des métadonnées" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Demander la date effective
$EffectiveDate = Read-Host "Entrez la date effective du cycle (YYYY-MM-DD, ex: 2025-11-27)"

# Générer la date/heure actuelle au format ISO 8601
$GeneratedAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

# Créer le contenu du metadata.json
$MetadataContent = @"
{
  "cycle": "$Cycle",
  "effectiveDate": "$EffectiveDate",
  "version": "$Version",
  "generatedAt": "$GeneratedAt",
  "source": "$FileName"
}
"@

# Écrire le fichier metadata.json
$MetadataPath = "frontend\public\metadata.json"
$MetadataContent | Out-File -FilePath $MetadataPath -Encoding UTF8

Write-Success "Métadonnées mises à jour: $MetadataPath"
Write-Host ""

# ============================================================================
# Étape 3: Vérifier les fichiers générés
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 Étape 3/6: Vérification des fichiers" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $OutputJson) {
    $FileSize = (Get-Item $OutputJson).Length / 1KB
    Write-Success "rad-data.json: $([math]::Round($FileSize, 1)) KB"
} else {
    Write-Error-Custom "rad-data.json non trouvé!"
    exit 1
}

if (Test-Path $MetadataPath) {
    Write-Success "metadata.json créé"
} else {
    Write-Error-Custom "metadata.json non trouvé!"
    exit 1
}

Write-Host ""

# ============================================================================
# Étape 4: Git Status
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 Étape 4/6: Préparation Git" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Info "Ajout des fichiers à Git..."
git add frontend\public\rad-data.json frontend\public\metadata.json

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Erreur lors de git add"
    exit 1
}

Write-Success "Fichiers ajoutés au staging"
Write-Host ""

# ============================================================================
# Étape 5: Git Commit
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "💾 Étape 5/6: Création du commit" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$CommitMessage = @"
Update RAD to cycle $Cycle v$Version

- Source: $FileName
- Effective date: $EffectiveDate
- Generated: $GeneratedAt
- Auto-update via update_rad.ps1

🤖 Generated with [Claude Code](https://claude.com/claude-code)
"@

git commit -m "$CommitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Warning-Custom "Aucun changement à commiter (ou erreur)"
} else {
    Write-Success "Commit créé avec succès"
}

Write-Host ""

# ============================================================================
# Étape 6: Instructions finales
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Étape 6/6: Prochaines actions" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 RAD mis à jour avec succès !" -ForegroundColor Green
Write-Host ""

Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Vérifier le commit:" -ForegroundColor White
Write-Host "     git log -1" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Tester localement (RECOMMANDÉ):" -ForegroundColor White
Write-Host "     cd frontend" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host "     → Ouvrir http://localhost:5174/" -ForegroundColor Gray
Write-Host "     → Vérifier que le cycle $Cycle s'affiche" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Pousser vers GitHub:" -ForegroundColor White
Write-Host "     git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Vérifier le déploiement sur GitHub Actions" -ForegroundColor White
Write-Host "     → https://github.com/[votre-compte]/rad-error-decoder/actions" -ForegroundColor Gray
Write-Host ""
Write-Host "  5. Tester l'application en production" -ForegroundColor White
Write-Host "     → https://[votre-compte].github.io/rad-error-decoder/" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   ✅ Script terminé                                       " -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
