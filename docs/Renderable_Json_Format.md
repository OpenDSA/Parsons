# Renderable JSON Format
This covers the JSON format this library expects in order to properly render Parsons Problems

## Table of contents
- Overview
- Format / Schema
- Fields
- Examples
- Validation
- Versioning & changelog
- Authors & license

## Overview
Explain what this format represents, intended consumers, and high-level constraints.

## Format / Schema

### Top Level Schema

Example skeleton:
```json
{
    "question_text": "",
    "options": {},
    "blocks": []
}
```

## Fields

### Question Text
The instructions for for the exercise

key : `"question_text"`  <br>
type: string

### Options
Contains the configuration of features necessary for the proper rendering of the Parsons Problem

key : `"options"` <br>
type : map

```json
{
    "grader": {
        "type": "dag",
        "show_feedback": true
    },
    "maxdist": 0,
    "indent": {
        "active":true,
        "mode":"", // prescribed or free
        "max_indents":3 //Defaults to 3 if not specified
    },
    "adaptive": true,
    "numbered": false,
    "language": "math"
}
```
-  `"grader"`
    - Types are `dag` for order-graded exercises and `execute` for execution-based assignments
    - Show Feedback is booloean to determine whether students get feedback after checking their answer
- `"maxdist"` macimum number of distractors allowed. (Deprecated)
- `"indent"`
    - `active`: Boolean. If false, the `mode` and `max_indents` should not be provided.
    - `mode`: String. Options are `prescribed` and `free`.
        - `free` will not allow block level indent specifications. Block level indent specifications should be ignored if present. Users should be allowed to indent blocks as they wish. Two main use cases are: exercises that allow indentation but do not rely on the indents for correctness; execution-based exercises.
        - `prescribed` requires all blocks to include an `"indent"` key for specifying its correct indent level. This is especially useful for grading order-graded exercises that have indents.
    - `max_indents`: Number. The number of indent levels to be provided to the user. The **default** value will be set to 3 if not specified.
       
- `"adaptive"`: Boolean. Is it an adaptive parsons problem or not. This is `true` by **default**
- `"numbered"`: Boolean. Attaches numbers to the blocks when set to **true**
- `"language"`: String. Determines how the block text is displayed. It may also determine how code is extracted for execution provided the language has certain quirks. Supported options are:
    - `"math'`, `"natural"` - Renders text as if it were Git Flavored Markdown and handles latex. This should be the default mode.
    - `"python"`, `"java"`, `"javascript"`, `"html"`, `"c"`, `"c++"`, `"cpp"`,`"ruby"`.

<!-- - `"runnable"`: DEPRECATED, should go. -->

### Blocks
Contains the list of blocks to be displayed.

key : `"blocks"`  <br>
type: []blocks (list of blocks)

Structure of a block:

JSON skeleton (fill values as needed):
```json
{
    "text": "<string - block content to be displayed>",
    "code": "<string - optional raw code>",
    "type": "<string - semantic type or empty>",
    "tag": "<string - identifier / group tag>",
    "depends": "<string|array - tag(s) this block depends on>",
    "indent": "<number|boolean|string - indent level or tagging>",
    "displaymath": "<boolean>",
    "feedback": "<string - feedback for this block>",
    "toggle_options": [
        {
            "start_index": "<number>",
            "end_index": "<number>",
            "values": [ "<string>", "..."]
        }
    ]
}
```

Field reference (fill descriptions/examples):

- text  
    - type: string  
    - required: yes  
    - example: "for i in range(n):"  
    - notes: Rendered content; may contain Git Flavored Markdown/LaTeX.

- code  
    - type: string  
    - required: no  
    - example: "for i in range(n):\n  print(i)"  
    - notes: Raw code for execution if the display text is not executable. eg Pseudocode or code in a different language.

- type  
    - type: string  
    - required: no  
    - options: "distractor", "fixed", "toggle", "textbox"  
    - notes: Defines the type of block.

- tag  
    - type: string
    - required: no
    - example: any unique string
    - notes: Identifier used by depends to describe correct orderings

- depends  
    - type: string or array[string]  
    - required: yes, for order-grading only
    - example: "randomg1b1" or ["a","b"]  
    - notes: Ordering/dependency constraints (tag names).

- indent  
    - type: number 
    - required: conditional (when `"indent.mode" = "prescribed"`)  
    - example: 0, 1, 2
    - notes: If top-level indent.mode == "prescribed" use a number indicating level.Should be ommited otherwise.

- displaymath  
    - type: boolean  
    - required: no
    - example: true  
    - notes: Whether to render as display math / Markdown.

TODO: feedack and toggle_options should be lower level options within `type`

- feedback  
    - type: string  
    - required: no  
    - example: "This line should be before the loop."  
    - notes: Per-block feedback shown after grading/checking.

- toggle_options  
    - type: array of objects  
    - required: no  
    - example: see skeleton  
    - notes: Defines in-line selectable options; each object has:
        - start_index (number): start position in text
        - end_index (number): end position in text
        - values (array[string]): allowed substitutions



Add any other custom keys your renderer uses with the same mini-spec format above.
 * No code selection was provided.
 * Please paste the code you want documented and indicate the desired
 * documentation style (e.g., Javadoc, XML doc, Python docstring).
 */


## Examples
Full Example 1:
```json
{
    "question_text": "<p>Put the blocks <strong>in</strong> the proper order.</p>\n",
    "options": {
        "grader": {
            "type": "dag",
            "show_feedback": true
        },
        "maxdist": 0,
        "indent": {
            "active":true,
            "mode":"", // prescribed or free
            "max_indents":3 //Defaults to 3 if not specified
        },
        "adaptive": true,
        "numbered": false,
        "language": "math",
        "runnable": true
    },
    "blocks": [
        {
            "text": "Fixed Start",
            "type": "",
            "tag": "fixed",
            "depends": "",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "Random Group 1 Block 1",
            "type": "",
            "tag": "randomg1b1",
            "depends": "",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "Random Group 1 Block 2",
            "type": "",
            "tag": "randomg1b2",
            "depends": "randomg1b1",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "Random Group 1 $\\textbf{Block}$ 3",
            "type": "",
            "tag": "randomg1b3",
            "depends": "randomg1b2",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "Fixed $\\textbf{Middle}$",
            "type": "",
            "tag": "fixed",
            "depends": "",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "Random Group 2 Block 1",
            "type": "",
            "tag": "randomg2b1",
            "depends": "randomg1b3",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "Random Group 2 Block 2",
            "type": "",
            "tag": "randomg2b2",
            "depends": "randomg2b1",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "Random Group 2 Block 3",
            "type": "",
            "tag": "randomg2b3",
            "depends": "randomg2b2",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "Fixed End",
            "type": "",
            "tag": "fixed",
            "depends": "",
            "indent": "",
            "displaymath": true,
            "feedback": ""
        }
    ]
}
```
<br>

Toggles Example
```json
{
    "question_text": "<p>The constructed code should print the minimum of variables a and b.</p>\n",
    "options": {
        "grader": {
            "type": "exec",
            "showFeedback": true
        },
        "maxdist": 0,
        "order": "",
        "indent": true,
        "adaptive": true,
        "numbered": false,
        "language": "python",
        "runnable": true
    },
    "blocks": [
        {
            "text": "if ``a`b`c`` ``<`>`>=`` b",
            "type": "",
            "tag": "one1",
            "depends": "",
            "indent": true,
            "displaymath": true,
            "feedback": "",
            "toggle_options": [
                {
                    "start_index": 3,
                    "end_index": 12,
                    "values": [
                        "a",
                        "b",
                        "c"
                    ]
                },
                {
                    "start_index": 13,
                    "end_index": 23,
                    "values": [
                        "<",
                        ">",
                        ">="
                    ]
                }
            ]
        },
        {
            "text": "print(a)",
            "type": "",
            "tag": "two",
            "depends": "",
            "indent": true,
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "else",
            "type": "",
            "tag": "three",
            "depends": "",
            "indent": true,
            "displaymath": true,
            "feedback": ""
        },
        {
            "text": "print(b)",
            "type": "",
            "tag": "four",
            "depends": "",
            "indent": true,
            "displaymath": true,
            "feedback": ""
        }
    ]
}
```

## Validation



## Local Testing
Run the server normally.
To access files in the ./tests/postitive directory, use the endpoint route: /parsons/test/`<filename>`
For example: For an instance running on port 3000, http://localhost:3000/parsons/test/test 
