'use strict';

var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');

function checkForArgAndAssign(index, errorMessage) {
  if (!process.argv[index]) {
    throw new Error(errorMessage);
  } 
  return process.argv[index];
}

var repoDir = checkForArgAndAssign(2,
    'Requires an absolute path to repo on server;'); 
var buildCmd = checkForArgAndAssign(3, 'Requires a cmd to build the project');

function checkIfDirectoryExists() {
  var status = fs.lstatSync(repoDir);

  try {
    return status.isDirectory();
  } catch(e) {
    throw new Error('Repo path invalid.');
  }
}

function startLoop() {

  setInterval(function() {
    
    exec('cd ' + repoDir + ' && git remote show origin', 
      function(error, stdout, stderr) {
        
        if (stdout.indexOf('out of data' !== -1)) {
          //tgo to project directory, pull, and build
          exec('cd ' + repoDir + ' && git pull origin master && ' + buildCmd, 
            function (error, stdout, stderr) {
              if (error !== null) {
                throw new Error('unknown operational error');
              }
            }
          );
        }
      }
    );
  }, 30000);
}

if (checkIfDirectoryExists()) {
  startLoop();
}

