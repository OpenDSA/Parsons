# Internal Data Model

The JSON below represents a struct for the data model constructed in the Parsons implementation

```json
{
  "question_text" : "",
  "options" : {
    "grader" : {
      "type" : "",
      "showFeedback" : true,
    },
    "maxdist" : 0,
    "order" : "",
    "noindent" : true,
    "adaptive" : true,
    "numbered" : true,
    "language" : "",
    "runnable" : true
  },
  "blocks" : []
}
```

Line struct

```json
{
  "text" : "",
  "type" : "",
  "tag" : "",
  "depends" : "",
  "displaymath" : true
}
```

## Valid Options
Grader options
```
model["options"]["grader"]["type"] = "dag" | "basic-order" | "exec"
```
Language options
```
model["options"]["langauage"] = "python" | "java" | "javascript" | "html" | "c" | "c++" | "ruby" | "natural"
```
Block options
```
Block["type"] = "paired" or "distractor" or {"tag" : "", "depends" : ""}
```
