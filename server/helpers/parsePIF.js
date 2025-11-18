const fs = require('fs');
const https = require('https');
const path = require('path');
const FormData = require('form-data');
const { logEvent } = require('./logger');

async function parsePIF(source, filename) {
  const formBody = new FormData();

  const filePath = source === 'github'
    ? path.join(__dirname, '../../downloads', filename)
    : path.join(__dirname, '../../uploads', filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File "${filename}" not found in ${source === 'github' ? 'downloads' : 'uploads'} directory`);
  }

  formBody.append(
    'peml',
    Buffer.from(fs.readFileSync(filePath, 'utf8'), 'utf8')
  );
  formBody.append('is_pif', 'true');

  const parseCallOptions = {
    method: 'POST',
    host: 'endeavour.cs.vt.edu',
    path: '/peml-live/api/parse',
    headers: formBody.getHeaders(),
  };

  return new Promise((resolve, reject) => {
    const req = https.request(parseCallOptions, (res) => {
      let responseBody = '';

      res.setEncoding('utf-8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          if (!json.value) {
            logEvent('parse failed');
            reject(new Error(json));
            return;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: responseBody });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    formBody.pipe(req);
  });
}

module.exports = parsePIF;
