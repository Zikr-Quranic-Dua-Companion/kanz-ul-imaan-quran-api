const express = require("express");
const fs = require("fs");
const path = require("path");
const english = require('english');

const app = express();
const PORT = 3000;

// Path to the folder containing Quran JSON files
const quranFolder = path.join(__dirname, "quran");

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
        quranData = quranData.concat(fileData);
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

// Endpoint to get a Surah by its ID
app.get("/surah-orignal/:id", (req, res) => {
  const surahId = req.params.id;

  // Validate that quranData is an array
  if (!Array.isArray(quranData)) {
    return res.status(500).json({ message: "Quran data is not loaded properly" });
  }

  // Filter ayahs belonging to the requested Surah ID, with safe property access
  const surahData = quranData.filter((ayah) => {
    if (!ayah.surah || !ayah.surah.id) {
      return false;
    }
    return ayah.surah.id.toString() === surahId;
  });

  if (surahData.length === 0) {
    return res.status(404).json({ message: "Surah not found" });
  }

  res.json(surahData);
});

// Just Arabic Text Formatted
app.get("/surah/:id", (req, res) => {
  const surahId = req.params.id;

  // Filter ayahs belonging to the requested Surah ID
  const surahData = quranData.filter((ayah) => {
    if (!ayah.surah || !ayah.surah.id) {
      return false;
    }
    return ayah.surah.id.toString() === surahId;
  });

  if (surahData.length === 0) {
    return res.status(404).json({ message: "Surah not found" });
  }

  // Format the verses
  const verses = surahData.map((ayah, index) => {
    return {
      id: index + 1, // Start from 1
      verse_key: `${surahId}:${index + 1}`,
      arabicText: ayah.arabicText || "" // Replaced text_indopak with arabicText
    };
  });

  const response = {
    verses: verses,
    meta: {
      filters: {
        chapter_number: surahId
      }
    }
  };

  res.json(response);
});

app.get("/random-ayah", (req, res) => {
  if (!Array.isArray(quranData) || quranData.length === 0) {
    return res.status(500).json({ message: "Quran data is not loaded properly" });
  }

  // Pick a random ayah
  const randomIndex = Math.floor(Math.random() * quranData.length);
  const randomAyah = quranData[randomIndex];

  // Format the response
  const response = {
    id: randomAyah.id || randomIndex + 1,
    verse_key: `${randomAyah.surah?.id || "unknown"}:${randomAyah.ayatNumber || "unknown"}`,
    arabicText: randomAyah.arabicText || "N/A"
  };

  res.json(response);
});

// get the juz by id
app.get("/juzz/:id", (req, res) => {
  const juzId = req.params.id;

  // Filter ayahs belonging to the requested Juz ID
  const juzData = quranData.filter((ayat) => {
    if (!ayat.juz || !ayat.juz.id) {
      return false;
    }
    return ayat.juz.id.toString() === juzId;
  });

  if (juzData.length === 0) {
    return res.status(404).json({ message: "Juz not found" });
  }

  // Sort the ayats by surah.id and then by ayatNumber
  const sortedJuzData = juzData.sort((a, b) => {
    const surahComparison = a.surah?.id - b.surah?.id;
    if (surahComparison !== 0) {
      return surahComparison; // If Surahs are different, sort by Surah id
    }
    return a.ayatNumber - b.ayatNumber; // If Surahs are the same, sort by Ayat number
  });

  // Format the verses
  const verses = sortedJuzData.map((ayat, index) => {
    const surahId = ayat.surah?.id || "unknown"; // Safely access surah id
    const ayatNumber = ayat.ayatNumber || "unknown"; // Safely access ayat number

    return {
      id: index + 1, // Start from 1
      verse_key: `${surahId}:${ayatNumber}`, // Correctly format surah_id:ayatNumber
      arabicText: ayat.arabicText || "N/A"
    };
  });

  const response = {
    verses: verses,
    meta: {
      filters: {
        juz_number: juzId
      }
    }
  };

  res.json(response);
});


// ---- ENGLISH TRANSLATION ----
// Endpoint to get a Surah by its ID
app.get("/surah-with-translation/:id", (req, res) => {
  const surahId = req.params.id;

  // Filter ayahs belonging to the requested Surah ID
  const surahData = quranData.filter((ayah) => {
    if (!ayah.surah || !ayah.surah.id) {
      return false;
    }
    return ayah.surah.id.toString() === surahId;
  });

  if (surahData.length === 0) {
    return res.status(404).json({ message: "Surah not found" });
  }

  // Format the verses with cleaned English translation using the english library
  const verses = surahData.map((ayah, index) => {
    const cleanedTranslation = ayah.englishTranslationText
      ? ayah.englishTranslationText
          .replace(/\t/g, ' ')              // Replace tab characters with space
          .replace(/\n/g, ' ')               // Replace newlines with spaces
          .replace(/\s+/g, ' ')              // Replace multiple spaces with a single space
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase letters
          .replace(/([a-zA-Z])([0-9])/g, '$1 $2')  // Add space between letters and numbers
          .replace(/([0-9])([a-zA-Z])/g, '$1 $2')  // Add space between numbers and letters
          .replace(/([a-zA-Z])([^\w\s])/g, '$1 $2') // Add space before punctuation marks
          .replace(/([^\w\s])([a-zA-Z])/g, '$1 $2') // Add space after punctuation marks
          .replace(/[^a-zA-Z0-9\s-]/g, ' ')       // Replace all non-alphanumeric characters except spaces and dashes with space
          .replace(/\s+/g, ' ')                // Replace multiple spaces with a single space again
          .trim()                            // Trim leading and trailing spaces
          .split(' ')                        // Split the sentence into words
          .join(' ')                         // Join the words with a single space
      : "Translation not available";

    return {
      id: index + 1, // Start from 1
      verse_key: `${surahId}:${index + 1}`,
      arabicText: ayah.arabicText || "", // Arabic Text
      englishTranslationText: cleanedTranslation // Cleaned English Translation Text
    };
  });

  const response = {
    verses: verses,
    meta: {
      filters: {
        chapter_number: surahId
      }
    }
  };

  res.json(response);
});


app.get("/juzz-with-translation/:id", (req, res) => {
  const juzId = req.params.id;

  // Filter ayahs belonging to the requested Juz ID
  const juzData = quranData.filter((ayah) => {
    if (!ayah.juz || !ayah.juz.id) {
      return false;
    }
    return ayah.juz.id.toString() === juzId;
  });

  if (juzData.length === 0) {
    return res.status(404).json({ message: "Juz not found" });
  }

  // Format the verses with cleaned English translation using the english library
  const verses = juzData.map((ayah, index) => {
    const cleanedTranslation = ayah.englishTranslationText
      ? ayah.englishTranslationText
          .replace(/\t/g, ' ')              // Replace tab characters with space
          .replace(/\n/g, ' ')               // Replace newlines with spaces
          .replace(/\s+/g, ' ')              // Replace multiple spaces with a single space
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase letters
          .replace(/([a-zA-Z])([0-9])/g, '$1 $2')  // Add space between letters and numbers
          .replace(/([0-9])([a-zA-Z])/g, '$1 $2')  // Add space between numbers and letters
          .replace(/([a-zA-Z])([^\w\s])/g, '$1 $2') // Add space before punctuation marks
          .replace(/([^\w\s])([a-zA-Z])/g, '$1 $2') // Add space after punctuation marks
          .replace(/[^a-zA-Z0-9\s-]/g, ' ')       // Replace all non-alphanumeric characters except spaces and dashes with space
          .replace(/\s+/g, ' ')                // Replace multiple spaces with a single space again
          .trim()                            // Trim leading and trailing spaces
          .split(' ')                        // Split the sentence into words
          .join(' ')                         // Join the words with a single space
      : "Translation not available";

    return {
      id: index + 1, // Start from 1
      verse_key: `${juzId}:${index + 1}`,
      arabicText: ayah.arabicText || "", // Arabic Text
      englishTranslationText: cleanedTranslation // Cleaned English Translation Text
    };
  });

  const response = {
    verses: verses,
    meta: {
      filters: {
        juz_number: juzId
      }
    }
  };

  res.json(response);
});


app.get("/random-ayah-english", (req, res) => {
  // Generate a random index between 0 and the total number of verses in the Quran data
  const randomIndex = Math.floor(Math.random() * quranData.length);

  const randomAyah = quranData[randomIndex];

  // Clean the English translation for the random verse
  const cleanedTranslation = randomAyah.englishTranslationText
    ? randomAyah.englishTranslationText
        .replace(/\t/g, ' ')              // Replace tab characters with space
        .replace(/\n/g, ' ')              // Replace newlines with spaces
        .replace(/\s+/g, ' ')             // Replace multiple spaces with a single space
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase letters
        .replace(/([a-zA-Z])([0-9])/g, '$1 $2')  // Add space between letters and numbers
        .replace(/([0-9])([a-zA-Z])/g, '$1 $2')  // Add space between numbers and letters
        .replace(/([a-zA-Z])([^\w\s])/g, '$1 $2') // Add space before punctuation marks
        .replace(/([^\w\s])([a-zA-Z])/g, '$1 $2') // Add space after punctuation marks
        .replace(/[^a-zA-Z0-9\s-]/g, ' ')       // Replace all non-alphanumeric characters except spaces and dashes with space
        .replace(/\s+/g, ' ')                 // Replace multiple spaces with a single space again
        .trim()                              // Trim leading and trailing spaces
        .split(' ')                          // Split the sentence into words
        .join(' ')                           // Join the words with a single space
    : "Translation not available";

  // Prepare the response with the random Ayah
  const response = {
    verse: {
      id: randomIndex + 1,
      verse_key: `${randomAyah.surah?.id || "unknown"}:${randomAyah.ayatNumber || "unknown"}`,
      arabicText: randomAyah.arabicText,
      englishTranslationText: cleanedTranslation
    }
  };

  res.json(response);
});

// ---- URDU ENGLISH TRANSLATION ----

app.get("/surah-with-roman-translation/:id", (req, res) => {
  const surahId = req.params.id;

  // Filter ayahs belonging to the requested Surah ID
  const surahData = quranData.filter((ayah) => {
    if (!ayah.surah || !ayah.surah.id) {
      return false;
    }
    return ayah.surah.id.toString() === surahId;
  });

  if (surahData.length === 0) {
    return res.status(404).json({ message: "Surah not found" });
  }

  // Format the verses with minimal cleaning of Roman Urdu translation
  const verses = surahData.map((ayah, index) => {
    const cleanedRomanTranslation = ayah.romanUrduTranslationText
      ? ayah.romanUrduTranslationText
          .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
          .trim()                  // Trim leading and trailing spaces
      : "Translation not available";

    return {
      id: index + 1, // Start from 1
      verse_key: `${surahId}:${index + 1}`,
      arabicText: ayah.arabicText || "", // Arabic Text
      romanUrduTranslationText: cleanedRomanTranslation // Roman Urdu Translation Text
    };
  });

  const response = {
    verses: verses,
    meta: {
      filters: {
        chapter_number: surahId
      }
    }
  };

  res.json(response);
});

app.get("/juzz-with-roman-translation/:id", (req, res) => {
  const juzId = req.params.id;

  // Filter ayahs belonging to the requested Juz ID
  const juzData = quranData.filter((ayah) => {
    if (!ayah.juz || !ayah.juz.id) {
      return false;
    }
    return ayah.juz.id.toString() === juzId;
  });

  if (juzData.length === 0) {
    return res.status(404).json({ message: "Juz not found" });
  }

  // Format the verses with minimal cleaning of Roman Urdu translation
  const verses = juzData.map((ayah, index) => {
    const cleanedRomanTranslation = ayah.romanUrduTranslationText
      ? ayah.romanUrduTranslationText
          .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
          .trim()                  // Trim leading and trailing spaces
      : "Translation not available";

    return {
      id: index + 1, // Start from 1
      verse_key: `${juzId}:${index + 1}`,
      arabicText: ayah.arabicText || "", // Arabic Text
      romanUrduTranslationText: cleanedRomanTranslation // Roman Urdu Translation Text
    };
  });

  const response = {
    verses: verses,
    meta: {
      filters: {
        juzz_number: juzId
      }
    }
  };

  res.json(response);
});

app.get("/random-ayah-roman", (req, res) => {
  // Get a random Ayah from the dataset
  const randomAyah = quranData[Math.floor(Math.random() * quranData.length)];

  // Clean the Roman Urdu translation
  const cleanedRomanTranslation = randomAyah.romanUrduTranslationText
    ? randomAyah.romanUrduTranslationText
        .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
        .trim()                  // Trim leading and trailing spaces
    : "Translation not available";

  const response = {
    id: randomAyah.id,
    verse_key: `${randomAyah.surah?.id || "unknown"}:${randomAyah.ayatNumber || "unknown"}`,
    arabicText: randomAyah.arabicText || "", // Arabic Text
    romanUrduTranslationText: cleanedRomanTranslation // Roman Urdu Translation Text
  };

  res.json(response);
});

// ---- CLEAN ----
app.get("/random-ayah-both", (req, res) => {
  // Get a random Ayah from the dataset
  const randomAyah = quranData[Math.floor(Math.random() * quranData.length)];

  // Clean the English translation
  const cleanedEnglishTranslation = randomAyah.englishTranslationText
    ? randomAyah.englishTranslationText
        .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
        .trim()                  // Trim leading and trailing spaces
    : "Translation not available";

  // Clean the Roman Urdu translation
  const cleanedRomanTranslation = randomAyah.romanUrduTranslationText
    ? randomAyah.romanUrduTranslationText
        .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
        .trim()                  // Trim leading and trailing spaces
    : "Translation not available";

  const response = {
    id: randomAyah.id,
    verse_key: `${randomAyah.surah?.id || "unknown"}:${randomAyah.ayatNumber || "unknown"}`,
    arabicText: randomAyah.arabicText || "", // Arabic Text
    englishTranslationText: cleanedEnglishTranslation, // English Translation Text
    romanUrduTranslationText: cleanedRomanTranslation // Roman Urdu Translation Text
  };

  res.json(response);
});

app.get("/surah-with-both-translations/:id", (req, res) => {
  const surahId = req.params.id;

  // Filter ayahs belonging to the requested Surah ID
  const surahData = quranData.filter((ayah) => {
    if (!ayah.surah || !ayah.surah.id) {
      return false;
    }
    return ayah.surah.id.toString() === surahId;
  });

  if (surahData.length === 0) {
    return res.status(404).json({ message: "Surah not found" });
  }

  // Format the verses with both English and Roman Urdu translations
  const verses = surahData.map((ayah, index) => {
    const cleanedEnglishTranslation = ayah.englishTranslationText
      ? ayah.englishTranslationText
          .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
          .trim()                  // Trim leading and trailing spaces
      : "Translation not available";

    const cleanedRomanTranslation = ayah.romanUrduTranslationText
      ? ayah.romanUrduTranslationText
          .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
          .trim()                  // Trim leading and trailing spaces
      : "Translation not available";

    return {
      id: index + 1, // Start from 1
      verse_key: `${surahId}:${index + 1}`,
      arabicText: ayah.arabicText || "", // Arabic Text
      englishTranslationText: cleanedEnglishTranslation, // English Translation Text
      romanUrduTranslationText: cleanedRomanTranslation // Roman Urdu Translation Text
    };
  });

  const response = {

    verses: verses,
    meta: {
      filters: {
        chapter_number: surahId
      }
    }
  };

  res.json(response);
});

app.get("/juzz-with-both-translations/:id", (req, res) => {
  const juzId = req.params.id;

  // Filter ayahs belonging to the requested Juz ID
  const juzData = quranData.filter((ayah) => {
    if (!ayah.juz || !ayah.juz.id) {
      return false;
    }
    return ayah.juz.id.toString() === juzId;
  });

  if (juzData.length === 0) {
    return res.status(404).json({ message: "Juz not found" });
  }

  // Format the verses with both English and Roman Urdu translations
  const verses = juzData.map((ayah, index) => {
    const cleanedEnglishTranslation = ayah.englishTranslationText
      ? ayah.englishTranslationText
          .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
          .trim()                  // Trim leading and trailing spaces
      : "Translation not available";

    const cleanedRomanTranslation = ayah.romanUrduTranslationText
      ? ayah.romanUrduTranslationText
          .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
          .trim()                  // Trim leading and trailing spaces
      : "Translation not available";

    return {
      id: index + 1, // Start from 1
      verse_key: `${juzId}:${index + 1}`,
      arabicText: ayah.arabicText || "", // Arabic Text
      englishTranslationText: cleanedEnglishTranslation, // English Translation Text
      romanUrduTranslationText: cleanedRomanTranslation // Roman Urdu Translation Text
    };
  });

  const response = {
    verses: verses,
    meta: {
      filters: {
        juz_number: juzId
      }
    }
  };

  res.json(response);
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
