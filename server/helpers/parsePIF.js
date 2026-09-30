const fs = require('fs');
const https = require('https');
const http = require('http');
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

  const isDevEnv = process.env.NODE_ENV === 'development';
  const parseCallOptions = {
    method: 'POST',
    host: isDevEnv ? process.env.PARSE_HOST : 'endeavour.cs.vt.edu',
    port: isDevEnv ? process.env.PARSE_PORT : undefined,
    path: isDevEnv? process.env.PARSE_PATH : '/peml-live/api/parse',
    headers: formBody.getHeaders(),
  };

  return new Promise((resolve, reject) => {
    const httpx = isDevEnv ? http : https;
    const req = httpx.request(parseCallOptions, (res) => {
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
