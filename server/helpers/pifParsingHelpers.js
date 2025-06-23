const fs = require("fs");
const https = require("https");
const path = require("path")
const FormData = require('form-data');
const {logEvent} = require("./logger");


async function parsePIF(filename) {
    const formBody = new FormData();
    formBody.append("peml",
        Buffer.from(
            fs.readFileSync(`./downloads/${filename}`, "utf8")
            , "utf8"
        )
    )
    formBody.append("is_pif", "true")


    const parseCallOptions = {
        method: 'POST',
        host: 'endeavour.cs.vt.edu',
        path: '/peml-live/api/parse',
        headers: formBody.getHeaders()
    }

    return new Promise((resolve, reject) => {
        const req = https.request(parseCallOptions, res => {
            let responseBody = '';

            res.setEncoding('utf-8');

            res.on('data', chunk => {
                responseBody += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(responseBody);
                    resolve({status: res.statusCode, headers: res.headers, body: json});
                } catch (e) {
                    resolve({status: res.statusCode, headers: res.headers, body: responseBody});
                }
            });
        });

        req.on('error', err => {
            reject(err);
        });

        formBody.pipe(req);
    });
}


const downloadsDir = path.join(__dirname, '../../downloads');


async function downloadFile(filename) {
    logEvent("File download started for: " + filename)
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir);
    }

    const dest = path.join(downloadsDir, filename);


    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(dest);

        const url =
            "https://raw.githubusercontent.com/CSSPLICE/peml-feasibility-examples/refs/heads/main/parsons/"
            + filename
        https.get(url, (response) => {

            if (response.statusCode !== 200) {
                console.error(`Failed to get '${url}' (${response.statusCode})`);
                logEvent(`Failed to get '${url}' (${response.statusCode})`)
                response.resume();
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                    logEvent("parse complete")
                    file.close(() => resolve(dest))
                }
            );

            file.on('error', (err) => {
                logEvent("error on parse")
                fs.unlink(dest, () => reject(err));
            });

        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
            console.error(`Error downloading file: ${err.message}`);
        });

    })


}


module.exports = {
    parsePIF,
    downloadFile
}
