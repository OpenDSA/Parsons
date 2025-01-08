import Parsons from "./parsons";
import restructured from "restructured"

export function renderAll() {
    $("[data-component=parsons]").each(function (index) {
        new Parsons({orig:$(this),useRunestoneServices:false})
    })
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

            //todo Implement this check
            const isParsonsDirective = parsed.children[0].directive === "parsonsprob"

            const parsonsShellId = parsed.children[0].children[0].value

            console.log(parsed.children[0].children)

            let $parsonsShell = $("<div>", {
                "data-component": "parsons",
                "id": parsonsShellId || "parsonsShell",
                "class": "parsons"
            });

            const $questionDiv = $("<div>", {
                "class": "parsons_question parsons-text"
            });

            const $questionText = $("<p>").text("Exercise from "+input.files[0].name + " loaded successfully");

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
                        problemBlocks = problemBlocks === " "
                            ? problemBlocks.concat(line.value)
                            : problemBlocks.concat("\n",line.value)
                    }
                }

            }

            console.log(problemBlocks)
            console.log(problemInstructions)
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
            // $problemDiv.append(document.createTextNode(problemBlocks))

            $parsonsShell.append($questionDiv)
            // $parsonsShell.append($viewSource)
            $parsonsShell.append($problemDiv)


            $("#display-area").append($parsonsShell)

            //clearing input field
            input.value = null

        }
        reader.readAsText(inputFile)



    })
}