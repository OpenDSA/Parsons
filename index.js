const path = require('path');

const distPath = path.join(__dirname, 'dist', 'parsons.js');
const parsonsBundle = require(distPath);
const Parsons = parsonsBundle.default || parsonsBundle;

const { parsePIF } = require('./server/helpers/pifParsingHelpers');

module.exports = {
  Parsons,
  parsePIF,
};
