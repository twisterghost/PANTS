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