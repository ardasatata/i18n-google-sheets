const { program } = require('commander');
const { translateFromSheets } = require('./index');

program
  .option('-i, --id <spreadsheetId>', 'Google Spreadsheet ID')
  .option('-s, --secret <serviceAccountPath>', 'Path to service account JSON')
  .option('-o, --output <outputPath>', 'Output directory for translations', './translations')
  .option('-l, --langs <languages...>', 'Language codes (space-separated)', ['en', 'jp'])
  .description('Extract translations from a Google Sheet')
  .action(async (options) => {
    try {
      await translateFromSheets(
        options.id,
        options.secret,
        options.output,
        options.langs
      );
    } catch (error) {
      console.error('Translation process failed:', error);
    }
  });

program.parse(process.argv);
