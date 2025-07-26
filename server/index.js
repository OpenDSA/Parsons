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
            const ext = path.extname(file.originalname).toLowerCase();
            if ( ext === '.peml') {
                cb(null, true);
            } else {
                cb(new Error('Only .peml files are allowed'));
            }
        }
    });


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

//Upload exercise directly to server
app.post('/parsons/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        logEvent(`File ${req.file.originalname} uploaded successfully`);
        // Redirect back to homepage after successful upload
        res.redirect('/parsons/');
    } else {
        res.status(400).send('No file uploaded.');
    }
});

//Delete uploaded file
app.delete('/parsons/delete/:filename', (req, res) => {
    const filename = req.params.filename;
    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, filename);
    
    // Security check: ensure the file is in the uploads directory
    if (!filePath.startsWith(uploadsDir)) {
        return res.status(400).send('Invalid file path');
    }
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }
    
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).send('Error deleting file');
        }
        
        console.log(`File ${filename} deleted successfully`);
        res.status(200).send('File deleted successfully');
    });
});

app.get('/parsons/bundle.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'bundle.js'));
})

// Get all available files
app.get('/parsons/api/files', async (req, res) => {
    try {
        const {getAllAvailableFiles} = require('./helpers/pifParsingHelpers');
        const files = await getAllAvailableFiles();
        res.json(files);
    } catch (error) {
        console.error('Error getting file list:', error);
        res.status(500).json({error: 'Failed to get file list'});
    }
});

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

//Parse PIF file and inject into the page to render the exercise
app.get('/parsons/pif/:source/:filename', async (req, res) => {
    const filename = req.params.filename;
    const source = req.params.source;
    const showNoPrompt = req.query.prompt === "false";
    let parsedJson = null


    await (async () => {
        try {
            if (source === 'github')
                await downloadFile(filename);

            const result = await parsePIF(source,filename)
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

//Catch all unknown routes and render the home page
app.get('/parsons/{*any}', async (req, res) => {
    try {
        const html = await renderPage(req);
        res.send(html);
    } catch (err) {
        console.error('Renderer error:', err);
        res.status(500).send('Internal server error.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/parsons/`);
});