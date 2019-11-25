// Daphne Barretto
// Combining Automated Translation and Sentiment Analysis

// Project Customization
var apiKey = "REMOVED"; // unique API key per project
var sheetId = "REMOVED" // spreadsheet id for analysis logging
var emailAddress = "REMOVED"; // email address for testToEmail()

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

// Combination of automated translation and sentiment analysis in all available languages
function runCombinationAll (text, sourceLanguage) {
  
  var analysis = { };
  for (var name in Language) {
    var code = Language[name];
    Logger.log(sourceLanguage + "\t" + code);
    if (sourceLanguage != code)
      analysis[code] = runCombination(text, sourceLanguage, code);
    else
      analysis[code] = runSentimentAnalysis(text, sourceLanguage);
  }
  
  return analysis;
  
}

// Combination of automated translation and sentiment analysis in specified language
function runCombination (text, sourceLanguage, targetLanguage) {
  
  if (sourceLanguage == targetLanguage)
    return "";
  
  Logger.log("runComb\t" + sourceLanguage + "\t" + targetLanguage);
  
  var translation = LanguageApp.translate(text, sourceLanguage, targetLanguage);
  return runSentimentAnalysis(translation, targetLanguage);
  
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

  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet1");
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

// generic testing
function test() {
  
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet1");
  
  var analysis = JSON.parse('{"zh":{"documentSentiment":{"magnitude":0.8,"score":0.8},"language":"zh","sentences":[{"text":{"content":"我爱电脑。","beginOffset":0},"sentiment":{"magnitude":0.8,"score":0.8}}]},"en":{"documentSentiment":{"magnitude":0.8,"score":0.8},"language":"en","sentences":[{"text":{"content":"I love computers.","beginOffset":0},"sentiment":{"magnitude":0.8,"score":0.8}}]},"fr":{"documentSentiment":{"magnitude":0.7,"score":0.7},"language":"fr","sentences":[{"text":{"content":"J aime les ordinateurs.","beginOffset":0},"sentiment":{"magnitude":0.7,"score":0.7}}]},"de":{"documentSentiment":{"magnitude":0.9,"score":0.9},"language":"de","sentences":[{"text":{"content":"Ich liebe Computer.","beginOffset":0},"sentiment":{"magnitude":0.9,"score":0.9}}]},"it":{"documentSentiment":{"magnitude":0.9,"score":0.9},"language":"it","sentences":[{"text":{"content":"Adoro i computer.","beginOffset":0},"sentiment":{"magnitude":0.9,"score":0.9}}]},"ja":{"documentSentiment":{"magnitude":0.9,"score":0.9},"language":"ja","sentences":[{"text":{"content":"コンピューターが大好きです。","beginOffset":0},"sentiment":{"magnitude":0.9,"score":0.9}}]},"ko":{"documentSentiment":{"magnitude":0.1,"score":0.1},"language":"ko","sentences":[{"text":{"content":"나는 컴퓨터를 좋아합니다.","beginOffset":0},"sentiment":{"magnitude":0.1,"score":0.1}}]},"pt":{"documentSentiment":{"magnitude":0.7,"score":0.7},"language":"pt","sentences":[{"text":{"content":"Eu amo computadores","beginOffset":0},"sentiment":{"magnitude":0.7,"score":0.7}}]},"es":{"documentSentiment":{"magnitude":0.9,"score":0.9},"language":"es","sentences":[{"text":{"content":"Amo las computadoras.","beginOffset":0},"sentiment":{"magnitude":0.9,"score":0.9}}]}}');
  
  var row = 3;
  var column = 2;
  for (var languageCode in analysis) {
    var docSen = analysis[languageCode].documentSentiment;
    var docMagnitude = docSen.magnitude;
    var docScore = docSen.score;
    
    sheet.getRange(row, column).setValue(docMagnitude);
    sheet.getRange(row, column + 1).setValue(docScore);
    column += 2;
    
    Logger.log(docSen);
  }

}