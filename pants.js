// Imports.
var Worker = require('webworker-threads').Worker;
var argv = require('optimist')
    .usage("Detects possible threats in genetic test data.\nUsage: $0")
    .default('cores', 4)
    .describe('cores', 'Sets the number of threads to use.')
    .default('l', false)
    .describe('l', 'Run algorithm linearly.')
    .argv;
var fs = require('fs');
var colors = require('colors');

// Define variables.
var averageTumor = [];
var averageHealthy = [];
var deltaTumor = [];
var deltaHealthy = [];
var testAnswers = [];
var tumorCount = 0;
var healthyCount = 0;
var trainPatientData ;
var testPatientData;
var guessAnswer = [];

// Initialize arrays to 0.
for (var i = 0; i < 12600; i++) {
  averageTumor[i] = 0;
  averageHealthy[i] = 0;
}

console.log("Welcome to PANTS\nParallel Anomaly Nonlinear Tracking System".bold);
console.log("(c) Laura Anzaldi & Michael Barrett 2013\n");

console.log("Loading patient data...".cyan);

// Load train patient data into variable. (renamed 'trainPatientData')
trainPatientData = fs.readFileSync("trainData");

// Split train patient data into an array by patient.
console.log("Parsing loaded train data...".cyan);
trainPatientData = trainPatientData.toString().split("\n");

// Load test patient data into variable.)
testPatientData = fs.readFileSync("testData");

// Split train patient data into an array by patient.
console.log("Parsing loaded test data...".cyan);
testPatientData = testPatientData.toString().split("\n");
  

// Linear option.
if (argv.l) {
  console.log("Using linear averaging algorithm...".yellow);
  linearAverage();
  console.log("Linear averaging complete.".yellow);
  console.log("Now examining test data...".yellow);
  linearCompare();
  console.log("Delta computation complete.".yellow);
  
  var tumorRight = 0;
  var healthyRight = 0;
  var tumorWrong = 0;
  var healthyWrong = 0;

  // accuracy computations...maybe should go in another function?
  for (var i = 0; i < testPatientData.length; i++) {
    answer = testAnswers[i];
    prediction = guessAnswer[i];
    console.log("Patient " + i + ": predicted: " + prediction + ", actually " + answer);
  
    if(answer == "Tumor") {
      if (prediction == "Tumor"){
        tumorRight += 1;
      }
      else {
        tumorWrong += 1;
      }
    } else {
      if (prediction == "Normal") {
        healthyRight += 1;
      } else {
        healthyWrong += 1;
      }
    }
  }

  var perTumorRight = 100 * (tumorRight / (tumorRight + tumorWrong));
  var perHealthyRight = 100 * (healthyRight / (healthyRight + healthyWrong));
  var perTotalRight = 100* ((tumorRight + healthyRight) / testPatientData.length);
  
  console.log("Correctly predicted " + parseInt(perTumorRight) + "% of tumor samples");
  console.log("Correctly predicted " + parseInt(perHealthyRight) + "% of normal samples");
  console.log("Overall accuracy: " + parseInt(perTotalRight) + "%");    
}

function linearCompare() {
  

  for (var i = 0; i < testPatientData.length; i++) {
    var patient = testPatientData[i].split(",");
    testAnswers[i] = patient[12600];
    var lowestDelta = 10000000;
    var lowestDeltaIndex = -1;

    for (var j = 0; j < trainPatientData.length; j++) {
      var compareTo = trainPatientData[j].split(",");
      var delta = 0;
      
      // Get the delta.
      for (var k = 0; k < compareTo.length - 1; k++) {
        delta += Math.abs(compareTo[k] - patient[k]);
      }
      
      if (delta < lowestDelta) {
        lowestDelta = delta;
        lowestDeltaIndex = j;
      }
    }
    console.log("compared to " + lowestDeltaIndex + " with " + lowestDelta);
    var selected = trainPatientData[lowestDeltaIndex].split(",");
    guessAnswer[i] = selected[12600];
  }
}


// Linear delta function for use with -l argument.
// assumes testPatientData has already been populated
function linearDelta() {
  for (var i = 0; i < testPatientData.length; i++) {
    var patient = testPatientData[i].split(",");
    testAnswers[i] = patient[12600];
    deltaTumor[i] = 0;
    deltaHealthy[i] = 0;
  
    for(var j = 0; j < patient.length - 1; j++) {
      deltaTumor[i] += Math.abs(averageTumor[j] - parseInt(patient[j]));
      deltaHealthy[i] += Math.abs(averageHealthy[j] - parseInt(patient[j]));
    }

  }
}

// Linear averaging function for use with the -l argument.
function linearAverage() {
  
  // Loop through every train data patient, load into either array.
  for (var i = 0; i < trainPatientData.length; i++) {
    
    var patient = trainPatientData[i].split(",");
    
    if (patient[12600] == "Tumor") {
            
      // Add this data to the tumor array.
      for (var j = 0; j < patient.length - 1; j++) {
        averageTumor[j] += parseInt(patient[j]);
      }
      
      // Increase counter for tumors.
      tumorCount++;
    } else {
      
      // Add this data to the healthy array.
      for (var j = 0; j < patient.length - 1; j++) {
        averageHealthy[j] += parseInt(patient[j]);
      }
      
      // Increase counter for healthy.
      healthyCount++;
    }
  }
  
  var result = "Found " + tumorCount + " tumor patients and " + healthyCount + " healthy patients.";
  console.log(result.cyan);
  
  // Finally, average both arrays.
  for (var i = 0; i < averageTumor.length; i++) {
    averageTumor[i] /= tumorCount;
    averageHealthy[i] /= healthyCount;
  }

}
