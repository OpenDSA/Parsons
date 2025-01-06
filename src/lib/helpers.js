import Parsons from "./parsons";
import restructured from "restructured"

export function renderAll() {
    $("[data-component=parsons]").each(function (index) {
        new Parsons({orig:$(this),useRunestoneServices:false})
    })
}

// function getAttributeValue(line,key){
//     line.value.sp
// }

export function loadFile() {
    $("#submit-btn").click(function(event){
        //todo add a checker to prevernt submitting when a file has not been selected
        var input = document.getElementById("myFile")
        var inputFile = input.files[0]
        const reader = new FileReader()
        reader.onload = function () {
            const rstProblem = reader.result

            const parsed = restructured.parse(rstProblem)

            const isParsonsDirective = parsed.children[0].directive === "parsonsprob"
            const parsonsShellId = parsed.children[0].children[0].value

            console.log(rstProblem)
            console.log(parsed)

            //This is where the pretext div is created for the parsons problem

            // if
            let $parsonsShell = $("<div>", {
                "data-component": "parsons",
                "id": parsonsShellId || "parsonsShell",
                "class": "parsons"
            });

            const $questionDiv = $("<div>", {
                "class": "parsons_question parsons-text"
            });

            const $questionText = $("<p>").text("Exercise from "+input.files[0].name + " loaded successfully");

            let $problemDiv = $("<pre>",{
                "data-question_label":"",
                "class":"parsonsblocks",
                "style": "visibility: hidden;"
            })

            let index = 0
            let hasReachedProblemDefinition = false

            let problemBlocks = " "
            for (const line of parsed.children[0].children){
                //to skip the first line which has the directive's name
                if (index === 0){
                    index = index + 1
                    continue
                }
                index = index + 1


                if(!hasReachedProblemDefinition) {

                    if (line.value[0] !== ":" ){
                        if (line.value === "-----"){
                            hasReachedProblemDefinition = true
                        }
                        continue
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
                }else{
                    console.log(line.value)
                    // problemBlocks = problemBlocks + line.value + " "
                    if (line.value === "====="){
                        problemBlocks = problemBlocks + "---" + " "
                    }else {
                        problemBlocks = problemBlocks + line.value + " "
                    }
                    // $problemDiv.append(line.value)
                }

            }
            console.log(problemBlocks)

            $questionDiv.append($questionText)

            //the problem definition read from the rst file is injected here
            $problemDiv.text(problemBlocks)

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