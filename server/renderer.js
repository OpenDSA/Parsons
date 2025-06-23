const fs = require('fs');
const path = require('path');

function renderPage(req) {
    const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');

    let pageContent = '';

    // Simple routing logic
    switch (req.path) {
        //   case '/about':
        //     pageContent = '<h1>About Page</h1><p>This is the about page.</p>';
        //     break;
        case '/parsons/upload':
            pageContent = `
          <h1>Upload a File</h1>
          <form action="/parsons/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="file" required />
            <button type="submit">Upload</button>
          </form>
        `;
            break;
        case '/':
        default:
            pageContent = `<h1>Welcome to OpenDSA-Parsons</h1>
        <p>Input files are sourced from the 
        <a href="https://github.com/CSSPLICE/peml-feasibility-examples/tree/main/parsons">
        PEML feasibility repository</a> 
        </p>
        <br>
        <p>All exercises in the parsons directory can be found the URL below</p>
        <p>https://acos.cs.vt.edu/parsons/exercise/pif/&ltfilename&gt.peml</p>
        
        
        <p>For example, the fixed-demo exercise will be found at 
        <a href="https://acos.cs.vt.edu/parsons/exercise/pif/fixed-demo.peml">
        https://acos.cs.vt.edu/parsons/exercise/pif/fixed-demo.peml</a></p>
        <br>
        
        <p>You may append ?prompt=false to hide the instructions for the problem.</p>
        <p>For example, 
        <a href="https://acos.cs.vt.edu/parsons/exercise/pif/fixed-demo.peml?prompt=false">
        https://acos.cs.vt.edu/parsons/exercise/pif/fixed-demo.peml?prompt=false</a>
   
        `;
    }

    return template.replace('<!--APP-->', `<div id="app">${pageContent}</div>`);
};

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
                [
                    "\\(",
                    "\\)"
                ]
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