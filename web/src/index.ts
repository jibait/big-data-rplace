import express, { Request, Response } from 'express';
import path from "node:path";
import * as webhdfs from "webhdfs";

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de WebHDFS
const hdfs = webhdfs.createClient({
    user: "hadoop",  // Utilisateur HDFS
    host: "hadoop-master", // Nom de l'hôte du conteneur Hadoop
    port: 9870, // Port pour WebHDFS (par défaut 9870)
    path: "/webhdfs/v1" // Chemin de base pour WebHDFS
});

// lire un fichier depuis HDFS
function readFileFromHDFS(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const remoteFileStream = hdfs.createReadStream(filePath);

        let fileContent = "";

        remoteFileStream.on("data", (chunk) => {
            fileContent += chunk;
        });

        remoteFileStream.on("error", (err) => {
            console.error("Erreur lors de la lecture du fichier HDFS :", err);
            reject(err);
        });

        remoteFileStream.on("end", () => {
            resolve(fileContent);
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

// Route pour lire un fichier HDFS
app.get("/read-file", async (req, res) => {
    const filePath = "data/output/modification-count-by-color/part-00000";
    try {
        const fileContent = await readFileFromHDFS(filePath);
        res.send(`Contenu du fichier : ${fileContent}`);
    } catch (error) {
        res.status(500).send("Erreur lors de la lecture du fichier HDFS");
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
