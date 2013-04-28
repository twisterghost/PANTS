// Imports.
var Worker = require('webworker-threads').Worker;
var fs = require('fs');
var colors = require('colors');

// Set up command line arguments.
var argv = require('optimist')
    .usage("Detects possible threats in genetic test data.\nUsage: $0")
    .default('cores', 4)
    .describe('cores', 'Sets the number of threads to use.')
    .default('l', false)
    .describe('l', 'Run algorithm linearly.')
    .default('train', 'trainData')
    .describe('train', 'The training data file.')
    .default('test', 'testData')
    .describe('test', 'The testing data file.')
    .argv;

// Welcome message.
console.log("Welcome to PANTS\nParallel Anomaly Nonlinear Tracking System".bold);
console.log("(c) Laura Anzaldi & Michael Barrett 2013\n");


/**
 * readPatientData()
 * Learns the data from a given file.
 * Params:
 *   filename - The path to the file to learn.
 *
 * Returns an array of the patient data.
 */
function readPatientData(filename) {
  var fileData = fs.readFileSync(filename);
  var patients = fileData.toString().split("\n");
  var patientData = [];

  for (var i = 0; i < patients.length; i++) {
    patientData[i] = patients[i].split(",");
  }

  return patientData;
}


/**
 * getPatientDistance()
 * Calculates the delta between two patients.
 * Params:
 *   patientA - A patient data array to test distance from.
 *   patientB - A patient data array to test distance to.
 *
 * Returns the total distance between the two pateitn data arrays.
 */
function getPatientDistance(patientA, patientB) {
  var delta = 0;

  // Get the delta for each position, not including the patient status.
  for (var i = 0; i < patientA.length - 1; i++) {
    delta += Math.abs(parseInt(patientA[i]) - parseInt(patientB[i]));
  }

  return delta;
}


/**
 * getPatientStatus()
 * Params:
 *   patientData - A pateitn data array to find the status from.
 *
 * Returns the status of the given patient.
 */
function getPatientStatus(patientData) {
  return patientData[patientData.length - 1];
}


/**
 * findLowestDelta()
 * Finds which training data patient has the smallest delta from the test data.
 * Params:
 *   testPatient - A patient data array to test deltas for.
 *   trainPatientData - Training patient data read from a train file.
 *
 * Returns the index of the smallest delta found in trainPatientData.
 */
function findLowestDelta(testPatient, trainPatientData) {
  var smallestDelta = -1;
  var returnIndex = -1;

  for (var i = 0; i < trainPatientData.length; i++) {
    var thisDelta = getPatientDistance(testPatient, trainPatientData[i]);

    // If this has the smallest delta so far or nothing is set yet...
    if (thisDelta < smallestDelta || smallestDelta == -1) {
      smallestDelta = thisDelta;
      returnIndex = i;
    }
  }

  return returnIndex;
}


/**
 * linearTest()
 * Driving function for running the test on a single thread.
 * Invoked with the -l argument.
 */
function linearTest() {
  console.log("Running linearly using 1 thread.".yellow);
  var trainPatientData = readPatientData(argv.train);
  var testPatientData = readPatientData(argv.test);
  var correct = 0;
  var total = testPatientData.length;

  var introText = "Diagnosing " + total + " patients using " +
    trainPatientData.length + " training patients...";
  console.log(introText.yellow);

  for (var i = 0; i < testPatientData.length; i++) {
    var closestTrainPatient = findLowestDelta(testPatientData[i], trainPatientData);
    var realAnswer = getPatientStatus(testPatientData[i]);
    var guessedAnswer = getPatientStatus(trainPatientData[closestTrainPatient]);

    // Print out patient information.
    console.log("\nPatient #" + (i + 1));
    console.log("Closest match: Training patient " + (closestTrainPatient + 1));

    // Print out guess information.
    var guessText = "Guessed: " + guessedAnswer + ", Correct: " + realAnswer;
    if (guessedAnswer == realAnswer) {
      console.log(guessText.green);
      correct++;
    } else {
      console.log(guessText.red);
    }
  }

  console.log("Guessed " + correct + "/" + total);
  var percent = Math.floor((correct / total) * 100);
  console.log(percent + "% accuracy.");
}


if (argv.l) {
  linearTest();
}