'use strict';

var request = require('request');
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');

function checkForArgAndAssign(index, errorMessage) {
  if (!process.argv[index]) {
    throw new Error(errorMessage);
  } 
  
  return process.argv[index];
}

var repo = checkForArgAndAssign(2, 'Requires a github repo.');
var repoDir = checkForArgAndAssign(3, 
    'Requires an absolute path to repo on server;'); 
var buildCmd = checkForArgAndAssign(4, 'Requires a cmd to build the project');

var lastSha = null;

function checkIfDirectoryExists() {
  var status = fs.lstat(repoDir);
  try {
    return status.isDirectory();
  } catch(e) {
    throw new Error('Repo path invalid.');
  }
}

function tryGetLastShaAndStart() {

  if (checkIfDirectoryExists()) {
    exec('cd ' + repoDir + ' && git rev-parse HEAD', function(error, stdout, stderr) {
      if (error !== null) {
        console.log('stderr: ' + stderr);
        throw new Error('Something weird happened: selected dir is probably' +
          ' not a git repo');
      }

      lastSha = stdout.trim();
      
      startLoop();
    });  
  }
  
  throw new Error('Path does not lead to a directory');
}

function startLoop() {
  setInterval(function() {
    request('https://github.com/' + repo, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        // TODO: add logging and consecutive fail tolerance
        throw new Error('Connection to github failure');
      }
      
      var extraShaDataAttributeRegex = /data-clipboard-text=\"\w+/g;
    
      var dataShaAttribute = extraShaDataAttributeRegex.exec(body)[0];
    
      if (!dataShaAttribute) {
        throw new Error('Github page layout changed!');
      }

      // parse data attribute to get sha
      var sha = dataShaAttribute.split('"')[1];
      
      if (sha !== lastSha) {
        // go to project directory, pull, and build
        exec('cd ' + repoDir + ' && git pull origin master && ' + buildCmd, 
          function (error, stdout, stderr) {
            if (error !== null) {
              console.log('stderr: ' + stderr);
              throw new Error('unknown operational error');
            }
          }
        );
      }
    });
  }, 2000);
}

tryGetLastShaAndStart();

