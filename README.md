# Parsons
Support for Parsons Problems

## Introduction

This repository holds and an adaptation of Runestone's Parsons Problem implementation to support the SPLICE Parsons Problem Input Format (PIF)

To run the project, clone the repo

```bash
  git clone https://github.com/OpenDSA/Parsons.git
```

Run `npm install` from the root folder to install all dependencies 

Finally run 
```bash
  npx webpack --config webpack.config.js
```

For the event logging to write to event_logs.txt, make sure to run before moving blocks:

```bash
  node server.js
```

Note: It is helpful to re-run the last 2 commands (i.e. `npm install` and `npx webpack --config webpack.config.js`) whenever the code changes.
Just the `npx` command will suffice for regular changes. `npm install` is necessary if the `package.json` file changes.

A good rule of thumb is to run both commands when ever you pull from github.

You can now open the src/index.html file in your browser of choice

This page presents a Parsons Playground for constructing problems quickly