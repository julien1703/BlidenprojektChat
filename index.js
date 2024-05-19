import express from 'express';
import fetch from 'node-fetch';
import say from 'say';
import dotenv from 'dotenv';

dotenv.config(); // Stellen Sie sicher, dass Ihre .env Datei den GOOGLE_API_KEY enthält

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' })); // Erhöht das Limit für eingehende JSON-Anfragen

app.post('/analyze', async (req, res) => {
    const imageBase64 = req.body.image;
    try {
        const description = await analyzeImageWithGoogleVision(imageBase64);
        say.speak(description, () => {
            res.json({ message: 'Analyse erfolgreich', description });
        });
    } catch (error) {
        console.error('Fehler bei der Bildanalyse:', error);
        res.status(500).json({ message: 'Interner Serverfehler', error: error.toString() });
    }
});

async function analyzeImageWithGoogleVision(imageBase64) {
    const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=' + process.env.GOOGLE_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requests: [
                {
                    image: { content: imageBase64 },
                    features: [{ type: 'LABEL_DETECTION' }, { type: 'TEXT_DETECTION' }]
                }
            ]
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API-Fehler: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const descriptions = data.responses[0].labelAnnotations.map(label => label.description);
    return descriptions.join(', ');
}

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
