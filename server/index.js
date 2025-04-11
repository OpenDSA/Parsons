const express = require('express');
const fs = require('fs')
const path = require('path');
const multer = require('multer');
const {renderPage,injectHTML, parsonsPageTemplate} = require('./renderer');

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
        return `<li>
          <a href="/parsons/exercise/${encodeURIComponent(file)}">${file}</a>
        </li>`;
      }).join('');
  
      const html = `
        <html>
          <head><title>Uploaded Files</title></head>
          <body>
            <h1>Uploaded Files</h1>
            <ul>${listHtml}</ul>
          </body>
        </html>
      `;
  
      res.send(html);
    });
  });

  app.get('/parsons/exercise/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
  
    // const ext = path.extname(filename).toLowerCase();
  
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log("hi")

    //RST is parsed here
    const tree = _Parser.parse(fileContent)
    const rstJson = cleanTree(tree)

    // console.log(JSON.stringify(rstJson))
  
    const dom = new JSDOM(parsonsPageTemplate);
    const window = dom.window;
    const $ = jqueryFactory(window);

    $('body').append(injectHTML(rstJson,$));
  
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