import express, { Request, Response } from 'express';
import path from "node:path";
import fs from 'fs';
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

const HDFS_HOST = "http://hadoop-master:9870/webhdfs/v1";
const DATASET_DIR = path.join(__dirname, '../public/datasets/');


async function readFileFromHDFS(filePath: string, responseType: 'stream' | 'arraybuffer' = 'stream'): Promise<Buffer | string> {
    try {
        const response = await axios.get(`${HDFS_HOST}${filePath}?op=OPEN`, {
            responseType,
            maxRedirects: 5,
        });

        if (responseType === 'stream') {
            let fileContent = '';

            response.data.on('data', (chunk: Buffer) => {
                fileContent += chunk.toString();
            });

            return new Promise((resolve, reject) => {
                response.data.on('end', () => resolve(fileContent));
                response.data.on('error', (error: Error) => reject(error));
            });
        } else {
            return Buffer.from(response.data); // Convertit les données reçues en buffer
        }
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier HDFS:", error);
        throw error;
    }
}

async function saveContentAsCSV(fileName: string, headers: string[], content: string): Promise<void> {
    const filePath = path.join(DATASET_DIR, fileName);
    fs.mkdirSync(DATASET_DIR, { recursive: true });

    const csvContent = headers.join(",") + "\n" + content;

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

async function saveBinaryFile(fileName: string, content: Buffer): Promise<void> {
    const filePath = path.join(DATASET_DIR, fileName);
    fs.mkdirSync(DATASET_DIR, { recursive: true });

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                console.error("Erreur lors de l'enregistrement du fichier binaire :", err);
                reject(err);
            } else {
                console.log(`Fichier binaire enregistré : ${filePath}`);
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

const createFileReadingRoute = (hdfsPath: string, fileName: string, headers?: string[]) => {
    return async (req: Request, res: Response) => {
        try {
            if (fileName.endsWith('.csv') && headers) {
                const fileContent = await readFileFromHDFS(hdfsPath) as string;
                await saveContentAsCSV(fileName, headers, fileContent);
                res.send(`Fichier CSV enregistré : ${fileName}`);
            } else if (fileName.endsWith('.png')) {
                const binaryContent = await readFileFromHDFS(hdfsPath, 'arraybuffer') as Buffer;
                await saveBinaryFile(fileName, binaryContent);
                res.send(`Fichier PNG enregistré : ${fileName}`);
            } else {
                res.status(400).send("Type de fichier non pris en charge.");
            }
        } catch (error) {
            console.error("Erreur lors de la lecture ou de l'enregistrement du fichier :", error);
            res.status(500).send("Erreur lors de la lecture du fichier HDFS ou de l'enregistrement du fichier");
        }
    };
};





app.get("/modification-count-by-color", createFileReadingRoute(
    "/user/root/data/output/modification-count-by-color/part-00000",
    "modification-count-by-color.csv",
    ["Color", "ModificationCount"]
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
    "most-placed-color-by-coordinate.png"
));

app.get("/modification-count-by-coordinate", createFileReadingRoute(
    "/user/root/data/output/modification-count-by-coordinate.png",
    "modification-count-by-coordinate.png"
));

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
