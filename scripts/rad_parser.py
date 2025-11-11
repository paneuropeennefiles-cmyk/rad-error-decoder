#!/usr/bin/env python3
"""
RAD Parser - Convertit le fichier Excel RAD EUROCONTROL en JSON optimisé

Usage:
    python rad_parser.py input.xlsx output.json
    
Exemple:
    python rad_parser.py ../data/raw/RAD_2511_v1_17.xlsx ../frontend/public/rad-data.json
"""

import pandas as pd
import json
import re
import sys
from pathlib import Path
from datetime import datetime
import argparse
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


class RADParser:
    """Parse et structure les données du RAD EUROCONTROL."""
    
    # Mapping des feuilles Excel vers clés JSON
    SHEET_MAPPING = {
        'Annex 1': 'annex1_areas',
        'Annex 2A': 'annex2a_capping',
        'Annex 2B': 'annex2b_rules',
        'Annex 2C': 'annex2c_fua',
        'Annex 3A Conditions': 'annex3a_conditions',
        'Annex 3A ARR': 'annex3a_arrivals',
        'Annex 3A DEP': 'annex3a_departures',
        'Annex 3B DCT': 'annex3b_dct',
        'Annex 3B FRA LIM': 'annex3b_fra'
    }
    
    def __init__(self, excel_path: str):
        self.excel_path = Path(excel_path)
        if not self.excel_path.exists():
            raise FileNotFoundError(f"Fichier non trouvé: {excel_path}")
        
        self.data = {
            'metadata': {},
            'annexes': {},
            'stats': {}
        }
    
    def parse(self):
        """Parse le fichier Excel complet."""
        logger.info(f"📖 Lecture de {self.excel_path.name}")
        
        # Extraire les métadonnées du nom de fichier
        self._extract_metadata()
        
        # Parser chaque feuille
        total_entries = 0
        for sheet_name, json_key in self.SHEET_MAPPING.items():
            logger.info(f"  ⚙️  Parsing {sheet_name}...")
            
            try:
                df = pd.read_excel(
                    self.excel_path, 
                    sheet_name=sheet_name,
                    engine='openpyxl'
                )
                
                parsed_data = self._parse_sheet(sheet_name, df)
                self.data['annexes'][json_key] = parsed_data
                
                count = len(parsed_data) if isinstance(parsed_data, list) else 0
                total_entries += count
                logger.info(f"    ✅ {count} entrées")
                
            except Exception as e:
                logger.error(f"    ❌ Erreur: {e}")
                self.data['annexes'][json_key] = []
        
        # Statistiques
        self.data['stats'] = {
            'total_entries': total_entries,
            'parsed_at': datetime.now().isoformat(),
            'by_annex': {
                key: len(val) if isinstance(val, list) else 0 
                for key, val in self.data['annexes'].items()
            }
        }
        
        logger.info(f"✅ Total: {total_entries} entrées parsées")
        return self.data
    
    def _extract_metadata(self):
        """Extrait cycle, version depuis le nom de fichier."""
        # Format: RAD_2511_v1_17.xlsx
        match = re.search(r'RAD_(\d{4})_v(\d+)_(\d+)', self.excel_path.name)
        
        if match:
            cycle, major, minor = match.groups()
            self.data['metadata'] = {
                'cycle': cycle,
                'version': f"{major}.{minor}",
                'filename': self.excel_path.name,
                'parsed_at': datetime.now().isoformat()
            }
            logger.info(f"📅 Cycle AIRAC: {cycle} - Version: {major}.{minor}")
        else:
            logger.warning("⚠️  Format de nom de fichier non reconnu")
            self.data['metadata'] = {
                'cycle': 'unknown',
                'version': '0.0',
                'filename': self.excel_path.name,
                'parsed_at': datetime.now().isoformat()
            }
    
    def _parse_sheet(self, sheet_name: str, df: pd.DataFrame):
        """Dispatcher vers la bonne méthode selon le type de feuille."""
        
        # Nettoyer les noms de colonnes
        df.columns = df.columns.str.replace('\n', ' ').str.strip()
        
        # Router selon le type
        if 'Annex 2B' in sheet_name:
            return self._parse_annex_2b(df)
        elif 'Annex 2A' in sheet_name:
            return self._parse_annex_2a(df)
        elif 'Annex 2C' in sheet_name:
            return self._parse_annex_2c(df)
        elif 'Annex 1' in sheet_name:
            return self._parse_annex_1(df)
        elif 'Annex 3A' in sheet_name:
            return self._parse_annex_3a(df, sheet_name)
        elif 'Annex 3B' in sheet_name:
            return self._parse_annex_3b(df, sheet_name)
        else:
            return []
    
    def _parse_annex_2b(self, df: pd.DataFrame):
        """Parse Annex 2B - Capacity & Structural Rules (le plus important)."""
        rules = []
        
        for idx, row in df.iterrows():
            # Ignorer les lignes sans ID
            if pd.isna(row.get('ID')):
                continue
            
            rule = {
                'id': self._safe_str(row.get('ID')),
                'change_indicator': self._safe_str(row.get('Change Ind.')),
                'valid_from': self._safe_str(row.get('Valid From')),
                'valid_until': self._safe_str(row.get('Valid Until')),
                'airway': self._safe_str(row.get('Airway')),
                'from_point': self._safe_str(row.get('From')),
                'to_point': self._safe_str(row.get('To')),
                'point_or_airspace': self._safe_str(row.get('Point or Airspace')),
                'utilization': self._safe_str(row.get('Utilization')),
                'time_applicability': self._safe_str(row.get('Time Applicability')),
                'categorisation': self._safe_str(row.get('Categorisation')),
                'operational_goal': self._safe_str(row.get('Operational Goal')),
                'remarks': self._safe_str(row.get('Remarks')),
                'atc_unit': self._safe_str(row.get('ATC Unit')),
                'nas_fab': self._safe_str(row.get('NAS/FAB')),
                'release_date': self._safe_str(row.get('Release Date')),
                'special_event': self._safe_str(row.get('Special Event and Crisis')),
                
                # Métadonnées pour recherche
                'annex': '2B',
                'type': 'Capacity & Structural Rule',
                'searchable_text': self._build_searchable_text(row)
            }
            
            rules.append(rule)
        
        return rules
    
    def _parse_annex_2a(self, df: pd.DataFrame):
        """Parse Annex 2A - Flight Level Capping Rules."""
        rules = []
        
        for idx, row in df.iterrows():
            if pd.isna(row.get('ID')):
                continue
            
            rule = {
                'id': self._safe_str(row.get('ID')),
                'change_indicator': self._safe_str(row.get('Change Ind.')),
                'valid_from': self._safe_str(row.get('Valid From')),
                'valid_until': self._safe_str(row.get('Valid Until')),
                'airspace': self._safe_str(row.get('Airspace')),
                'utilization': self._safe_str(row.get('Utilization')),
                'time_applicability': self._safe_str(row.get('Time Applicability')),
                'operational_goal': self._safe_str(row.get('Operational Goal')),
                'remarks': self._safe_str(row.get('Remarks')),
                'nas_fab': self._safe_str(row.get('NAS/FAB')),
                'release_date': self._safe_str(row.get('Release Date')),
                
                'annex': '2A',
                'type': 'Flight Level Capping Rule',
                'searchable_text': self._build_searchable_text(row)
            }
            
            rules.append(rule)
        
        return rules
    
    def _parse_annex_2c(self, df: pd.DataFrame):
        """Parse Annex 2C - FUA Traffic Flow Rules."""
        rules = []
        
        for idx, row in df.iterrows():
            if pd.isna(row.get('ID')):
                continue
            
            rule = {
                'id': self._safe_str(row.get('ID')),
                'change_indicator': self._safe_str(row.get('Change Ind.')),
                'valid_from': self._safe_str(row.get('Valid From')),
                'valid_until': self._safe_str(row.get('Valid Until')),
                'airspace': self._safe_str(row.get('Airspace')),
                'utilization': self._safe_str(row.get('Utilization')),
                'time_applicability': self._safe_str(row.get('Time Applicability')),
                'categorisation': self._safe_str(row.get('Categorisation')),
                'operational_goal': self._safe_str(row.get('Operational Goal')),
                'remarks': self._safe_str(row.get('Remarks')),
                'nas_fab': self._safe_str(row.get('NAS/FAB')),
                'release_date': self._safe_str(row.get('Release Date')),
                'group_id': self._safe_str(row.get('Group ID')),
                
                'annex': '2C',
                'type': 'FUA Traffic Flow Rule',
                'searchable_text': self._build_searchable_text(row)
            }
            
            rules.append(rule)
        
        return rules
    
    def _parse_annex_1(self, df: pd.DataFrame):
        """Parse Annex 1 - Area Definitions."""
        areas = []
        
        for idx, row in df.iterrows():
            if pd.isna(row.get('ID')):
                continue
            
            area = {
                'id': self._safe_str(row.get('ID')),
                'change_indicator': self._safe_str(row.get('Change Ind.')),
                'valid_from': self._safe_str(row.get('Valid From')),
                'valid_until': self._safe_str(row.get('Valid Until')),
                'definition': self._safe_str(row.get('Definition')),
                'remarks': self._safe_str(row.get('Remarks')),
                'owner': self._safe_str(row.get('Owner')),
                'release_date': self._safe_str(row.get('Release Date')),
                
                'annex': '1',
                'type': 'Area Definition',
                'searchable_text': self._build_searchable_text(row)
            }
            
            areas.append(area)
        
        return areas
    
    def _parse_annex_3a(self, df: pd.DataFrame, sheet_name: str):
        """Parse Annex 3A - Aerodrome Connectivity."""
        entries = []

        # Déterminer le type et les noms de colonnes spécifiques
        # NOTE: Les \n ont été remplacés par des espaces lors du nettoyage des colonnes (ligne 127)
        if 'ARR' in sheet_name:
            entry_type = 'Arrival'
            id_col = 'ARR ID'
            ad_col = 'ARR AD'
            time_col = 'ARR Time Applicability'  # Espace, pas \n
            goal_col = 'ARR Operational Goal'  # Espace, pas \n
            remarks_col = 'ARR Remarks'
            extra_cols = {
                'first_pt_star': 'First PT STAR / STAR ID',  # Espace, pas \n
                'dct_arr_pt': 'DCT ARR PT',
                'arr_fpl_option': 'ARR FPL Option'
            }
        elif 'DEP' in sheet_name:
            entry_type = 'Departure'
            id_col = 'DEP ID'
            ad_col = 'DEP AD'
            time_col = 'DEP Time Applicability'  # Espace, pas \n
            goal_col = 'DEP Operational Goal'  # Espace, pas \n
            remarks_col = 'DEP Remarks'
            extra_cols = {
                'last_pt_sid': 'Last PT SID / SID ID',  # Espace, pas \n
                'dct_dep_pt': 'DCT DEP PT',
                'dep_fpl_options': 'DEP FPL Options'
            }
        else:  # Conditions
            entry_type = 'Condition'
            id_col = 'RAD Application ID'
            ad_col = None  # Pas d'aérodrome pour les conditions
            time_col = 'Time Applicability'  # Espace, pas \n
            goal_col = None
            remarks_col = None
            extra_cols = {
                'condition': 'Condition',
                'explanation': 'Explanation'
            }

        for idx, row in df.iterrows():
            # Ignorer les lignes vides (pas d'ID)
            if pd.isna(row.get(id_col)):
                continue

            # Structure de base commune à tous les types
            entry = {
                'id': self._safe_str(row.get(id_col)),
                'change_indicator': self._safe_str(row.get('Change Ind.')),  # Espace, pas \n
                'valid_from': self._safe_str(row.get('Valid From')),  # Espace, pas \n
                'valid_until': self._safe_str(row.get('Valid Until')),  # Espace, pas \n
                'nas_fab': self._safe_str(row.get('NAS / FAB')),
                'release_date': self._safe_str(row.get('Release Date')),  # Espace, pas \n
                'special_event': self._safe_str(row.get('Special Event and Crisis')),  # Espace, pas \n

                'annex': '3A',
                'type': f'Aerodrome Connectivity - {entry_type}',
                'searchable_text': self._build_searchable_text(row)
            }

            # Ajouter l'aérodrome si applicable
            if ad_col:
                entry['aerodrome'] = self._safe_str(row.get(ad_col))

            # Ajouter les champs spécifiques
            if time_col:
                entry['time_applicability'] = self._safe_str(row.get(time_col))
            if goal_col:
                entry['operational_goal'] = self._safe_str(row.get(goal_col))
            if remarks_col:
                entry['remarks'] = self._safe_str(row.get(remarks_col))

            # Ajouter les colonnes extra spécifiques au type
            for key, col in extra_cols.items():
                entry[key] = self._safe_str(row.get(col))

            entries.append(entry)

        return entries
    
    def _parse_annex_3b(self, df: pd.DataFrame, sheet_name: str):
        """Parse Annex 3B - En-route DCT Options and FRA Limitations."""
        entries = []

        # Déterminer le type et la colonne ID selon l'onglet
        if 'FRA' in sheet_name:
            entry_type = 'FRA Limitation'
            id_col = 'RAD Application ID'  # FRA LIM utilise cette colonne
        else:
            entry_type = 'DCT Option'
            id_col = 'ID'  # DCT utilise la colonne standard ID

        # Trouver la colonne ID réelle (avec variations possibles)
        id_col_actual = None
        for col in df.columns:
            col_normalized = col.lower().replace(' ', '').replace('\n', '')
            id_normalized = id_col.lower().replace(' ', '').replace('\n', '')
            if id_normalized in col_normalized:
                id_col_actual = col
                break

        if not id_col_actual:
            logger.warning(f"Colonne '{id_col}' non trouvée dans {sheet_name}")
            return entries

        for idx, row in df.iterrows():
            if pd.isna(row.get(id_col_actual)):
                continue

            entry = {
                'id': self._safe_str(row.get(id_col_actual)),
                'change_indicator': self._safe_str(row.get('Change Ind.')),
                'valid_from': self._safe_str(row.get('Valid From')),
                'valid_until': self._safe_str(row.get('Valid Until')),
                'from_point': self._safe_str(row.get('From')),
                'to_point': self._safe_str(row.get('To')),
                'utilization': self._safe_str(row.get('Utilization')),
                'time_applicability': self._safe_str(row.get('Time Applicability')),
                'remarks': self._safe_str(row.get('Remarks')),
                'atc_unit': self._safe_str(row.get('ATC Unit')),
                'nas_fab': self._safe_str(row.get('NAS/FAB')),

                'annex': '3B',
                'type': entry_type,
                'searchable_text': self._build_searchable_text(row)
            }

            entries.append(entry)

        return entries
    
    def _safe_str(self, value):
        """Convertit une valeur en string safe (gère NaN, None)."""
        if pd.isna(value) or value is None:
            return ""
        return str(value).strip()
    
    def _build_searchable_text(self, row: pd.Series):
        """Construit un champ texte pour recherche full-text."""
        searchable = []
        
        for col, val in row.items():
            if pd.notna(val) and str(val).strip():
                searchable.append(str(val).strip())
        
        return " | ".join(searchable).upper()
    
    def save_json(self, output_path: str, indent: int = 2):
        """Sauvegarde les données en JSON."""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"💾 Sauvegarde vers {output_path}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=indent, ensure_ascii=False)
        
        # Statistiques
        file_size = output_path.stat().st_size / 1024  # KB
        total = self.data['stats']['total_entries']
        
        logger.info(f"✅ Fichier généré:")
        logger.info(f"   - {total} entrées totales")
        logger.info(f"   - {file_size:.1f} KB")
        
        return self.data


def main():
    """Point d'entrée du script."""
    parser = argparse.ArgumentParser(
        description='Parse RAD Excel file to optimized JSON',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  python rad_parser.py RAD_2511_v1_17.xlsx output.json
  python rad_parser.py ../data/raw/RAD.xlsx ../frontend/public/rad-data.json --indent 0
        """
    )
    
    parser.add_argument('input', help='Input Excel file (RAD_YYMM_vX_YY.xlsx)')
    parser.add_argument('output', help='Output JSON file')
    parser.add_argument('--indent', type=int, default=2, 
                       help='JSON indent (default: 2, use 0 for minified)')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Verbose output')
    
    args = parser.parse_args()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    try:
        # Parse
        rad_parser = RADParser(args.input)
        data = rad_parser.parse()
        
        # Save
        rad_parser.save_json(args.output, indent=args.indent)
        
        logger.info("🎉 Parsing terminé avec succès!")
        return 0
        
    except FileNotFoundError as e:
        logger.error(f"❌ {e}")
        return 1
    except Exception as e:
        logger.error(f"❌ Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
