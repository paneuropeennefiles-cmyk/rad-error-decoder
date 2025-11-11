#!/usr/bin/env python3
"""
RAD Downloader - Télécharge automatiquement les RAD EUROCONTROL (current + future)

Usage:
    python rad_downloader.py --output-dir ../data/raw

Ce script:
    1. Parse la page RAD d'EUROCONTROL
    2. Extrait les liens des RAD current et future (AIRAC+1)
    3. Télécharge les fichiers Excel
    4. Extrait et sauvegarde les métadonnées (cycle, version, dates)
"""

import requests
from bs4 import BeautifulSoup
import re
import json
import logging
from pathlib import Path
from datetime import datetime
from urllib.parse import urljoin
import argparse
import sys

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


class RADDownloader:
    """Télécharge automatiquement les fichiers RAD depuis EUROCONTROL."""

    BASE_URL = "https://www.nm.eurocontrol.int/RAD/"

    def __init__(self, output_dir: str = "../data/raw"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

        self.rad_files = {
            'current': None,
            'future': None
        }

    def download_all(self):
        """Télécharge les RAD current et future."""
        logger.info("🔄 Démarrage du téléchargement des RAD...")
        logger.info(f"📁 Destination: {self.output_dir.absolute()}")
        logger.info("")

        # 1. Parse la page principale
        logger.info("📖 Parsing de la page EUROCONTROL RAD...")
        rad_links = self._parse_rad_page()

        if not rad_links:
            logger.error("❌ Aucun fichier RAD trouvé sur la page")
            return False

        # 2. Télécharger les fichiers
        for rad_type, rad_info in rad_links.items():
            logger.info("")
            logger.info(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            logger.info(f"📥 Téléchargement RAD {rad_type.upper()}")
            logger.info(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            success = self._download_rad(rad_type, rad_info)

            if not success:
                logger.warning(f"⚠️  Échec du téléchargement pour {rad_type}")

        # 3. Sauvegarder les métadonnées
        logger.info("")
        logger.info("📝 Sauvegarde des métadonnées...")
        self._save_metadata()

        logger.info("")
        logger.info("✅ Téléchargement terminé avec succès!")
        return True

    def _parse_rad_page(self):
        """Parse la page RAD pour extraire les liens de téléchargement."""
        try:
            response = self.session.get(self.BASE_URL, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            rad_links = {}

            # Rechercher les liens RAD_*.xlsx
            # Pattern: RAD_YYMM_vX_YY.xlsx
            pattern = re.compile(r'RAD_(\d{4})_v(\d+)_(\d+)\.xlsx')

            for link in soup.find_all('a', href=True):
                href = link['href']
                match = pattern.search(href)

                if match:
                    cycle, version_major, version_minor = match.groups()
                    version = f"{version_major}.{version_minor}"

                    # Déterminer si c'est current ou future selon le path
                    if 'CURRENT_AIRAC' in href:
                        rad_type = 'current'
                    elif 'AIRAC+1' in href or 'AIRAC%2B1' in href:
                        rad_type = 'future'
                    else:
                        continue

                    # Construire l'URL complète
                    full_url = urljoin(self.BASE_URL, href)

                    # Extraire les dates du contexte (chercher dans les éléments parents)
                    effective_date = self._extract_date_from_context(link, cycle)

                    rad_links[rad_type] = {
                        'url': full_url,
                        'cycle': cycle,
                        'version': version,
                        'filename': f"RAD_{cycle}_v{version_major}_{version_minor}.xlsx",
                        'effective_date': effective_date
                    }

                    logger.info(f"  ✅ Trouvé {rad_type.upper()}: Cycle {cycle} v{version}")

            return rad_links

        except requests.RequestException as e:
            logger.error(f"❌ Erreur lors de la requête: {e}")
            return {}

    def _extract_date_from_context(self, link_element, cycle):
        """Tente d'extraire la date effective depuis le contexte HTML."""
        # Rechercher un pattern de date dans les éléments parents
        parent = link_element.find_parent(['div', 'section', 'tr', 'td'])

        if parent:
            text = parent.get_text()
            # Pattern: DD-MMM-YY (ex: 30-OCT-25)
            date_match = re.search(r'(\d{2}-[A-Z]{3}-\d{2})', text)
            if date_match:
                date_str = date_match.group(1)
                try:
                    # Convertir en format ISO (ex: 30-OCT-25 → 2025-10-30)
                    date_obj = datetime.strptime(date_str, '%d-%b-%y')
                    return date_obj.strftime('%Y-%m-%d')
                except ValueError:
                    pass

        # Fallback: calculer approximativement depuis le cycle AIRAC
        # Les cycles AIRAC sont tous les 28 jours
        # Format YYMM où MM indique le mois du début du cycle
        try:
            year = 2000 + int(cycle[:2])
            month = int(cycle[2:4])
            return f"{year}-{month:02d}-01"  # Approximation
        except:
            return None

    def _download_rad(self, rad_type: str, rad_info: dict):
        """Télécharge un fichier RAD."""
        try:
            url = rad_info['url']
            filename = rad_info['filename']
            output_path = self.output_dir / filename

            logger.info(f"  📍 URL: {url}")
            logger.info(f"  💾 Fichier: {filename}")

            # Télécharger le fichier
            response = self.session.get(url, timeout=60, stream=True)
            response.raise_for_status()

            # Sauvegarder avec barre de progression
            total_size = int(response.headers.get('content-length', 0))

            with open(output_path, 'wb') as f:
                if total_size == 0:
                    f.write(response.content)
                else:
                    downloaded = 0
                    chunk_size = 8192

                    for chunk in response.iter_content(chunk_size=chunk_size):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)

                            # Afficher la progression
                            progress = (downloaded / total_size) * 100
                            if downloaded % (chunk_size * 10) == 0:
                                logger.info(f"    ⏳ {progress:.1f}% ({downloaded / 1024 / 1024:.1f} MB / {total_size / 1024 / 1024:.1f} MB)")

            file_size = output_path.stat().st_size / 1024 / 1024  # MB
            logger.info(f"  ✅ Téléchargé: {file_size:.1f} MB")

            # Sauvegarder les infos pour les métadonnées
            self.rad_files[rad_type] = {
                'path': str(output_path),
                'cycle': rad_info['cycle'],
                'version': rad_info['version'],
                'effective_date': rad_info['effective_date'],
                'downloaded_at': datetime.now().isoformat(),
                'size_mb': round(file_size, 2)
            }

            return True

        except requests.RequestException as e:
            logger.error(f"  ❌ Erreur de téléchargement: {e}")
            return False
        except Exception as e:
            logger.error(f"  ❌ Erreur inattendue: {e}")
            return False

    def _save_metadata(self):
        """Sauvegarde les métadonnées des RAD téléchargés."""
        metadata_path = self.output_dir / "rad_downloads_metadata.json"

        metadata = {
            'last_update': datetime.now().isoformat(),
            'files': self.rad_files
        }

        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

        logger.info(f"  ✅ Métadonnées sauvegardées: {metadata_path}")

        # Afficher un résumé
        logger.info("")
        logger.info("📊 Résumé des téléchargements:")
        for rad_type, info in self.rad_files.items():
            if info:
                logger.info(f"  • {rad_type.upper()}: Cycle {info['cycle']} v{info['version']} ({info['size_mb']} MB)")


def main():
    """Point d'entrée du script."""
    parser = argparse.ArgumentParser(
        description='Télécharge automatiquement les RAD EUROCONTROL',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  python rad_downloader.py
  python rad_downloader.py --output-dir ../data/raw
  python rad_downloader.py --output-dir C:/data/rad --verbose
        """
    )

    parser.add_argument('--output-dir', '-o',
                       default='../data/raw',
                       help='Répertoire de destination (default: ../data/raw)')
    parser.add_argument('--verbose', '-v',
                       action='store_true',
                       help='Affichage détaillé')

    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    try:
        downloader = RADDownloader(args.output_dir)
        success = downloader.download_all()

        return 0 if success else 1

    except KeyboardInterrupt:
        logger.warning("\n⚠️  Téléchargement interrompu par l'utilisateur")
        return 1
    except Exception as e:
        logger.error(f"❌ Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
