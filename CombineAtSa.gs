// Daphne Barretto
// Combining Automated Translation and Sentiment Analysis

// Language ISO-638-1 Codes
var Language = {
  CHINESE_SIMPLIFIED: "zh",
//  CHINESE_TRADITIONAL: "zh-Hant",
  ENGLISH: "en",
  FRENCH: "fr",
  GERMAN: "de",
  ITALIAN: "it",
  JAPANESE: "ja",
  KOREAN: "ko",
  PORTUGUESE_BRAZILIAN_AND_CONTINENTAL: "pt",
  SPANISH: "es"
};

// Project Customization
var apiKey = "AIzaSyAZo1uNm7s_Ia_LMcNAuYYAluv6ri6KkB0"; // unique API key per project
var spreadsheetId = "1Vo_rGGyAc4Ig5O81N-qnchcLm_wzhVym0aoOZggFUmQ"; // spreadsheet id for analysis logging
var sheetName = "r/TodayILearned"; // name of sheet within spreadsheet for analysis logging
var emailAddress = "daphnegb@princeton.edu"; // email address for testToEmail()
var sourceLang = Language.ENGLISH; // source language for entries in sheet

// Combination of automated translation and sentiment analysis in all available languages
function runCombinationAll (text, sourceLanguage) {
  
  var analysis = { };
  for (var name in Language) {
    var code = Language[name];
//    Logger.log(sourceLanguage + "\t" + code);
    if (sourceLanguage != code)
      analysis[code] = runCombination(text, sourceLanguage, code);
    else
      analysis[code] = runSentimentAnalysis(text, sourceLanguage);
  }
  
  analysis["random_to_source"] = runRandomToSourceCombination(text, sourceLanguage);
  
  return analysis;
  
}

// Combination of automated translation and sentiment analysis in specified language
function runCombination (text, sourceLanguage, targetLanguage) {
  
  if (sourceLanguage == targetLanguage)
    return "";
  
//  Logger.log("runComb\t" + sourceLanguage + "\t" + targetLanguage);
  
  var translation = LanguageApp.translate(text, sourceLanguage, targetLanguage);
  return runSentimentAnalysis(translation, targetLanguage);
  
}

function runRandomToSourceCombination (text, sourceLanguage) {
  
  var targetLanguage = null;
  var langArr = Object.keys(Language);
  var numLang = langArr.length;
  do {
    var randInt = Math.floor(Math.random() * Math.floor(numLang));
    targetLanguage = Language[langArr[randInt]];
  } while (sourceLanguage == targetLanguage);
  
  var translation = LanguageApp.translate(text, sourceLanguage, targetLanguage);
  var returnTranslation = LanguageApp.translate(translation, targetLanguage, sourceLanguage);
  
  var analysis = runSentimentAnalysis(returnTranslation, sourceLanguage);
  analysis["foreign_lang"] = targetLanguage;
  
  return analysis;

}

// Runs Google Natural Language sentiment analysis on given text using given language system
function runSentimentAnalysis (text, sourceLanguage) {
  
  var apiEndpoint = "https://language.googleapis.com/v1/documents:analyzeSentiment?key=" + apiKey;
 
  // Create JSON requestion with text, language, type, and coding
  var nlData = {
    document: {
      language: sourceLanguage,
      type: 'PLAIN_TEXT',
      content: text
    },
    encodingType: 'UTF8'
  };
  
  // Package options and JSON data
  var nlOptions = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(nlData)
  };

  // Make the call
  var response = UrlFetchApp.fetch(apiEndpoint, nlOptions);
  return JSON.parse(response);

}

// unit testing to email
function testToEmail() {
  
  var text = "I love cars. I hate buildings.";
  
  var analysisString = JSON.stringify(runCombinationAll(text, Language.ENGLISH));
  var message = analysisString + "\n\nBest, Your Code";
  
  var subject = "Combining Automated Translation and Sentiment Analysis";
  
  MailApp.sendEmail(emailAddress, subject, message);
  
}

// unit testing to spreadsheet
function testToSheet() {

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  
  var text = sheet.getRange("A3").getValue();
  
  var analysis = runCombinationAll(text, Language.ENGLISH);
  var analysisString = JSON.stringify(analysis);
  
  var message = analysisString + "\n\nBest, Your Code";
  
  var subject = "Combining Automated Translation and Sentiment Analysis";
  
  MailApp.sendEmail(emailAddress, subject, message);
  
  var row = 3;
  var column = 2;
  for (var languageCode in analysis) {
    var docSen = analysis[languageCode].documentSentiment;
    var docMagnitude = docSen.magnitude;
    var docScore = docSen.score;
    
    sheet.getRange(row, column).setValue(docMagnitude);
    sheet.getRange(row, column + 1).setValue(docScore);
    column += 2;
  }
  
}

function testIterateRows() {
  
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  
  var textArr = sheet.getSheetValues(3, 1, sheet.getLastRow() - 2, 1);

  var row = 3;
  for (var i = 0; i < textArr.length; i++) {
    var text = textArr[i][0];
    
    var analysis = runCombinationAll(text, sourceLang);
    var analysisString = JSON.stringify(analysis);
  
    var message = analysisString + "\n\nBest, Your Code";
    var subject = "Combining Automated Translation and Sentiment Analysis";
  
    MailApp.sendEmail(emailAddress, subject, message);
    
    var column = 2;
    for (var languageCode in analysis) {
      var docSen = analysis[languageCode].documentSentiment;
      var docMagnitude = docSen.magnitude;
      var docScore = docSen.score;
      
      sheet.getRange(row, column).setValue(docMagnitude);
      sheet.getRange(row, column + 1).setValue(docScore);
      column += 2;
    }
    
    sheet.getRange(row, column).setValue(analysis.random_to_source.foreign_lang);
    row += 1;
  }
  
}

// generic testing
function test() {
  
  var text = "Buenos días. Buenas tardes. Encantado de conocerte.";
  var translation = LanguageApp.translate(text, "es", "en");
  var returnTranslation = LanguageApp.translate(translation, "en", "es");
  Logger.log(translation);
  Logger.log(returnTranslation);

}