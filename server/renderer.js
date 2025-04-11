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
      case '/upload':
        pageContent = `
          <h1>Upload a File</h1>
          <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="file" required />
            <button type="submit">Upload</button>
          </form>
        `;
        break;
      case '/':
      default:
        pageContent = `<h1>Home Page</h1><p>Welcome to the homepage!</p>
        <ul><a href="/parsons/exercise">View available exercises</a></ul>
        <ul><a href="/parsons/upload">Upload new exercise</a></ul>
        `;
    }
  
    return template.replace('<!--APP-->', `<div id="app">${pageContent}</div>`);
};

function injectHTML(parsed,$) {
    //THIS IS CONVENIENT FOR DEBUGGING [COMMENTED INTENTIONALLY]
    // console.log(parsed.children[0].children)

    let $parsonsShell = $("<div>", {
        "data-component": "parsons",
        "id": parsed.children[0].children[0].value || "parsonsShell",
        "class": "parsons"
    });

    const $questionDiv = $("<div>", {
        "class": "parsons_question parsons-text"
    });

    const $questionText = $("<p>").text("Exercise from loaded successfully");

    $questionDiv.append($questionText)

    let $problemDiv = $("<pre>",{
        "data-question_label":"",
        "class":"parsonsblocks",
        "style": "visibility: hidden;"
    })

    let index = 0
    let inProblemBlockDefinition = false
    let inProblemInstruction = false

    let problemBlocks = " "
    let problemInstructions = ""

    let isRawHTML = false

    for (const line of parsed.children[0].children){
        //to skip the first line which has the directive's name
        if (index === 0){
            index = index + 1
            continue
        }
        index = index + 1

        //for handling the ".. parsonsprob" directive's options
        if (line.value[0] === ":" ){
            if (line.value.includes(":question_label:")){
                $problemDiv.attr("data-question_label",
                    line.value.replace(":question_label: "))
            }else{
                $problemDiv.attr("data-question_label",
                    Math.floor(Math.random() * 1000) + 1)
            }

            if (line.value.includes(":language:")) {
                $problemDiv.attr("data-language",
                    line.value.replace(":language: ", ""))
            }

            if (line.value.includes(":noindent:")) {
                $problemDiv.attr("data-noindent", "true")
            }

            if (line.value.includes(":adaptive:")) {
                $problemDiv.attr("data-adaptive", "true")
            }

            if (line.value.includes(":numbered:")) {
                if (line.value.includes("right")) {
                    $problemDiv.attr("data-numbered", "right")
                } else {
                    $problemDiv.attr("data-numbered", "left")
                }
            }

            if (line.value.includes(":grader:")){
                $problemDiv.attr("data-grader",
                    line.value.replace(":grader: ",""))
            }

            if (line.value.includes(":maxdist:")){
                $problemDiv.attr("data-maxdist",
                    line.value.replace(":maxdist: ",""))
            }
        }else{
            if (!inProblemInstruction && ! inProblemBlockDefinition){
                inProblemInstruction = true
            }
            if (inProblemInstruction){
                if (line.value === "-----"){
                    inProblemInstruction = false
                    inProblemBlockDefinition = true
                    continue
                }
                if (line.value === ".. raw:: html"){
                    isRawHTML = true
                    continue
                }

                problemInstructions = problemInstructions.concat(line.value, " ")
            }
            if (inProblemBlockDefinition){
                if (line.value === "====="){
                    problemBlocks = problemBlocks.concat("---")
                    continue
                }
                problemBlocks = problemBlocks === " "
                    ? problemBlocks.concat(line.value)
                    : problemBlocks.concat("\n",line.value)
            }
        }

    }

    if (isRawHTML) {
        $questionDiv.empty().append($($.parseHTML(problemInstructions)))
    }
    else {
        problemInstructions = problemInstructions.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        problemInstructions = problemInstructions.replace(/\*(.*?)\*/g, '<em>$1</em>');
        problemInstructions = problemInstructions.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
        problemInstructions = problemInstructions.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');
        $questionDiv.empty().append($("<p>").append($.parseHTML(problemInstructions)))
    }

    //the problem definition read from the rst file is injected here
    $problemDiv.text(problemBlocks)

    $parsonsShell.append($questionDiv)
    $parsonsShell.append($problemDiv)

    return $parsonsShell;
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
  <script src="/bundle.js"></script>
</head>
<body></body></html>
`
module.exports = {
    renderPage,
    injectHTML,
    parsonsPageTemplate
}