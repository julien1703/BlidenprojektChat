import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import say from 'say';

dotenv.config();
const app = express();
const port = 3000;

// Verwenden Sie das Hauptverzeichnis für statische Dateien
app.use(express.static('.'));

app.use(express.json({ limit: '1mb' }));

app.post('/analyze', async (req, res) => {
    const imageBase64 = req.body.image;
    try {
      const description = await analyzeImage(imageBase64);
      say.speak(description, () => {
        res.json({ message: 'Analyse erfolgreich', description });
      });
    } catch (error) {
      console.error('Fehler bei der Bildanalyse:', error);
      res.status(500).json({ message: 'Interner Serverfehler', error: error.toString() });
    }
  });
  
  

  async function analyzeImage(imageBase64) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "dall-e-2",
          prompt: "ein Bild, das eine Szene beschreibt",
          n: 1,
          size: "1024x1024"
        })
      });
  
      if (!response.ok) {
        const errorBody = await response.text();  // Versuchen, die Antwort als Text zu lesen
        throw new Error(`API-Fehler: ${response.status} ${errorBody}`);
      }
  
      const data = await response.json();
      return data.choices[0].text; // Annahme, dass die API eine Textbeschreibung liefert
    } catch (error) {
      console.error('Fehler bei der API-Anfrage:', error);
      throw error;  // Re-throw the error to be caught by the route handler
    }
  }
  
  

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
