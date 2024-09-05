# big-data-rplace

Projet BigData ESIEA 2024-2025

## Traitement de données

### Execution des traitements en local

Pour exécuter les traitements en local, il faut exécuter l'un des scripts pythons, présents dans le dossier `hadoop-spark/scripts/` avec 2 arguments, le fichier d'entrée et le dossier de sortie.

Par exemple, pour exécuter le script `modification-count-by-color` :

```bash
python hadoop-spark/scripts/modification-count-by-color.py hadoop-spark/input/10k.csv hadoop-spark/output/modification-count-by-color
```
