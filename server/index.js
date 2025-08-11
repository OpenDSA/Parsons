require('dotenv').config();
const express = require('express');
const fs = require('fs')
const path = require('path');
const multer = require('multer');
const {renderPage, parsonsPageTemplate} = require('./renderer');
const {injectFromPIF} = require('./helpers/parsonsBuild')
const {parsePIF, downloadFile} = require('./helpers/pifParsingHelpers')
const {logEvent} = require('./helpers/logger');


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

const STATE = {}

app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

//Upload exercise directly to server
app.post('/parsons/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        logEvent(`File ${req.file.originalname} uploaded successfully`);
        // Redirect back to homepage after successful upload
        STATE.NEW_UPLOAD = true;
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
    
    logEvent(`Deleting file ${filename}`);
    
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


//Parse PIF file and inject into the page to render the exercise
app.get('/parsons/pif/:source/:filename', async (req, res) => {
    const filename = req.params.filename;
    const source = req.params.source;
    //When set to false, the page will not show the instructions for the problem.
    const showNoPrompt = req.query.prompt === "false";
    //When set to true, the page is has no back to home button. Ideal for embedding in other pages
    const isolatedExercise = req.query.isolated === "true";
    let parsedJson = null;
    let error = null;

    try {
        if (source === 'github'){
            await downloadFile(filename);
        }

        const result = await parsePIF(source, filename);
        parsedJson = result.body;
        // logEvent(`Parsed PIF file ${filename} successfully`);
        // console.log(JSON.stringify(parsedJson))
    } catch (e) {
        console.error("Failed to parse PIF file:", e);
        error = e;
    }

    const dom = new JSDOM(parsonsPageTemplate);
    const window = dom.window;
    const $ = jqueryFactory(window);

    if (error) {
        // Handle file not found or parsing errors gracefully
        const errorMessage = error.message.includes('ENOENT') || error.message.includes('not found') 
            ? `File "${filename}" not found in ${source === 'github' ? 'GitHub repository' : 'uploads'}.`
            : `Error parsing file "${filename}": ${error.message}`;
        
        const backToHomeButton = isolatedExercise ? '' : `<p><a href="/parsons/" style="color: #721c24; text-decoration: underline;">← Back to Home</a></p>`;
        
        $('body').append(`
            <div style="padding: 20px; margin: 20px; border: 1px solid #dc3545; border-radius: 5px; background-color: #f8d7da; color: #721c24;">
                <h2 style="color: #721c24; margin-top: 0;">File Not Found</h2>
                <p>${errorMessage}</p>
                ${backToHomeButton}
            </div>
        `);
    } else {
        $('body').append(injectFromPIF(parsedJson, $));

        // Add back to home button for successful exercises (unless isolated)
        if (!isolatedExercise) {
            $('body').append(`
                <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
                    <a href="/parsons/" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">← Back to Home</a>
                </div>
            `);
        } 
        
        if (showNoPrompt) {
            $('.parsons-text').hide();
        }
    }

    res.send(dom.serialize());
});

//Catch all unknown routes and render the home page
app.get('/parsons/{*any}', async (req, res) => {
    try {
        const html = await renderPage(req, STATE);
        res.send(html);
    } catch (err) {
        console.error('Renderer error:', err);
        res.status(500).send('Internal server error.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/parsons/`);
});