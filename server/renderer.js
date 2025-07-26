const fs = require('fs');
const path = require('path');
const {getAllAvailableFiles} = require('./helpers/pifParsingHelpers');

async function renderPage(req) {
    const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');

    let pageContent = '';

    const protocol = req.protocol
    const host = req.get("host")


    // Simple routing logic
    switch (req.path) {
        // case '/parsons/upload':
        //     pageContent = `
        //   <h1>Upload a File</h1>
        //   <form action="/parsons/upload" method="post" enctype="multipart/form-data">
        //     <input type="file" name="file" required />
        //     <button type="submit">Upload</button>
        //   </form>
        // `;
        //     break;
        case '/':
        default:
            // Get available files
            let availableFiles = {github: [], uploaded: []};
            try {
                availableFiles = await getAllAvailableFiles();
            } catch (error) {
                console.error('Error getting available files:', error);
            }

            // Generate file lists
            const githubFileList = availableFiles.github.length > 0 
                ? availableFiles.github.map(file => 
                    `<li><a href="${protocol}://${host}/parsons/pif/github/${file}">${file}</a></li>`
                ).join('')
                : '<li><em>No GitHub files available</em></li>';

            const uploadedFileList = availableFiles.uploaded.length > 0 
                ? availableFiles.uploaded.map(file => 
                    `<li style="display: flex; align-items: center; margin-bottom: 5px; gap: 8px;">
                        <a href="${protocol}://${host}/parsons/pif/upload/${file}">${file}</a>
                        <button onclick="deleteFile('${file}')" style="background-color: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 0.8em;">Delete</button>
                    </li>`
                ).join('')
                : '<li><em>No uploaded files available</em></li>';

            pageContent = `<h1>Welcome to OpenDSA-Parsons</h1>
        <p>Input files are sourced from the 
        <a href="https://github.com/CSSPLICE/peml-feasibility-examples/tree/main/parsons">
        PEML feasibility repository</a> or uploaded to the server directly.
        </p>
        <br>

        <p>All exercises can be found with the at the URL formatbelow</p>
        <p><strong>URL Format:</strong> ${protocol}://${host}/parsons/pif/&ltsource&gt/&ltfilename&gt.peml</p>
        <p><strong>Source options:</strong> <code>"github"</code> for exercises in the githubrepository or <code>"upload"</code> for exercises uploaded to the server</p>
        
        
        <p>For example, the fixed-demo exercise will be found at 
        <a href="${protocol}://${host}/parsons/pif/github/fixed-demo.peml">
        ${protocol}://${host}/parsons/pif/github/fixed-demo.peml</a></p>
        <br>
        
        <p>You may append ?prompt=false to hide the instructions for the problem.</p>
        <p>For example, 
        <a href="${protocol}://${host}/parsons/pif/github/fixed-demo.peml?prompt=false">
        ${protocol}://${host}/parsons/pif/github/fixed-demo.peml?prompt=false</a></p>
        
        
        <h2>Available Exercises</h2>
        
        <details>
            <summary style="font-size: 1.1em; font-weight: bold; cursor: pointer;">
                GitHub Repository Files (${availableFiles.github.length} files)
            </summary>
            <ul style="list-style-type: none; padding-left: 0; margin-top: 10px;">
                ${githubFileList}
            </ul>
        </details>
        
        <details>
            <summary style="font-size: 1.1em; font-weight: bold; cursor: pointer;">
                Uploaded Files (${availableFiles.uploaded.length} files)
            </summary>
            <ul style="list-style-type: none; padding-left: 0; margin-top: 10px;">
                ${uploadedFileList}
            </ul>
        </details>
   
        <h2>Upload Your Own .peml Files</h2>
        <p>You can also upload your own .peml files to the server:</p>
        <form action="/parsons/upload" method="post" enctype="multipart/form-data" style="margin: 20px 0; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
            <div style="margin-bottom: 15px;">
                <label for="peml-file" style="display: block; margin-bottom: 5px; font-weight: bold;">Select .peml file:</label>
                <input type="file" id="peml-file" name="file" accept=".peml" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;" />
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer;">Upload .peml File</button>
        </form>
        <p><small>Note: Only .peml files are supported for upload.</small></p>
        <br>
        
        <script>
        function deleteFile(filename) {
            if (confirm('Are you sure you want to delete "' + filename + '"?')) {
                fetch('/parsons/delete/' + encodeURIComponent(filename), {
                    method: 'DELETE',
                })
                .then(response => {
                    if (response.ok) {
                        // Reload the page to show updated file list
                        window.location.reload();
                    } else {
                        alert('Error deleting file. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error deleting file. Please try again.');
                });
            }
        }
        </script>
        `;
    }

    return template.replace('<!--APP-->', `<div id="app">${pageContent}</div>`);
}

const parsonsPageTemplate = `
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" type="type/css" href="./css/parsons.css"/>
  <link rel="stylesheet" type="type/css" href="./css/index.css"/>
   <script type="text/javascript">
    if (typeof eBookConfig === "undefined") {
        eBookConfig = {};
    }
    eBookConfig.host = '';
    eBookConfig.app = eBookConfig.host + '/runestone';
    eBookConfig.ajaxURL = eBookConfig.app + '/ajax/';
    eBookConfig.course = "";
    eBookConfig.logLevel = 10;
    eBookConfig.username = ""
    eBookConfig.email = ""
    eBookConfig.isPlaygroundEnv = true;
    eBookConfig.isInstructor = true;
    eBookConfig.isLoggedIn = false;
    eBookConfig.useRunestoneServices = false;
    eBookConfig.gradeRecordingUrl = "";
    eBookConfig.new_server_prefix = "/ns";
    eBookConfig.websocketUrl = "{{settings.websocket_url}}"
    eBookConfig.enableDebug = true ? "{{settings.debug}}" == "True" : false;
    eBookConfig.served_by = "TBD"
</script>

<script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.9/jquery.i18n.min.js" integrity="sha512-EkS8Kq86l7dHt/dOBniHgtYvAScDqFw/lIPX5VCwaVKsufs0pY44I2cguqZ45QaFOGGwVd3T1nXvVJYIEjRsjA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.9/jquery.i18n.emitter.bidi.min.js" integrity="sha512-EP79zV22G1pPO28sRgwfVyEPEhu1RXA2ovHJNqlev1pIGEAs0CBzi6F6UMkPBaPS78O3KeEVqpicEYah+zbXhg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.9/jquery.i18n.emitter.min.js" integrity="sha512-FXATL79ewicv4U54AgQVVHBBsinKwHuIZJZFUIJqhqpA6UV0XuAFAhTjGuA9JX0HmzwKW+frVH2MuHCzpDgSMQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.9/jquery.i18n.fallbacks.min.js" integrity="sha512-FvKl0c+LXuYS0OlbGXHLIt/VUxLHgVG2wMHB8BwMDzEwwNACtxhutxl4jxlnuNfEuzKPLarLsf17UP7UgPMs6w==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.9/jquery.i18n.language.min.js" integrity="sha512-XaRK7YZ6nqPsjMAMUysMC0J7zqEOp3K74pUzIADUd3Ql8qpFpuwpR5jm+TVyzJc8C5fvVkjC3yOjF0gWmmCtDA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.9/jquery.i18n.messagestore.min.js" integrity="sha512-Ejnbo8F6SIU18Tj9hZyJzVbhWtbC40Fyvuyfs6InZloy043xEvICul37BxuUGZG1ia8RQky7uBOwBdLsGKDu1w==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.9/jquery.i18n.parser.min.js" integrity="sha512-v3mCT0T3rETWJU4RZKWHobzvOdJUcaojtxFBYVY371L/3aaWj9Dg2MNl6Q46wr19u4YHHnyzAR99wWAr9mB3ZA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<script>
    var runestoneMathReady = new Promise((resolve) => window.rsMathReady = resolve);
    window.MathJax = {
        "tex": {
            "inlineMath": [
                [ "$", "$" ],
                [ "\\(", "\\)"]
            ],
            "tags": "none",
            "tagSide": "right",
            "tagIndent": ".8em",
            "packages": {
                "[+]": [
                    "base",
                    "extpfeil",
                    "ams",
                    "amscd",
                    "color",
                    "newcommand",
                    "knowl"
                ]
            }
        },
        "options": {
            "ignoreHtmlClass": "tex2jax_ignore|ignore-math",
            "processHtmlClass": "process-math",
            "renderActions": {
                "findScript": [
                    10,
                    function (doc) {
                        document.querySelectorAll('script[type^="math/tex"]').forEach(function (node) {
                            var display = !!node.type.match(/; *mode=display/);
                            var math = new doc.options.MathItem(node.textContent, doc.inputJax[0], display);
                            var text = document.createTextNode('');
                            node.parentNode.replaceChild(text, node);
                            math.start = { node: text, delim: '', n: 0 };
                            math.end = { node: text, delim: '', n: 0 };
                            doc.math.push(math);
                        });
                    },
                    ""
                ]
            }
        },
        "chtml": {
            "scale": 0.98,
            "mtextInheritFont": true
        },
        "loader": {
            "load": [
                "input/asciimath",
                "[tex]/extpfeil",
                "[tex]/amscd",
                "[tex]/color",
                "[tex]/newcommand",
            ],
            "paths": {
                "pretext": "_static/pretext/js/lib"
            }
        },
        "startup": {
            pageReady() {
                return MathJax.startup.defaultPageReady().then(function () {
                    rsMathReady();
                }
                )
            }
        }
    };
</script>
  <script src="/parsons/bundle.js"></script>
</head>
<body></body></html>
`
module.exports = {
    renderPage,
    parsonsPageTemplate
}