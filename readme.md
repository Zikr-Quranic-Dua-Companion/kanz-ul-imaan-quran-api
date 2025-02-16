# Kanzul Imaan Quran API - Verses with Translations (English, Roman Urdu, and Both)

This project provides an API to fetch Quranic verses along with their translations in **English**, **Roman Urdu**, and **Both Translations**. The API includes the ability to retrieve specific **Surahs**, **Juzs**, and **individual Ayahs** with the translations.

English Translation:
- By **Aqib Farid Qadri**

## Features

1. **Surah-Based Endpoints**: Get all the verses of a specific Surah with **English**, **Roman Urdu**, or **Both** translations.
2. **Juz-Based Endpoints**: Retrieve all the verses for a specific Juz with **English**, **Roman Urdu**, or **Both** translations.
3. **Random Ayah**: Fetch a random Ayah with **English**, **Roman Urdu**, or **Both** translations.
4. **Customizable Routes**: You can fetch specific data by providing the Surah ID, Juz ID, or a random selection.

---

## Installation

### Prerequisites:
- Node.js (v14 or higher)
- A JSON dataset (Quran data) which contains the Arabic text and translations in both **English** and **Roman Urdu**.

### Setup Instructions:
1. Clone this repository:
   ```bash
   git clone https://github.com/your-repository-url.git
   cd your-repository-directory


2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`.

---

## API Endpoints

### 1. **Get Surah with Both Translations (English and Roman Urdu)**

   - **URL**: `/surah-with-both-translations/:id`
   - **Method**: GET
   - **URL Params**: 
     - `id`: Surah ID (1-114).
   
   - **Response**:
     ```json
     {
       "verses": [
         {
           "id": 1,
           "verse_key": "1:1",
           "arabicText": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
           "englishTranslationText": "Praise be to Allah, the Lord of all the worlds.",
           "romanUrduTranslationText": "Alhamdulillah Rabbil Alameen"
         },
         ...
       ],
       "meta": {
         "filters": {
           "chapter_number": "1"
         }
       }
     }
     ```

### 2. **Get Juz with Both Translations (English and Roman Urdu)**

   - **URL**: `/juzz-with-both-translations/:id`
   - **Method**: GET
   - **URL Params**: 
     - `id`: Juz ID (1-30).
   
   - **Response**:
     ```json
     {
       "verses": [
         {
           "id": 1,
           "verse_key": "1:1",
           "arabicText": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
           "englishTranslationText": "Praise be to Allah, the Lord of all the worlds.",
           "romanUrduTranslationText": "Alhamdulillah Rabbil Alameen"
         },
         ...
       ],
       "meta": {
         "filters": {
           "juz_number": "3"
         }
       }
     }
     ```

### 3. **Get Random Ayah with Both Translations**

   - **URL**: `/random-ayah-both`
   - **Method**: GET
   - **Response**:
     ```json
     {
       "id": 1,
       "verse_key": "1:1",
       "arabicText": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
       "englishTranslationText": "Praise be to Allah, the Lord of all the worlds.",
       "romanUrduTranslationText": "Alhamdulillah Rabbil Alameen"
     }
     ```

### 4. **Get Random Ayah in Roman Urdu**

   - **URL**: `/random-ayah-roman`
   - **Method**: GET
   - **Response**:
     ```json
     {
       "id": 1,
       "verse_key": "1:1",
       "arabicText": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
       "romanUrduTranslationText": "Alhamdulillah Rabbil Alameen"
     }
     ```

### 5. **Get Juz with Roman Urdu Translation**

   - **URL**: `/juzz-with-roman-translation/:id`
   - **Method**: GET
   - **URL Params**: 
     - `id`: Juz ID (1-30).
   
   - **Response**:
     ```json
     {
       "verses": [
         {
           "id": 1,
           "verse_key": "1:1",
           "arabicText": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
           "romanUrduTranslationText": "Alhamdulillah Rabbil Alameen"
         },
         ...
       ],
       "meta": {
         "filters": {
           "juz_number": "3"
         }
       }
     }
     ```

### 6. **Get Surah with Roman Urdu Translation**

   - **URL**: `/surah-with-roman-translation/:id`
   - **Method**: GET
   - **URL Params**: 
     - `id`: Surah ID (1-114).
   
   - **Response**:
     ```json
     {
       "verses": [
         {
           "id": 1,
           "verse_key": "1:1",
           "arabicText": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
           "romanUrduTranslationText": "Alhamdulillah Rabbil Alameen"
         },
         ...
       ],
       "meta": {
         "filters": {
           "chapter_number": "1"
         }
       }
     }
     ```

### 7. **Get Surah with English Translation**

   - **URL**: `/surah-with-english-translation/:id`
   - **Method**: GET
   - **URL Params**: 
     - `id`: Surah ID (1-114).
   
   - **Response**:
     ```json
     {
       "verses": [
         {
           "id": 1,
           "verse_key": "1:1",
           "arabicText": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
           "englishTranslationText": "Praise be to Allah, the Lord of all the worlds."
         },
         ...
       ],
       "meta": {
         "filters": {
           "chapter_number": "1"
         }
       }
     }
     ```

### 8. **Get Juz with English Translation**

   - **URL**: `/juzz-with-english-translation/:id`
   - **Method**: GET
   - **URL Params**: 
     - `id`: Juz ID (1-30).
   
   - **Response**:
     ```json
     {
       "verses": [
         {
           "id": 1,
           "verse_key": "1:1",
           "arabicText": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
           "englishTranslationText": "Praise be to Allah, the Lord of all the worlds."
         },
         ...
       ],
       "meta": {
         "filters": {
           "juz_number": "3"
         }
       }
     }
     ```

---

## Conclusion

This API allows you to retrieve Quranic verses in multiple languages (Arabic, English, Roman Urdu) through customizable endpoints. Whether you are building a Quranic app or simply want to access the verses and their meanings, this API provides all the necessary functionality.

Feel free to explore the various endpoints and utilize the data for your personal or development needs!

**Made by Umair Dada** -- S/O Aqib Farid Qadri.