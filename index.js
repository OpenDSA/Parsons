const path = require('path');

const { parsePIF } = require('./server/helpers/pifParsingHelpers');

let cachedParsons;

function loadParsonsBundle() {
  if (cachedParsons) {
    return cachedParsons;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(
      'Parsons UI bundle requires a browser environment. ' +
      'Provide window/document (e.g., via JSDOM) before accessing Parsons.'
    );
  }

  const distPath = path.join(__dirname, 'dist', 'parsons.js');
  const bundle = require(distPath);
  cachedParsons = bundle.default || bundle;
  return cachedParsons;
}

module.exports = {
  get Parsons() {
    return loadParsonsBundle();
  },
  parsePIF,
  loadParsonsBundle,
};
