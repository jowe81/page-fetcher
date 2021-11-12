# Page Fetcher

## Features:
* Downloads and saves a website to a file.
* Prompts for permission to overwrite an existing destination file
* Provides information about errors in case of failure
* Displays the bytesize of the response body


## Usage:
```bash
node fetcher url fileName
```
* ```url```: the location of the resource to request
* ```fileName```: local path to store the response body at

## Example:
```bash
node fetcher http://www.example.com ./index.html
```
---
_This was a [Lighthouse Labs Flex](https://www.lighthouselabs.ca/en/web-development-flex-program) exercise._