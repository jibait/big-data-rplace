import express, { Request, Response } from 'express';
import path from "node:path";
import fs from 'fs';
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

const HDFS_HOST = "http://hadoop-master:9870/webhdfs/v1";
const DATASET_DIR = path.join(__dirname, '../public/datasets/');

async function readFileFromHDFS(filePath: string): Promise<string> {
    try {
        const response = await axios.get(`${HDFS_HOST}${filePath}?op=OPEN`, {
            responseType: 'stream',
            maxRedirects: 5,
        });

        let fileContent = '';

        response.data.on('data', (chunk: Buffer) => {
            fileContent += chunk.toString();
        });

        return new Promise((resolve, reject) => {
            response.data.on('end', () => resolve(fileContent));
            response.data.on('error', (error: Error) => reject(error));
        });

    } catch (error) {
        console.error("Erreur lors de la lecture du fichier HDFS:", error);
        throw error;
    }
}

async function saveContentAsCSV(fileName: string, headers: string[], content: string): Promise<void> {

    const filePath = path.join(DATASET_DIR, fileName);
    fs.mkdirSync(DATASET_DIR, { recursive: true });

    // Créer le contenu CSV avec les en-têtes
    const csvContent = headers.join(",") + "\n" + content;

    // Écrire le fichier CSV (remplace s'il existe déjà)
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, csvContent, 'utf8', (err) => {
            if (err) {
                console.error("Erreur lors de l'enregistrement du fichier CSV :", err);
                reject(err);
            } else {
                console.log(`Fichier CSV enregistré : ${filePath}`);
                resolve();
            }
        });
    });
}

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques à partir du dossier public
app.use(express.static(path.join(__dirname, '../public')));

// Route de base
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, './html/home.html'));
});


const createFileReadingRoute = (hdfsPath: string, fileName: string, headers: string[]) => {
    return async (req: Request, res: Response) => {
        try {
            const fileContent = await readFileFromHDFS(hdfsPath);
            await saveContentAsCSV(fileName, headers, fileContent);

            res.send(`Fichier CSV enregistré : ${fileName}`);
        } catch (error) {
            res.status(500).send("Erreur lors de la lecture du fichier HDFS ou de l'enregistrement du fichier CSV");
        }
    };
};


app.get("/modification-count-by-color", createFileReadingRoute(
    "/user/root/data/output/modification-count-by-color/part-00000",
    "modification-count-by-color.csv",
    ["Color", "ModificationCount"]
));

app.get("/modification-count-by-coordinate", createFileReadingRoute(
    "/user/root/data/output/modification-count-by-coordinate.png",
    "modification-count-by-coordinate.csv",
    ["XCoordinate", "YCoordinate", "ModificationCount"]
));

app.get("/modification-count-by-hours", createFileReadingRoute(
    "/user/root/data/output/modification-count-by-hours/part-00000",
    "modification-count-by-hours.csv",
    ["Hour", "ModificationCount"]
));

app.get("/modification-count-by-user", createFileReadingRoute(
    "/user/root/data/output/modification-count-by-user/part-00000",
    "modification-count-by-user.csv",
    ["User", "ModificationCount"]
));

app.get("/most-placed-color-by-coordinate", createFileReadingRoute(
    "/user/root/data/output/most-placed-color-by-coordinate.png",
    "most-placed-color-by-coordinate.csv",
    ["XCoordinate", "YCoordinate", "Color", "PlacementCount"]
));

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
