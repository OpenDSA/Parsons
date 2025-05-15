const express = require('express');
const fs = require('fs')
const path = require('path');
const {exec} = require("child_process")
const multer = require('multer');
const {renderPage, parsonsPageTemplate} = require('./renderer');
const {injectHTML,injectFromPIF} = require('./helpers/parsonsBuild')

//RST Parse
const _Parser = require('./lib/rst/Parser');
const map = require('unist-util-map');
const _ = require('lodash');

//Virtual Dom
const { JSDOM } = require('jsdom');
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
    res.sendFile(path.join(__dirname,'../public', 'bundle.js'));
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
          <a href="/parsons/exercise/${encodeURIComponent(file)}/download">[Download ↓]</a>
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

  app.get('/parsons/exercise/:filename/download', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).send('Could not download the file.');
        }
      });

  });


  app.get('/parsons/exercise/:filename', (req, res) => {
    const filename = req.params.filename;
    const showPrompt = req.query.prompt === "true" ? true : false;

    const filePath = path.join(__dirname, '../uploads', filename);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
  
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    //RST is parsed here
    const tree = _Parser.parse(fileContent)
    const rstJson = cleanTree(tree)
  
    const dom = new JSDOM(parsonsPageTemplate);
    const window = dom.window;
    const $ = jqueryFactory(window);

    $('body').append(injectHTML(rstJson,$));

    if(!showPrompt){
        $('.parsons-text').hide()
    }
  
    res.send(dom.serialize());
  });


  app.get('/parsons/exercise/pif/:filename', async(req, res) => {
    const filename = req.params.filename;
    const showPrompt = req.query.prompt === "true" ? true : false;

    //PIF Parsed here with gem
    await exec(`pif ./uploads/feasibility-examples/${filename}.peml ./uploads/parsed/`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Exec err: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
        }
      }
    )

    const parsedJsonPath = path.join
      (__dirname, '../uploads/parsed', filename+".json");

    const parsedJsonContent = fs.readFileSync(parsedJsonPath, 'utf-8');

    const parsedJson = JSON.parse(parsedJsonContent)
  
    const dom = new JSDOM(parsonsPageTemplate);
    const window = dom.window;
    const $ = jqueryFactory(window);

    $('body').append(injectFromPIF(parsedJson,$))

    if(!showPrompt){
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