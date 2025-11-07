#!/usr/bin/env python3
"""
Script de validation du fichier JSON RAD généré

Usage:
    python validate_rad.py rad-data.json
"""

import json
import sys
from pathlib import Path

def validate_rad(json_path):
    """Valide la structure du fichier JSON RAD."""
    
    print(f"🔍 Validation de {json_path}")
    
    # 1. Check file exists
    path = Path(json_path)
    if not path.exists():
        print(f"❌ Fichier non trouvé: {json_path}")
        return False
    
    # 2. Load JSON
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("✅ JSON valide")
    except json.JSONDecodeError as e:
        print(f"❌ JSON invalide: {e}")
        return False
    
    # 3. Check structure
    required_keys = ['metadata', 'annexes', 'stats']
    for key in required_keys:
        if key not in data:
            print(f"❌ Clé manquante: {key}")
            return False
    
    print("✅ Structure valide")
    
    # 4. Check metadata
    metadata = data['metadata']
    if 'cycle' not in metadata or not metadata['cycle']:
        print("⚠️  Métadonnée 'cycle' manquante")
    else:
        print(f"✅ Cycle AIRAC: {metadata['cycle']}")
    
    # 5. Check annexes
    annexes = data['annexes']
    total_entries = 0
    
    for annex_key, entries in annexes.items():
        if not isinstance(entries, list):
            print(f"❌ {annex_key} n'est pas une liste")
            return False
        
        count = len(entries)
        total_entries += count
        print(f"✅ {annex_key}: {count} entrées")
    
    # 6. Stats check
    stats_total = data['stats'].get('total_entries', 0)
    if stats_total != total_entries:
        print(f"⚠️  Incohérence stats: {stats_total} vs {total_entries}")
    
    # 7. File size
    file_size = path.stat().st_size / 1024  # KB
    print(f"✅ Taille: {file_size:.1f} KB")
    
    # 8. Sample validation (check first entry)
    for annex_key, entries in annexes.items():
        if entries:
            first = entries[0]
            required_fields = ['id', 'annex', 'type']
            missing = [f for f in required_fields if f not in first]
            if missing:
                print(f"⚠️  {annex_key}: champs manquants dans première entrée: {missing}")
            break
    
    print("\n✅ Validation réussie!")
    print(f"   Total: {total_entries} entrées")
    print(f"   Taille: {file_size:.1f} KB")
    
    return True


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python validate_rad.py <rad-data.json>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    success = validate_rad(json_file)
    
    sys.exit(0 if success else 1)
