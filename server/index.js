const express = require('express');
const fs = require('fs')
const path = require('path');
const https = require('https');
const FormData = require('form-data');
const multer = require('multer');
const {renderPage, parsonsPageTemplate} = require('./renderer');
const {injectHTML, injectFromPIF} = require('./helpers/parsonsBuild')

//RST Parse

const _Parser = require('./lib/rst/Parser');
const map = require('unist-util-map');
const _ = require('lodash');

//Virtual Dom
const {JSDOM} = require('jsdom');
const jqueryFactory = require('jquery');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer(
    {
        storage,
        fileFilter: (req, file, cb) => {
            if (path.extname(file.originalname).toLowerCase() === '.rst') {
                cb(null, true);
            } else {
                cb(new Error('Only .rst files are allowed'));
            }
        }
    });

function cleanTree(tree, options = {}) {
    return map(tree, function (node) {
        const omits = [];
        if (!options.position) omits.push('position');
        if (!options.blanklines) omits.push('blanklines');
        if (!options.indent) omits.push('indent');
        return _.omit(node, omits);
    });
}


const app = express();
const PORT = 3000;

app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

//Upload exercise
app.post('/parsons/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send(`File uploaded! <a href="/parsons/exercise">View exercises</a>`);
    } else {
        res.status(400).send('No file uploaded.');
    }
});

app.get('/parsons/bundle.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'bundle.js'));
})

app.get('/parsons/exercise', (req, res) => {
    const uploadsDir = path.join(__dirname, '../uploads');

    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading uploads.');
        }

        const listHtml = files.map(file => {
            return `<li display="inline">
          <a href="/parsons/exercise/${encodeURIComponent(file)}?prompt=true">${file}</a>
        </li>`;
        }).join('');

        const html = `
        <html>
          <head><title>Exercises</title></head>
          <body>
            <h1>Uploaded Files</h1>
            <ul>${listHtml}</ul>
          </body>
        </html>
      `;

        res.send(html);
    });
});

async function parsePIF(filename) {
    const formBody = new FormData();
    formBody.append("peml",
        Buffer.from(
            fs.readFileSync(`./uploads/feasibility-examples/${filename}`, "utf8")
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


app.get('/parsons/exercise/pif/:filename', async (req, res) => {
    const filename = req.params.filename;
    const showPrompt = req.query.prompt === "true";
    let parsedJson = null

    await (async () => {
        try {
            const result = await parsePIF(filename)
            parsedJson = result.body
        } catch (e) {
            console.error("failed", e)
        }
    })();


    const dom = new JSDOM(parsonsPageTemplate);
    const window = dom.window;
    const $ = jqueryFactory(window);

    $('body').append(injectFromPIF(parsedJson, $))

    if (!showPrompt) {
        $('.parsons-text').hide()
    }

    res.send(dom.serialize());
});

app.get('/parsons/{*any}', (req, res) => {
    try {
        const html = renderPage(req);
        res.send(html);
    } catch (err) {
        console.error('Renderer error:', err);
        res.status(500).send('Internal server error.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});