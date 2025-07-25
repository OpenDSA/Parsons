require('dotenv').config();
const express = require('express');
const fs = require('fs')
const path = require('path');
const multer = require('multer');
const {renderPage, parsonsPageTemplate} = require('./renderer');
const {injectFromPIF} = require('./helpers/parsonsBuild')
const {parsePIF, downloadFile} = require('./helpers/pifParsingHelpers')


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


const app = express();
const PORT = process.env.PORT || 3000;

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


app.get('/parsons/pif/:filename', async (req, res) => {
    const filename = req.params.filename;
    const showNoPrompt = req.query.prompt === "false";
    let parsedJson = null


    await (async () => {
        try {
            await downloadFile(filename);
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

    if (showNoPrompt) {
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