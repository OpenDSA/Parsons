/* =====================================================================
==== ParsonsLine Object ================================================
======== The model and view of a line of code.
======== Based on what is specified in the problem.
======== ParsonBlock objects have one or more of these.
==== PROPERTIES ========================================================
======== problem: the Parsons problem
======== index: the index of the line in the problem
======== text: the text of the code line
======== indent: the indent level
======== view: an element for viewing this object
======== distractor: whether it is a distractor
======== paired: whether it is a paired distractor
======== groupWithNext: whether it is grouped with the following line
======== width: the pixel width when rendered
============ in the initial grouping
===================================================================== */
// Initialize from codestring

import ParsonsToggle from './parsonsToggle.js';
import ParsonsTextInput from './parsonsTextInput.js';

export default class ParsonsLine {
    constructor(problem, codestring, displaymath, togglesArray = [], textArray = [], block) {
        this.problem = problem;
        this.index = problem.lines.length;
        var trimmed = codestring.replace(/\s*$/, "");
        this.text = trimmed.replace(/^\s*/, "");
        this.toggles = [];
        this.textInputs = [];

        //28-31: Not from Runestone
        // this.text = this.text.replace(/\*\*(.*?)\*\*/g, '\(\textbf{$1}\)');
        // this.text = this.text.replace(/\*(.*?)\*/g, '\(\textif{$1}\)');
        // this.text = this.text.replace(/<b>(.*?)<\/b>/g, '\(\textbf{$1}\)');
        // this.text = this.text.replace(/<i>(.*?)<\/i>/g, '\(\textif{$1}\)');

        this.indent = trimmed.length - this.text.length;
        // Create the View
        var view;
        // TODO: this does not work with display math... Perhaps with pretext we should have html as a language and do nothing?
        
        if (problem.options.language == "natural" || problem.options.language == "math") {
            if (! displaymath) {
                view = document.createElement("p");
            } else {
                view = document.createElement("div");
            }
        } else {
            view = document.createElement("code");
            $(view).addClass(problem.options.prettifyLanguage);
        }
        view.id = problem.counterId + "-line-" + this.index;

        //combine toggle and text arrays into one
        const togglesAndTextInput = [
            ...togglesArray.map(toggle => ({ ...toggle, type: 'toggle'})),
            ...textArray.map(textInput => ({ ...textInput, type: 'text'}))
        ]

        //sort by earliest start index
        togglesAndTextInput.sort((a, b) => a.start_index - b.start_index);

        //array for dom nodes that will be appended to view later
        this.nodes = [];
        let lastIndex = 0;

        togglesAndTextInput.forEach(t => {

            //add text between two toggles/delimiters
            if (t.start_index > lastIndex) {
                const leadingText = this.text.slice(lastIndex, t.start_index);
                this.nodes.push(document.createTextNode(leadingText));
            }

            if (t.type === 'toggle') {
                const toggle = new ParsonsToggle(t, this);
                this.toggles.push(toggle);
                this.nodes.push(toggle.button);
            } else {
                const textInput = new ParsonsTextInput(t, this);
                this.textInputs.push(textInput);
                this.nodes.push(textInput.text_input);
            }

            lastIndex = t.end_index;
        });

        // Final tail of the string
        if (lastIndex < this.text.length) {
            this.nodes.push(document.createTextNode(this.text.slice(lastIndex)));
        }

        this.nodes.forEach(node => {
            view.appendChild(node);
        })

        this.view = view;
        problem.lines.push(this);

        //track how the string grows or shortens as text is changed
        let cumulativeOffset = 0;

        //update text to remove delimiters and reflect actual state
        [...this.toggles, ...this.textInputs]
            .sort((a, b) => a.start_index - b.start_index)
            .forEach(t => {
            let text;
            let start;
            let end;

            if (t instanceof ParsonsToggle) {
                text = t.button.textContent;
                start = t.start_index;
                end = t.end_index;
            } else {
                text = t.inner_content;
                start = t.start_index;
                end = t.end_index;
            }

            start += cumulativeOffset;
            end += cumulativeOffset;

            this.text = this.text.slice(0, start) + text + this.text.slice(end);
            t.start_index = start;
            t.end_index = start + text.length;

            const lengthDifference = text.length - (end - start);
            cumulativeOffset += lengthDifference;
        });
    }

    //updates text after changing text input or toggle
    updateText(replacement, start_index, old_end_index){
        const lengthDifference =  replacement.length - (old_end_index - start_index);
        this.shiftSiblingIndices(start_index, lengthDifference);
        this.text = this.text.slice(0, start_index) + replacement + this.text.slice(old_end_index);
        console.log(this.text);
    }

    //shifts end and start index when toggles and text inputs are modified
    shiftSiblingIndices(changedStartIndex, shiftAmount) {
        if (shiftAmount === 0) return;

        // Shift toggles that come after the one edited
        this.toggles.forEach(toggle => {
            if (toggle.start_index > changedStartIndex) {
                toggle.start_index += shiftAmount;
                toggle.end_index += shiftAmount;
            }
        });

        // Shift text inputs after the one edited
        this.textInputs.forEach(input => {
            if (input.start_index > changedStartIndex) {
                input.start_index += shiftAmount;
                input.end_index += shiftAmount;
            }
        });
    }

    // Initialize what width the line would naturally have (without indent)
    initializeWidth() {
        // this.width does not appear to be used anywhere later
        // since changing the value of this.width appears to have no effect. - Vincent Qiu (September 2020)
        this.width =
            $(this.view).outerWidth(true) -
            this.problem.options.pixelsPerIndent * this.indent;

        // Pass this information on to be used in class Parsons function initializeAreas
        // to manually determine appropriate widths - Vincent Qiu (September 2020)
        this.view.fontSize = window
            .getComputedStyle(this.view, null)
            .getPropertyValue("font-size");
        this.view.pixelsPerIndent = this.problem.options.pixelsPerIndent;
        this.view.indent = this.indent;

        // Figure out which typeface will be rendered by comparing text widths to browser default - Vincent Qiu (September 2020)
        var tempCanvas = document.createElement("canvas");
        var tempCanvasCtx = tempCanvas.getContext("2d");
        var possibleFonts = window
            .getComputedStyle(this.view, null)
            .getPropertyValue("font-family")
            .split(", ");
        var fillerText = "abcdefghijklmnopqrstuvwxyz0123456789,./!@#$%^&*-+";
        tempCanvasCtx.font = this.view.fontSize + " serif";
        var serifWidth = tempCanvasCtx.measureText(fillerText).width;
        for (let i = 0; i < possibleFonts.length; i++) {
            if (possibleFonts[i].includes('"')) {
                possibleFonts[i] = possibleFonts[i].replaceAll('"', "");
            }
            if (possibleFonts[i].includes("'")) {
                possibleFonts[i] = possibleFonts[i].replaceAll("'", "");
            }
            tempCanvasCtx.font = this.view.fontSize + " " + possibleFonts[i];
            if (tempCanvasCtx.measureText(fillerText).width !== serifWidth) {
                this.view.fontFamily = possibleFonts[i];
                break;
            }
        }
    }
    // Answer the block that this line is currently in
    block() {
        for (let i = 0; i < this.problem.blocks.length; i++) {
            var block = this.problem.blocks[i];
            for (var j = 0; j < block.lines.length; j++) {
                if (block.lines[j] === this) {
                    return block;
                }
            }
        }
        return undefined;
    }
    // Answer the indent based on the view
    viewIndent() {
        if (this.problem.noindent) {
            return this.indent;
        } else {
            var block = this.block();
            return this.indent - block.solutionIndent() + block.indent;
        }
    }
    // Clones a line
    cloneLineForReusable() {
        const cloned = new ParsonsLine(this.problem, this.text, false, []);
        cloned.indent = this.indent;
        cloned.reusable = this.reusable;
        cloned.distractor = this.distractor;
        cloned.paired = this.paired;
        cloned.fixed = this.fixed;
        cloned.groupWithNext = this.groupWithNext;
        cloned.isCloneLine = true;
        return cloned;
    }
}
