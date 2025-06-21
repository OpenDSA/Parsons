function injectHTML(parsed, $) {
    //THIS IS CONVENIENT FOR DEBUGGING [COMMENTED INTENTIONALLY]
    // console.log(parsed.children[0].children)

    console.log("hanom")

    console.log(`parsed: ${JSON.stringify(parsed)}`)

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

    let $problemDiv = $("<pre>", {
        "data-question_label": "",
        "class": "parsonsblocks",
        "style": "visibility: hidden;"
    })

    let index = 0
    let inProblemBlockDefinition = false
    let inProblemInstruction = false

    let problemBlocks = " "
    let problemInstructions = ""

    let isRawHTML = false

    for (const line of parsed.children[0].children) {
        //to skip the first line which has the directive's name
        if (index === 0) {
            index = index + 1
            continue
        }
        index = index + 1

        //for handling the ".. parsonsprob" directive's options
        if (line.value[0] === ":") {
            if (line.value.includes(":question_label:")) {
                $problemDiv.attr("data-question_label",
                    line.value.replace(":question_label: "))
            } else {
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

            if (line.value.includes(":grader:")) {
                $problemDiv.attr("data-grader",
                    line.value.replace(":grader: ", ""))
            }

            if (line.value.includes(":maxdist:")) {
                $problemDiv.attr("data-maxdist",
                    line.value.replace(":maxdist: ", ""))
            }
        } else {
            if (!inProblemInstruction && !inProblemBlockDefinition) {
                inProblemInstruction = true
            }
            if (inProblemInstruction) {
                if (line.value === "-----") {
                    inProblemInstruction = false
                    inProblemBlockDefinition = true
                    continue
                }
                if (line.value === ".. raw:: html") {
                    isRawHTML = true
                    continue
                }

                problemInstructions = problemInstructions.concat(line.value, " ")
            }
            if (inProblemBlockDefinition) {
                if (line.value === "=====") {
                    problemBlocks = problemBlocks.concat("---")
                    continue
                }
                problemBlocks = problemBlocks === " "
                    ? problemBlocks.concat(line.value)
                    : problemBlocks.concat("\n", line.value)
            }
        }

    }

    if (isRawHTML) {
        $questionDiv.empty().append($($.parseHTML(problemInstructions)))
    } else {
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


function injectFromPIF(pifJson, $) {
    pifJson = pifJson.value

    //Creating Shells of Parsons HTML elements
    let $parsonsShell = $("<div>", {
        "data-component": "parsons",
        "id": pifJson.id || "parsonsShell",
        "class": "parsons"
    });

    const $questionDiv = $("<div>", {
        "class": "parsons_question parsons-text"
    });

    const $questionText = $("<p>").text("Exercise from loaded successfully");

    $questionDiv.append($questionText)

    let $problemDiv = $("<pre>", {
        "data-question_label": "",
        "class": "parsonsblocks",
        "style": "visibility: hidden;"
    })

    //PIF Options
    const validOptions = ["maxdist", "order", "indent", "grader", "adaptive",
        "numbered", "language", "runnable"]

    Object.entries(([optionKey, optionValue]) => {
        switch (optionKey) {
            case "grader":
                $problemDiv.attr("data-grader", optionValue.type)
                break
            default:
                if (validOptions.includes(optionKey))
                    $problemDiv.attr("data-" + optionKey, optionValue)
                else
                    console.error("Invalid parsons optiion parsed")
        }
    })


    //ADDING QUESTION INSTRUCTION
    //TODO git flavored markdown
    $questionDiv.empty().append($("<p>").append
    ($.parseHTML(pifJson.question_text)))

    //ADDING PROBLEM BLOCKS

    const blockTags = pifJson.blocks.map(block => block.tag)
    const uniqueBlockTags = [...new Set(blockTags)]

    const blockListLength = pifJson.blocks.length
    let problemBlocks = pifJson.blocks.reduce(
        (accumulator, currentValue, idx) =>
            accumulator.concat(
                lineWithTagAndDependencies(currentValue, uniqueBlockTags),
                idx < blockListLength - 1 ? "---" : ""
            ), ""
    )


    //the problem definition read from the rst file is injected here
    $problemDiv.text(problemBlocks)

    $parsonsShell.append($questionDiv)

    $parsonsShell.append($problemDiv)
    return $parsonsShell;
}

function lineWithTagAndDependencies(currentValue, tags) {
    if (tags.length) {
        const tagIndex = tags.indexOf(currentValue.tag)
        let depString = ""
        //Get Dependencies
        if (typeof currentValue.depends === "string") {
            const depIndex = tags.indexOf(currentValue.depends)
            depString = depIndex === -1 ? "" : " " + depIndex
        } else {
            //Handle multiple deps
            const depIndexes = currentValue.depends
                .map(dep => tags.indexOf(dep))
            depString = depIndexes
                .reduce((acc, curr, idx) =>
                        acc.concat(curr, idx === depIndexes.length - 1 ? "" : ",")
                    , " ")
        }
        return currentValue.text
            .concat(" #tag:" + tagIndex + "; depends:" + depString + ";")
    }
    return currentValue.text
}

module.exports = {
    injectHTML,
    injectFromPIF
}