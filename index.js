const { GoogleSpreadsheet } = require("google-spreadsheet");
const secret = require("./service-account.json");
const jwt = require("./utils/jwt")
const isEmpty = require('./utils/isEmpty')
const fs = require("fs");

const DOCUMENT_ID = "1FMLCsDFYrC9FIV0xcOgb-6eafVYr-R77ziL5F1v9WcU"
const TRANSLATION_PATH = "./results/"

// Based on spreadsheet order
const LANG_CODE = ['en', 'jp']

console.log("### Sync translation from google sheet")
console.log("Document ID : ", DOCUMENT_ID)
console.log("Translation path : ", TRANSLATION_PATH)

const doc = new GoogleSpreadsheet(
  DOCUMENT_ID,
  jwt(secret.client_email, secret.private_key)
);

const write = (data) => {
  Object.keys(data).forEach((key) => {
    fs.writeFile(
      `${TRANSLATION_PATH}${key}.json`,
      JSON.stringify(data[key], null, 2),
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  });
};

const generateLang = async (lang) => {
  await doc.loadInfo()
  const sheets = doc.sheetsByIndex

  let resultLang = {};
  await Promise.all(sheets.map(async sheet => {
    const key = sheet.title
    const rows = await sheet.getRows({ limit: sheet.rowCount });
    const colTitles = sheet.headerValues;
    const rowKey = colTitles[0]
    let resultTranslationKey = {}
    rows.map(row => {
      const key = row.get(rowKey)
      const value = row.get(lang)

      if(!isEmpty(key) && !isEmpty(value)){
        resultTranslationKey = {
          ...resultTranslationKey,
          [key] : value
        }
      }
    })
    resultLang = {
      ...resultLang,
      [key]: resultTranslationKey
    }
  }))
  return resultLang
}

const iterateLang = async (langs = [], generateLang)=> {
  const results = {}
  await Promise.all(langs.map(async lang => {
    results[lang] = await generateLang(lang)
  }))
  return results
}

iterateLang(LANG_CODE, generateLang)
  .then((data) => write(data))
  .catch((err) => console.log("ERROR!", err))
  .finally(() => console.log(`### JSON generated, please check ${TRANSLATION_PATH}`));
