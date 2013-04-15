var Worker = require('webworker-threads').Worker;
// var w = new Worker('worker.js'); // Standard API

 // You may also pass in a function:
 var worker = new Worker(function(){
   postMessage("I'm working before postMessage('ali').");
     onmessage = function(event) {
         postMessage('Hi ' + event.data);
             self.close();
         };
});
worker.onmessage = function(event) {
  console.log("Worker said : " + event.data);
};
worker.postMessage('ali');
worker.postMessage('heyooooo');
