const { google } = require('googleapis');
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config(); // Load environment variables from .env

const privateKey = process.env.PRIVATE_KEY;

const client = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  privateKey,
  ['https://www.googleapis.com/auth/spreadsheets']
);
// Specify your Google Sheets IDs
const sourceSheetId = '1l9GrPrsmQ_oswA5UtUk08UTqTczz5sdQVb_hsmjOl7w'; // Link 1
const targetSheetId = '1JeJ1iX2QaE4XioIhbQoVdEmYe9gXv10E4Uq-OUS9-hY'; // Link 2

// Get the Sheets API
const sheets = google.sheets({ version: 'v4', auth: client });

// Function to copy data from source to target
async function syncSheets() {
  try {
    // Get data from the source sheet
    const sourceData = await sheets.spreadsheets.values.get({
      spreadsheetId: sourceSheetId,
      range: 'A1:Z1000', // Adjust the range as needed
    });

    // Check if source data exists
    if (!sourceData.data.values || sourceData.data.values.length === 0) {
      console.log('No data found in the source sheet.');
      return;
    }

    // Update the target sheet with the source data
    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSheetId,
      range: 'A1', // Starting point to update
      valueInputOption: 'RAW',
      resource: {
        values: sourceData.data.values,
      },
    });
    console.log('Sync completed successfully!');
    
  } catch (error) {
    console.error('Error syncing sheets:', error.message);
  }
}

// Run the sync function every 2 seconds using setInterval
setInterval(() => {
    console.log('Running sync...'); 
  syncSheets();
}, 1000); // 2000 milliseconds = 2 seconds

// Authorize the client and start the synchronization process
client.authorize((err) => {
  if (err) {
    console.error('Error creating client:', err);
    return;
  }
  syncSheets(); // Initial sync when the script starts
});
