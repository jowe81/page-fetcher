const request = require('request');
const fs = require('fs');
const path = require('path');
const { stdin: input, stdout:output } = require('process');
const readline = require('readline');

const checkPathExists = (pathToCheck, successCallback, errCallback) => {
  const dirname = path.dirname(pathToCheck);
  fs.access(dirname, (err) => {
    if (!err) {
      successCallback();
    } else {
      errCallback(err,`Path "${dirname}" is invalid.`);
    }
  });
};

const checkFileExists = (fileToCheck, callback) => {
  fs.open(fileToCheck, 'r', (err) => {
    callback(!(err && err.code === 'ENOENT'));
  });
};

const getUserAuthorizationToOverwrite = (callback)  => {
  const rl = readline.createInterface({ input, output});
  rl.question("File exists! Overwrite? y/n (n)", (answer) => {
    callback(answer === "y");
    rl.close();
  });
};

const runChecks = (url, fileName, successCallback) => {
  checkPathExists(fileName, () => {
    //Path is okay - go ahead
    checkFileExists(fileName, (exists) => {
      if (exists) {
        getUserAuthorizationToOverwrite((overwriteConfirmed) => {
          if (overwriteConfirmed) {
            successCallback(url, fileName);
          }
        });
      } else {
        //File doesn't exist
        successCallback(url, fileName);
      }
    });
  }, (err, msg) => {
    //Path invalid
    console.log(`An error occurred: ${msg}`);
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

