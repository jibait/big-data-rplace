# big-data-rplace

Projet BigData ESIEA 2024-2025

## Traitement de données

### Execution des traitements sur le container Hadoop

Pour exécuter l'ensemble les traitements sur le container Hadoop, il faut démarrer les conteneurs docker avec la commande suivante :

```bash
docker-compose up
```

Puis, en se connectant au container hadoop, on peut exécuter les scripts python avec la commande suivante :

```bash
# Connexion au container hadoop-master
docker exec -it hadoop-master bash
```
```bash
# Exécution des traitements
/root/start-processing.sh
```

Les résultats des traitements se trouveront dans le dossier `data/output/` du hdfs.


### Execution des traitements en local

Pour exécuter les traitements en local, il faut exécuter l'un des scripts pythons, présents dans le dossier `hadoop-spark/scripts/` avec 2 arguments, le fichier d'entrée et le dossier de sortie.

Par exemple, pour exécuter le script `modification-count-by-color` :

```bash
python data/scripts/modification-count-by-color.py data/input/10k.csv data/output/modification-count-by-color
```
