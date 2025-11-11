# ============================================================================
# Script PowerShell : Mise à jour automatique des RAD (Current + Future)
# ============================================================================
# Usage: .\update_rad_multi.ps1
#
# Ce script:
#   1. Télécharge automatiquement les RAD current et future depuis EUROCONTROL
#   2. Parse chaque fichier Excel en JSON
#   3. Crée des métadonnées séparées pour chaque version
#   4. Déploie les fichiers dans frontend/public
# ============================================================================

# Couleurs pour l'affichage
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Error-Custom { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning-Custom { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Step { param($Message) Write-Host "============================================================" -ForegroundColor Cyan; Write-Host $Message -ForegroundColor Cyan; Write-Host "============================================================" -ForegroundColor Cyan; Write-Host "" }

# Bannière
Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "   RAD Error Decoder - Mise a jour multi-versions             " -ForegroundColor Magenta
Write-Host "   Telechargement automatique Current + Future                 " -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host ""

# Variables globales
$DataDir = "data\raw"
$FrontendPublic = "frontend\public"
$ScriptsDir = "scripts"

# Vérifier que Python est installé
Write-Info "Vérification de l'environnement..."
$PythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Python n'est pas installé ou non accessible"
    exit 1
}
Write-Success "Python détecté: $PythonVersion"
Write-Host ""

# ============================================================================
# Étape 1: Téléchargement automatique des RAD
# ============================================================================

Write-Step "Etape 1/5: Telechargement automatique des RAD"

Write-Info "Lancement du téléchargeur RAD..."
python "$ScriptsDir\rad_downloader.py" --output-dir "$DataDir"

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Erreur lors du téléchargement"
    exit 1
}

Write-Success "Téléchargement terminé"
Write-Host ""

# ============================================================================
# Étape 2: Lecture des métadonnées de téléchargement
# ============================================================================

Write-Step "Etape 2/5: Lecture des metadonnees"

$MetadataFile = "$DataDir\rad_downloads_metadata.json"

if (-not (Test-Path $MetadataFile)) {
    Write-Error-Custom "Fichier de métadonnées non trouvé: $MetadataFile"
    exit 1
}

$DownloadMetadata = Get-Content $MetadataFile -Raw | ConvertFrom-Json

Write-Info "Métadonnées chargées:"
Write-Host "  • Current: Cycle $($DownloadMetadata.files.current.cycle) v$($DownloadMetadata.files.current.version)" -ForegroundColor White
Write-Host "  • Future: Cycle $($DownloadMetadata.files.future.cycle) v$($DownloadMetadata.files.future.version)" -ForegroundColor White
Write-Host ""

# ============================================================================
# Étape 3: Parsing des fichiers Excel → JSON
# ============================================================================

Write-Step "Etape 3/5: Parsing Excel vers JSON"

# Fonction pour parser un fichier RAD
function Parse-RADFile {
    param(
        [string]$RadType,
        [object]$RadInfo
    )

    Write-Host ""
    Write-Host "  ▶ Processing $RadType RAD..." -ForegroundColor Yellow
    Write-Host ""

    $InputFile = $RadInfo.path
    $OutputFile = "$FrontendPublic\rad-data-$RadType.json"

    Write-Info "  Fichier source: $InputFile"
    Write-Info "  Fichier destination: $OutputFile"

    python "$ScriptsDir\rad_parser.py" "$InputFile" "$OutputFile"

    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "  Erreur lors du parsing de $RadType"
        return $false
    }

    Write-Success "  Parsing de $RadType terminé"
    return $true
}

# Parser les deux fichiers
$CurrentSuccess = Parse-RADFile -RadType "current" -RadInfo $DownloadMetadata.files.current
$FutureSuccess = Parse-RADFile -RadType "future" -RadInfo $DownloadMetadata.files.future

if (-not $CurrentSuccess -or -not $FutureSuccess) {
    Write-Error-Custom "Erreur lors du parsing des fichiers"
    exit 1
}

Write-Host ""
Write-Success "Parsing de tous les fichiers terminé"
Write-Host ""

# ============================================================================
# Étape 4: Création des métadonnées séparées
# ============================================================================

Write-Step "Etape 4/5: Creation des metadonnees"

# Générer la date/heure actuelle
$GeneratedAt = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

# Fonction pour créer les métadonnées d'un RAD
function Create-RADMetadata {
    param(
        [string]$RadType,
        [object]$RadInfo
    )

    $MetadataPath = "$FrontendPublic\metadata-$RadType.json"

    $MetadataContent = @{
        cycle = $RadInfo.cycle
        effectiveDate = $RadInfo.effective_date
        version = $RadInfo.version
        generatedAt = $GeneratedAt
        source = (Split-Path $RadInfo.path -Leaf)
        downloadedAt = $RadInfo.downloaded_at
        type = $RadType
    } | ConvertTo-Json -Depth 10

    $MetadataContent | Out-File -FilePath $MetadataPath -Encoding UTF8 -NoNewline

    Write-Success "  Métadonnées $RadType créées: $MetadataPath"
}

Create-RADMetadata -RadType "current" -RadInfo $DownloadMetadata.files.current
Create-RADMetadata -RadType "future" -RadInfo $DownloadMetadata.files.future

# Créer un index global des versions disponibles
$VersionsIndexPath = "$FrontendPublic\rad-versions.json"
$VersionsIndex = @{
    lastUpdate = $GeneratedAt
    versions = @{
        current = @{
            cycle = $DownloadMetadata.files.current.cycle
            effectiveDate = $DownloadMetadata.files.current.effective_date
            version = $DownloadMetadata.files.current.version
        }
        future = @{
            cycle = $DownloadMetadata.files.future.cycle
            effectiveDate = $DownloadMetadata.files.future.effective_date
            version = $DownloadMetadata.files.future.version
        }
    }
} | ConvertTo-Json -Depth 10

$VersionsIndex | Out-File -FilePath $VersionsIndexPath -Encoding UTF8 -NoNewline

Write-Success "  Index des versions créé: $VersionsIndexPath"
Write-Host ""

# ============================================================================
# Étape 5: Vérification des fichiers générés
# ============================================================================

Write-Step "Etape 5/5: Verification des fichiers"

$FilesToCheck = @(
    "$FrontendPublic\rad-data-current.json",
    "$FrontendPublic\rad-data-future.json",
    "$FrontendPublic\metadata-current.json",
    "$FrontendPublic\metadata-future.json",
    "$FrontendPublic\rad-versions.json"
)

$AllFilesOk = $true

foreach ($File in $FilesToCheck) {
    if (Test-Path $File) {
        $FileSize = (Get-Item $File).Length / 1KB
        Write-Success "$File : $([math]::Round($FileSize, 1)) KB"
    } else {
        Write-Error-Custom "$File : NON TROUVÉ"
        $AllFilesOk = $false
    }
}

Write-Host ""

if (-not $AllFilesOk) {
    Write-Error-Custom "Certains fichiers sont manquants!"
    exit 1
}

# ============================================================================
# Résumé final
# ============================================================================

Write-Host "================================================================" -ForegroundColor Green
Write-Host "   Mise a jour terminee avec succes!                          " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Resume des versions deployees:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  CURRENT (Actuel):" -ForegroundColor Green
Write-Host "     Cycle: $($DownloadMetadata.files.current.cycle) v$($DownloadMetadata.files.current.version)" -ForegroundColor White
Write-Host "     Date effective: $($DownloadMetadata.files.current.effective_date)" -ForegroundColor White
Write-Host ""
Write-Host "  FUTURE (Prochain):" -ForegroundColor Cyan
Write-Host "     Cycle: $($DownloadMetadata.files.future.cycle) v$($DownloadMetadata.files.future.version)" -ForegroundColor White
Write-Host "     Date effective: $($DownloadMetadata.files.future.effective_date)" -ForegroundColor White
Write-Host ""

Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Tester localement:" -ForegroundColor White
Write-Host "     cd frontend" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host "     → Ouvrir http://localhost:5174/" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Vérifier le sélecteur de version dans l'interface" -ForegroundColor White
Write-Host ""
Write-Host "  3. Commiter et pousser les changements:" -ForegroundColor White
Write-Host "     git add frontend/public/*.json" -ForegroundColor Gray
Write-Host "     git commit -m 'Update RAD current + future'" -ForegroundColor Gray
Write-Host "     git push origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "================================================================" -ForegroundColor Magenta
Write-Host ""
