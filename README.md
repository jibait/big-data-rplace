# big-data-rplace

Projet BigData ESIEA 2024-2025

## Traitement de données

### Dataset

Le dataset utilisé pour ce projet est un fichier CSV de 21,7 GB contenant l'ensemble des pixels posés sur la fresque du r/place 2022 de Reddit. Ce dataset est disponible à l'URL [https://www.kaggle.com/datasets/antoinecarpentier/redditrplacecsv](https://www.kaggle.com/datasets/antoinecarpentier/redditrplacecsv).

Le fichier CSV contient les colonnes suivantes séparées par des virgules :
- `timestamp` : Date et heure de la pose du pixel
- `user_id` : Hash de l'utilisateur ayant posé le pixel
- `color` : Couleur du pixel posé
- `coordonnées` : Coordonnée x et y du pixel posé

Les lignes du fichier sont formatées de la manière suivante :
```
2022-04-04 00:53:51.577 UTC,ovTZk4GyTS1mDQnTbV+vDOCu1f+u6w+CkIZ6445vD4XN8alFy/6GtNkYp5MSic6Tjo/fBCCGe6oZKMAN3rEZHw==,#00CCC0,"826,1048"
```

### Sélection du dataset

Par défaut, le dataset utilisé est le fichier `data/input/10k.csv` qui contient les 10 000 premières lignes du dataset complet. Pour utiliser le dataset complet, ou tout autre extrait du dataset, il faut :
- Placer le fichier dans le dossier `data/input` de ce projet
- Copier le fichier `.env.template` en `.env` et modifier la variable `INPUT_FILE_NAME` pour indiquer le nom du fichier à utiliser

### Execution des traitements sur le container Hadoop

Pour exécuter l'ensemble les traitements sur le container Hadoop, il faut démarrer les conteneurs docker avec la commande suivante :

```bash
docker-compose up --build
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

Les résultats des traitements se trouveront dans le dossier `/user/root/data/output` du hdfs :

```
/user/root/data/output/modification-count-by-color/part-00000
/user/root/data/output/modification-count-by-coordinate.png
/user/root/data/output/modification-count-by-hours/part-00000
/user/root/data/output/modification-count-by-user/part-00000
/user/root/data/output/most-placed-color-by-coordinate.png
```


### Execution des traitements en local

Pour exécuter les traitements en local, il faut exécuter l'un des scripts pythons, présents dans le dossier `hadoop-spark/scripts/` avec 2 arguments, le fichier d'entrée et le dossier de sortie.

Par exemple, pour exécuter le script `modification-count-by-color` :

```bash
python data/scripts/modification-count-by-color.py data/input/10k.csv data/output/modification-count-by-color
```
