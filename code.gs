function doGet() {
  // 1. Force open the spreadsheet using its unique ID
  // Replace 'YOUR_GOOGLE_SHEET_ID_HERE' with your actual spreadsheet ID
  var ss = SpreadsheetApp.openById('1L4Ib6t8g1HqqeHxDneh86Ekuoqj8PqHPuYW65Bwjf7A');
  var sheet = ss.getSheets()[0]; // Reads the very first sheet tab
  var data = sheet.getDataRange().getValues();
  
  var payload = {
    headers: data[0],
    rows: data.slice(1)
  };
  
  // 2. Return data cleanly as JSON format so GitHub can read it safely
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
