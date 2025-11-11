#!/usr/bin/env python3
"""
Script de diagnostic pour analyser Annex 3A ARR
"""

import pandas as pd
import sys

def diagnose_annex3a(excel_file):
    print(f"[DIAGNOSTIC] Analyse de : {excel_file}")
    print("=" * 80)

    # Lire l'onglet Annex 3A ARR
    sheet_name = 'Annex 3A ARR'
    print(f"\n[INFO] Lecture de l'onglet: {sheet_name}")

    try:
        df = pd.read_excel(excel_file, sheet_name=sheet_name, engine='openpyxl')
    except Exception as e:
        print(f"[ERROR] Erreur lors de la lecture: {e}")
        return

    print(f"[OK] {len(df)} lignes trouvees")
    print(f"[OK] {len(df.columns)} colonnes trouvees")

    # Afficher les noms de colonnes
    print(f"\n[COLONNES] Noms des colonnes :")
    for i, col in enumerate(df.columns):
        print(f"  {i+1}. '{col}'")

    # Chercher LF5835
    print(f"\n[RECHERCHE] Recherche de l'ID 'LF5835' :")

    # Trouver la bonne colonne ID
    id_col = None
    for col in df.columns:
        if 'ID' in col.upper() and 'STAR' not in col.upper():
            id_col = col
            break

    if id_col:
        # Recherche exacte
        matches_exact = df[df[id_col] == 'LF5835']
        print(f"  - Recherche exacte: {len(matches_exact)} resultat(s)")

        # Recherche avec contains (pour les espaces)
        matches_contains = df[df[id_col].astype(str).str.contains('LF5835', na=False)]
        print(f"  - Recherche contains: {len(matches_contains)} resultat(s)")

        # Afficher toutes les lignes contenant LF5835
        if len(matches_contains) > 0:
            print(f"\n[RESULTAT] Ligne(s) trouvee(s) avec LF5835:")
            for idx, row in matches_contains.iterrows():
                print(f"\n  Ligne Excel #{idx + 2}:")  # +2 car index 0 + header
                for col in df.columns:
                    value = row[col]
                    if pd.notna(value) and str(value).strip():
                        print(f"    {col}: {value}")
        else:
            print(f"\n[WARNING] Aucune ligne avec LF5835 trouvee!")
            print(f"\n[INFO] Affichage des 10 premiers IDs pour reference:")
            first_ids = df[id_col].dropna().head(10).tolist()
            for i, id_val in enumerate(first_ids, 1):
                print(f"  {i}. {id_val}")
    else:
        print(f"  [ERROR] Colonne 'ID' non trouvee!")
        print(f"  Colonnes disponibles: {', '.join(df.columns)}")

    # Statistiques
    print(f"\n[STATS] Statistiques de l'onglet:")
    print(f"  - Lignes totales: {len(df)}")

    # Trouver la colonne ID
    id_col_stats = None
    for col in df.columns:
        if 'ID' in col.upper() and 'STAR' not in col.upper():
            id_col_stats = col
            break

    if id_col_stats:
        print(f"  - Lignes avec ID ({id_col_stats}): {df[id_col_stats].notna().sum()}")
    else:
        print(f"  - Lignes avec ID: N/A")

    # Trouver la colonne Aerodrome/AD
    ad_col = None
    for col in df.columns:
        if 'AD' in col.upper() or 'AERODROME' in col.upper():
            ad_col = col
            break

    if ad_col:
        print(f"  - Lignes avec Aerodrome ({ad_col}): {df[ad_col].notna().sum()}")
    else:
        print(f"  - Lignes avec Aerodrome: N/A")

    # Vérifier les lignes qui seraient ignorées par le parser actuel
    if id_col_stats:
        ignored = df[pd.isna(df[id_col_stats])]
        print(f"  - Lignes ignorees (sans ID): {len(ignored)}")
        print(f"  - Lignes capturees: {len(df) - len(ignored)}")

    print(f"\n[OK] Diagnostic termine")
    print("=" * 80)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        excel_file = sys.argv[1]
    else:
        excel_file = 'data/raw/RAD_2511_v1_19.xlsx'

    diagnose_annex3a(excel_file)
