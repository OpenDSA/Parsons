import Parsons from "./parsons";
import restructured from "restructured"
import RunestoneBase from "./common/runestonebase";

export function renderAll() {
    $("[data-component=parsons]").each(function (index) {
        new Parsons({orig:$(this),useRunestoneServices:false})
    })
}

export const clearEventLogs = new RunestoneBase().standlone;

export function injectHTML(parsed) {
    //THIS IS CONVENIENT FOR DEBUGGING [COMMENTED INTENTIONALLY]
    //console.log(parsed.children[0].children)

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

    $("#display-area").empty().append($parsonsShell)
}


export function loadFile() {
    $("#submit-btn").click(function(event){
        //todo add a checker to prevernt submitting when a file has not been selected
        var input = document.getElementById("myFile")
        var inputFile = input.files[0]
        const reader = new FileReader()
        reader.onload = function () {
            const rstProblem = reader.result

            const parsed = restructured.parse(rstProblem)

            //THIS SECTION VALIDATES THE INPUT FILE BY CHECKING IF THE DIRECTIVE MATCHES "parsonsproob"
            //THE FILE IS NOT LOADED IF IT DOESNT
            if (parsed.children[0].directive !== "parsonsprob"){
                $("#input-file-error").text('Incorrect RST directive: "parsonsprob" expected')
                setTimeout(function (){
                    $("#input-file-error").text('')
                },3000)
                input.value = null
                return
            }

            //ADDING LOADED TEXT TO TEXTBOX
            $("#playground-editor").empty().val(rstProblem)

            injectHTML(parsed)
            console.log("loaded")
            clearEventLogs(inputFile.name)//whenever a new exercise is loaded the event logs are cleared
            //clearing input field
            input.value = null

        }
        reader.readAsText(inputFile)

        setTimeout(function (){
        renderAll()
            },250)

    })
}