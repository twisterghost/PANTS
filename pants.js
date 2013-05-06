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
    .default('k', 2)
    .describe('k', 'k parameter for nearest neighbors')
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
 * votePatients()
 * Params:
 *   patientData - An associative array of indices to a patient's k nearestNeighbors
 *   key = index, value = distance
 * Returns the status of the given patient.
 */
function votePatients(neighbors, testData) {
  var votes = new Object();

  // weight by distance, nearer neighbors get larger vote
  var base = getClosestDelta(neighbors);

  for(i in neighbors)
  {
     var patient = testData[i];
     var status = patient[patient.length - 1];
     if(votes[status] == null) 
     {
         votes[status] = base / neighbors[i];
     }
     else
     {
        votes[status] += base / neighbors[i];
     }
   }

   var maxVotes = -1;
   var maxStatus = null;
   for(status in votes) 
   {
      if(maxVotes == -1 || votes[status] > maxVotes)
      {
         maxVotes = votes[status];
         maxStatus = status;
      }
    }

  return maxStatus;
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
  var nearestNeighbors = new Object();
  for (var i = 0; i < trainPatientData.length; i++) {
    var thisDelta = getPatientDistance(testPatient, trainPatientData[i]);
    if(Object.keys(nearestNeighbors).length < argv.k)
    {
      nearestNeighbors[i] = thisDelta;
    }
    else
    {

      // if this delta is less than the farthest nearest neighbor
      //console.log(thisDelta, printNN(nearestNeighbors));
      var farthest = getFarthestNeighbor(nearestNeighbors);
      if(thisDelta < nearestNeighbors[farthest])
      {
         nearestNeighbors[i] = thisDelta;
         delete nearestNeighbors[farthest];
         
      }
    }
  }
       
  return nearestNeighbors;
}

/* prints an associative array/object, for debugging */
function printNN(n)
{
   var str = "{";
   for(key in n)
   {
      str+= key + "=>" + n[key] + ", ";
    }
    str = str.substring(0, str.length - 1);
    return str + "}";
}

/* get FarthestNeighbor
 * Params:
 *   n is an associate array of key=index and value=distance
 *   returns the index with the largest distance
*/
function getFarthestNeighbor(n)
{
   maxD = -1;
   maxI = -1;
   for(index in n)
   {
      if(n[index] > maxD)
      {
         maxD = n[index];
         maxI = index;
      }
   }
   return maxI;
}

/* getClosestDelta(n)
 * Params:
 *  n is an associative array of key=index and value=distance
 *  returns the lowest distance
*/
function getClosestDelta(n)
{
   minDelta = Number.MAX_VALUE;
   for(index in n)
   {
       minDelta = (n[index] < minDelta) ? n[index] : minDelta;
   }
   return minDelta
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
    trainPatientData.length + " training patients\nLooking at " + argv.k + " nearest neighbors...";
  console.log(introText.yellow);

  for (var i = 0; i < testPatientData.length; i++) {
    var kNeighbors = findLowestDelta(testPatientData[i], trainPatientData);
    var patient = testPatientData[i];
    var realAnswer = patient[patient.length - 1];
    var guessedAnswer = votePatients(kNeighbors, trainPatientData);

    // Print out patient information.
    console.log("\nPatient #" + (i + 1));
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


// Run the linear test if -l is specified.
if (argv.l) {
  linearTest();
}
