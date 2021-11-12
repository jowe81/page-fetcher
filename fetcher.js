const request = require('request');
const fs = require('fs');
const path = require('path');
const { stdin: input, stdout:output } = require('process');
const readline = require('readline');

//Return first two cmdline args as object with keys url, fileName
const getArgs = () => {
  const args = process.argv.slice(2);
  return { url: args[0], fileName: args[1] };
};

const haveRequiredCmdlineArguments = (url, fileName) => {
  return (url !== undefined && fileName !== undefined);
};

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
  if (haveRequiredCmdlineArguments(url, fileName)) {
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
      } else {
        console.log("Error: invalid destination path.");
      }
    });
  } else {
    console.log(`Error: argument missing. \nCall syntax is: \n  node fetcher url fileName`);
  }
};

//Log some information about the error to the console
const explainRequestError = (err, res) => {
  console.log("Error: couldn't retrieve page.");
  if (res) {
    console.log(` -> http request itself succeeded`);
    console.log(` -> http response code was: ${res.statusCode}`);
  }
  if (err) {
    console.log(` -> ${err}`);
    if (err.code === 'ENOTFOUND') {
      console.log(` -> Could not resolve hostname`);
    }
  }
};

//Retrieve and save page from url to fileName
//Assumes valid destination path and permission to overwrite if file exists
const retrieveAndSavePage = (url, fileName) => {
  request(url, (err, res, body) => {
    if (err || res.statusCode !== 200) {
      explainRequestError(err, res);
    } else {
      fs.writeFile(fileName, body, (err) => {
        if (err) {
          console.log(`Error while trying to write to ${fileName}: ${err}`);
        } else {
          console.log(`Downloaded and saved ${Buffer.byteLength(body, 'utf8')} bytes to ${fileName}`);
        }
      });
    }
  });
};

const { url, fileName } = getArgs();
runChecks(url, fileName, retrieveAndSavePage);