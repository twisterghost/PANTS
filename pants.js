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
var tumorCount = 0;
var healthyCount = 0;
var testPatientData ;

// Initialize arrays to 0.
for (var i = 0; i < 12600; i++) {
  averageTumor[i] = 0;
  averageHealthy[i] = 0;
}

console.log("Welcome to PANTS\nParallel Anomoly Nonlinear Tracking System".bold);
console.log("(c) Laura Anzaldi & Michael Barrett 2013\n");

console.log("Loading test patient data...".cyan);

// Load test pateint data into variable.
testPatientData = fs.readFileSync("trainData");

// Split test pateint data into an array by patient.
console.log("Parsing loaded data...".cyan);
testPatientData = testPatientData.toString().split("\n");

// Linear option.
if (argv.l) {
  console.log("Using linear averaging algorithm...".yellow);
  linearAverage();
  console.log("Linear averaging complete.".yellow);
}

// Linear averaging function for use with the -l argument.
function linearAverage() {
  
  // Loop through every train data patient, load into either array.
  for (var i = 0; i < testPatientData.length; i++) {
    
    var patient = testPatientData[i].split(",");
    
    if (patient[12600] == "Tumor") {
            
      // Add this data to the tumor array.
      for (var j = 0; j < patient.length - 1; j++) {
        averageTumor[j] += parseInt(patient[j]);
      }
      
      // Increase counter for tumors.
      tumorCount++;
    } else {
      
      // Add this data to the tumor array.
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
