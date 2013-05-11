/*
 * parallelCode.js
 * This file contains all of the code which is run in the threads.
 *
 * Webworkers run in a MIMD style scenario - all data is private to each thread.
 *
 * Threads must "learn" their information from the master. The thread ID, k, and
 * the training must be sent. Once a thread receives it's information, it will
 * post a 'ready' message to begin accepting computation requests.
 */

// Declare global variables for this thread.
var id = -1;
var learned = 0;
var trainPatientData = null;
var k = -1;


/**
 * diagnose()
 * Runs the k-nearest neighbor algorithm with the given test patient.
 * Posts back to the main thread with the results.
 * A 'diagnosis' message also prompts for new data.
 */
var diagnose = function(testPatientData, patientID) {
  try {
    var kNeighbors = findLowestDelta(testPatientData, trainPatientData);
    var patient = testPatientData;
    var realAnswer = patient[patient.length - 1];
    var guessedAnswer = votePatients(kNeighbors, trainPatientData);
    postMessage({type: "diagnosis", content: guessedAnswer, id: id, correct: realAnswer, pid: patientID});
  } catch(e) {
    console.log(e.message);
  }
}

// Receive messages..
onmessage = function(event) {

  // Sets the ID as the master sees it.
  if (event.data.type == "id") {
    id = event.data.content;
  }

  // Learns the training data from master.
  if (event.data.type == "train") {
    trainPatientData = event.data.content;
  }

  // Learns the value of k from master.
  if (event.data.type == "k") {
    k = event.data.content;
  }

  // Accepts patient data and begins analysis.
  if (event.data.type == "patient") {
    var patient = event.data.content;
    diagnose(patient, event.data.pid);
  }

  // If conditions are met, post the ready message.
  if (learned == 0 && id != -1 && trainPatientData !== null && k != -1) {
    console.log("Thread " + id + " is ready.");
    postMessage({type: "ready", content: id});
    learned = 1;
  }

};

/**
 * getPatientDistance()
 * Calculates the delta between two patients.
 * Params:
 *   patientA - A patient data array to test distance from.
 *   patientB - A patient data array to test distance to.
 *
 * Returns the total distance between the two patient data arrays.
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
    if(Object.keys(nearestNeighbors).length < k)
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