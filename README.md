PANTS
================

Parallel Anomaly geNetic Tracking System

## What does this do?

PANTS is a machine learning system that can help to detect genetic anomolies.
After being trained with healthy genetic information, it can read test data
and help to predict when a patient's information is significantly different
from a healthy patient.

## Requirements
PANTS requires an installation of Node.js on the host machine of version 0.8.0 
or above. NPM (installs with Node.js) must be installed as well.

## Usage
`node pants [options]`

Options:

`--train` The location of the training data.

`--test` The location of the testing data.

`-k` The number of neighbors to consider.

`-l` Run linearly.

`--threads` The number of threads to use.
