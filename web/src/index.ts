import express, { Request, Response } from 'express';
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques à partir du dossier `public`
app.use(express.static(path.join(__dirname, '../public')));

// Définir une route de base
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, './html/home.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
