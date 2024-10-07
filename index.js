const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");
const path = require('path'); // Added for path resolution
const isEmpty = require('./utils/isEmpty');
const jwt = require('./utils/jwt');

// Function to generate translations for a specific language
async function generateLang(doc, lang) {
  await doc.loadInfo();
  const sheets = doc.sheetsByIndex;

  let resultLang = {};
  await Promise.all(
    sheets.map(async (sheet) => {
      const key = sheet.title;
      const rows = await sheet.getRows({ limit: sheet.rowCount });
      const colTitles = sheet.headerValues;
      const rowKey = colTitles[0];
      let resultTranslationKey = {};
      rows.map((row) => {
        const key = row.get(rowKey);
        const value = row.get(lang);

        if (!isEmpty(key) && !isEmpty(value)) {
          resultTranslationKey = {
            ...resultTranslationKey,
            [key]: value,
          };
        }
      });
      resultLang = {
        ...resultLang,
        [key]: resultTranslationKey,
      };
    })
  );
  return resultLang;
}

// Function to iterate through languages and generate translations
async function translateFromSheets(spreadsheetId, serviceAccountPath, outputPath, langs) {
  const secret = require(path.resolve(serviceAccountPath)); // Resolve path
  const doc = new GoogleSpreadsheet(
    spreadsheetId,
    jwt(secret.client_email, secret.private_key)
  );

  const results = {};
  await Promise.all(
    langs.map(async (lang) => {
      results[lang] = await generateLang(doc, lang);
    })
  );

  // Write translations to JSON files
  Object.keys(results).forEach((key) => {
    const filePath = path.join(outputPath, `${key}.json`); // Construct file path
    fs.writeFileSync( // Use writeFileSync for synchronous writing
      filePath,
      JSON.stringify(results[key], null, 2),
      (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err);
        } else {
          console.log(`Translations saved to: ${filePath}`);
        }
      }
    );
  });
}

module.exports = {
  translateFromSheets,
};
