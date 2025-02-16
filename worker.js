import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Cloudflare can cache static resources, so ensure dynamic responses are optimized
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the folder containing Quran JSON files
const quranFolder = path.join(__dirname, "/Quran");

export default function start() {
  const app = express();
  const PORT = 2580;

  // In-memory storage for all Quran data
  let quranData = [];

  // Function to preload all Quran JSON files into memory
  const preloadQuranData = () => {
    try {
      const files = fs.readdirSync(quranFolder);
      files.forEach((file) => {
        try {
          const filePath = path.join(quranFolder, file);
          const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));
          quranData = [...quranData, ...fileData];
          console.log(`✅ Valid file loaded: ${file}`);
        } catch (error) {
          console.error(`❌ Error in file ${file}: ${error.message}`);
        }
      });
      console.log("Quran data loading complete.");
    } catch (error) {
      console.error("Error loading Quran data:", error.message);
      throw error;
    }
  };

  // Preload Quran data when the server starts
  preloadQuranData();

  app.get("/", (req, res) => {
    res.status(200).send("Application is up and running");
  });

  // Helper function to filter Quran data
  const filterById = (data, idKey, id) => {
    return data.filter(item => item[idKey]?.toString() === id);
  };

  // Endpoint to get a Surah by its ID
  app.get("/surah-orignal/:id", (req, res) => {
    const surahId = req.params.id;

    if (!Array.isArray(quranData)) {
      return res.status(500).json({ message: "Quran data is not loaded properly" });
    }

    const surahData = filterById(quranData, 'surah.id', surahId);

    if (surahData.length === 0) {
      return res.status(404).json({ message: "Surah not found" });
    }

    res.json(surahData);
  });

  // Just Arabic Text Formatted
  app.get("/surah/:id", (req, res) => {
    const surahId = req.params.id;
    const surahData = filterById(quranData, 'surah.id', surahId);

    if (surahData.length === 0) {
      return res.status(404).json({ message: "Surah not found" });
    }

    const verses = surahData.map((ayah, index) => ({
      id: index + 1,
      verse_key: `${surahId}:${index + 1}`,
      arabicText: ayah.arabicText || "N/A",
    }));

    res.json({ verses, meta: { filters: { chapter_number: surahId } } });
  });

  // Random Ayah Endpoint
  app.get("/random-ayah", (req, res) => {
    if (!Array.isArray(quranData) || quranData.length === 0) {
      return res.status(500).json({ message: "Quran data is not loaded properly" });
    }

    const randomIndex = Math.floor(Math.random() * quranData.length);
    const randomAyah = quranData[randomIndex];

    res.json({
      id: randomAyah.id || randomIndex + 1,
      verse_key: `${randomAyah.surah?.id || "unknown"}:${randomAyah.ayatNumber || "unknown"}`,
      arabicText: randomAyah.arabicText || "N/A",
    });
  });

  // Juz Endpoint
  app.get("/juzz/:id", (req, res) => {
    const juzId = req.params.id;
    const juzData = filterById(quranData, 'juz.id', juzId);

    if (juzData.length === 0) {
      return res.status(404).json({ message: "Juz not found" });
    }

    const sortedJuzData = juzData.sort((a, b) => {
      const surahComparison = a.surah?.id - b.surah?.id;
      if (surahComparison !== 0) return surahComparison;
      return a.ayatNumber - b.ayatNumber;
    });

    const verses = sortedJuzData.map((ayat, index) => ({
      id: index + 1,
      verse_key: `${ayat.surah?.id}:${ayat.ayatNumber}`,
      arabicText: ayat.arabicText || "N/A",
    }));

    res.json({ verses, meta: { filters: { juz_number: juzId } } });
  });

  // Surah with Translation Endpoint
  app.get("/surah-with-translation/:id", (req, res) => {
    const surahId = req.params.id;
    const surahData = filterById(quranData, 'surah.id', surahId);

    if (surahData.length === 0) {
      return res.status(404).json({ message: "Surah not found" });
    }

    const cleanTranslation = (translation) => {
      return translation
        ? translation
            .replace(/\t/g, " ")
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
            .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
            .replace(/[^a-zA-Z0-9\s-]/g, " ")
            .trim()
        : "Translation not available";
    };

    const verses = surahData.map((ayah, index) => ({
      id: index + 1,
      verse_key: `${surahId}:${index + 1}`,
      arabicText: ayah.arabicText || "N/A",
      englishTranslationText: cleanTranslation(ayah.englishTranslationText),
    }));

    res.json({ verses, meta: { filters: { chapter_number: surahId } } });
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
