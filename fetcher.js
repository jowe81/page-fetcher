const request = require('request');
const fs = require('fs');
const path = require('path');
const { stdin: input, stdout:output } = require('process');
const readline = require('readline');

//Check if path is valid and invoke callback with true or false
const checkPathIsValid = (pathToCheck, callback) => {
  fs.access(path.dirname(pathToCheck), (err) => {
    callback(err === null);
  });
};

//Check if file exists by attempting to open it for reading
//Invoke callback with true or fallse
const checkFileExists = (fileToCheck, callback) => {
  fs.open(fileToCheck, 'r', (err) => {
    callback(!(err && err.code === 'ENOENT'));
  });
};

//Prompt user for whether to overwrite existing file
const getUserConfirmationToOverwrite = (callback)  => {
  const rl = readline.createInterface({ input, output});
  rl.question("File exists! Overwrite? y/n (n)", (answer) => {
    callback(answer === "y");
    rl.close();
  });
};

//Confirm valid path and filename, then run successCallback
const runChecks = (url, fileName, successCallback) => {
  checkPathIsValid(fileName, valid => {
    if (valid) {
      checkFileExists(fileName, exists => {
        if (exists) {
          getUserConfirmationToOverwrite(confirmed => {
            if (confirmed) {
              successCallback(url, fileName);
            }
          });
        } else {
          successCallback(url, fileName);
        }
      });
    }
  });
};

//Assumes valid url, valid path and permission to overwrite if file exists
const retrieveAndSavePage = (url, fileName) => {
  request(url, (err, res, body) => {
    fs.writeFile(fileName, body, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Downloaded and saved ${Buffer.byteLength(body, 'utf8')} bytes to ${args[1]}`);
      }
    });
  });
};

const args = process.argv.slice(2);

if (args.length >= 2) {
  const url = args[0];
  const fileName = args[1];
  runChecks(url, fileName, retrieveAndSavePage);
}

