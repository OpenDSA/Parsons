# Parsons

This is a server side rendered implementation of OpenDSA/Parsons.
This implementation consumes
the [Parsons Problem Input Format (PIF)](https://docs.google.com/document/d/1ZzEgS4_2SyS88fhWVp0041KmfWFnXBKgMWmPEDI7chw/edit?usp=sharing)
an extension of [PEML](https://cssplice.org/peml/).

## How to run

1. Clone the repo

```bash
git clone https://github.com/OpenDSA/Parsons.git
```

### For Development

1. Install dependencies

```bash
npm install 
```


#### Server-side development
2. Run server

```bash
node server/index.js 
```

OR (for hot reloads on save)

```bash
nodemon server/index.js
```

The homepage will be served at http://localhost:3000/parsons/ by default. To use a different port set PORT in the environment to the desired one. 

OR Copy `.env.example` and edit as desired

```bash
cp .env.example .env
```


#### Client-side development
3. Client-side code can be found in `./src`. This code is bundled with webpack into the `./public` directory with the command below.
```bash
  npx webpack --config webpack.config.js
```
NB: Remember to bundle when changes are made so they are served to the browser.


### For Production

```bash
docker compose up
```

## Library Usage

`Parsons` is a plain class exported from this package — `new Parsons(opts)` builds and inserts the widget synchronously (aside from a couple of async layout passes described below) and hands you back the instance. It does not require any Runestone-specific global setup (`window.eBookConfig`, course/email, etc.) — see [Constructor options](#constructor-options) below.

### Creating an instance

```js
import Parsons from "parsons-prakhar"; // or const { Parsons } = require("parsons-prakhar");

const container = document.getElementById("my-problem");

const problem = new Parsons({
    orig: container,        // element the widget renders into
    divid: "my-problem",    // unique id for this instance
    pifJson: {               // Parsons Problem Input Format (PIF) JSON
        value: {
            question_text: "<p>Arrange the blocks to print Hello, Parsons, Problems.</p>",
            options: {
                grader: "line",       // "line" | "dag" | { type: "line"|"dag" }
                adaptive: false,       // enables the "Help Me" button
                numbered: false,       // false | "left" | "right"
                language: "python",    // syntax-highlighting language, or "natural" / "math" / "none"
                runnable: false,       // show a "Run" button once solved
            },
            blocks: [
                { text: "print('Hello')" },
                { text: "print('Parsons')" },
                { text: "print('Oops!')", depends: "-1" }, // "-1" (or type: "distractor") marks a distractor
                { text: "print('Problems')" },
            ],
        },
    },
});
```

`problem` is the live instance — its DOM elements (`problem.checkButton`, `problem.resetButton`, `problem.answerArea`, …) already exist by the time the constructor returns, since only a couple of internal layout passes (e.g. MathJax typesetting) are asynchronous. If you need to know when those have settled, wait for `await problem.checkServerComplete` (only set when going through the non-PIF/server path) or simply give the page a tick before measuring geometry — the hooks below don't require it.

### Constructor options

Only the options relevant to embedding the widget as a library are listed here; PIF content options (`grader`, `adaptive`, `language`, …) live inside `pifJson.value.options` as shown above.

| Option | Type | Default | Purpose |
|---|---|---|---|
| `orig` | `Element` | — | Container the widget renders into. |
| `pifJson` | `object` | — | The PIF problem definition (`{ value: {...} }`). |
| `divid` | `string` | auto-generated | Unique id for this instance; used to key any hash/state you persist. |
| `initialState` | `object \| null` | `null` | Previously saved state to restore **synchronously**, with no fetch. See [State: `initialState` / `onStateChange`](#state-initialstate--onstatechange). |
| `onStateChange` | `(state) => void` | — | Fires after every check/evaluation and every reset with the current state, so you can persist it however you like. |
| `showFeedback` | `boolean` | `true` | Master switch for whether Parsons renders its own feedback UI at all (message box **and** block highlighting). `false` only suppresses *display* — `onFeedback` still fires. See note on precedence below. |
| `showFeedbackText` | `boolean` | `true` | Finer-grained than `showFeedback`: suppresses only the text message box at the bottom. Block-level highlighting (`correct`/`incorrect`/`indentLeft`/`indentRight`/`incorrectPosition`) is never affected by this — only by `showFeedback` above. Has no effect if `showFeedback` is already off. |
| `onFeedback` | `(feedback) => void` | — | Fires after every check with the grading result, regardless of `showFeedback`/`showFeedbackText`. |
| `debugFeedback` | `boolean` | `false` | Whether Parsons shows an on-screen warning box for structural/parsing problems (bad PIF data, corrupt saved state, MathJax failures, …). Independent of `showFeedback`. |
| `onDebugFeedback` | `(info) => void` | — | Fires whenever such a problem is reported, regardless of `debugFeedback`. These are always logged via `console.warn` as well. |
| `onCheck` | `() => void` | — | Fires the instant **Check Me** is clicked, before any grading happens. |
| `onReset` | `() => void` | — | Fires the instant **Reset** is clicked, before the problem is actually reset. |

### State: `initialState` / `onStateChange`

The library never fetches or persists saved state itself — that's entirely the host's job. You hand it whatever was last saved (or `null`/omit it if there's none), and it hands you a plain, serializable object back whenever there's something new to save.

```js
new Parsons({
    orig, divid, pifJson,
    initialState: previouslySavedStateOrNull, // e.g. what you got from onStateChange last time
    onStateChange(state) {
        // state = { source, answer, correct, checkCount, timestamp }
        myBackend.saveProgress(divid, state); // however/wherever you want
    },
});
```

- `source` / `answer` are opaque hash strings (line-index-based) — safe to store as-is and hand back unchanged as `initialState.source` / `.answer`. They only mean something in the context of the exact same `pifJson` that produced them.
- `correct` is `true`, `false`, or `null` (not yet checked / just reset).
- If `initialState` represents a previously-*correct* answer, the widget restores with the answer area already arranged and the **Check Me** button disabled — exactly as if the student had just solved it in this session. Dragging a block re-enables the button, same as live play.
- `onStateChange` fires after every check (correct or not) and after every reset — not on every drag, to avoid flooding your persistence layer.

### Feedback: `showFeedback` / `showFeedbackText` / `onFeedback`

```js
new Parsons({
    orig, divid, pifJson,
    showFeedback: false,       // master switch: don't paint anything ourselves (message + highlighting)
    showFeedbackText: false,   // finer-grained: keep block highlighting, but hide the text message box
    onFeedback(feedback) {
        // feedback = {
        //   grade: "correct" | "incorrectTooShort" | "incorrectIndent" | "incorrectMoveBlocks",
        //   correct: boolean,
        //   checkCount: number,
        //   message: string,                 // same text the built-in UI would have shown
        //   blocks: {
        //     indentLeft: [blockViewId],      // needs LESS indentation
        //     indentRight: [blockViewId],      // needs MORE indentation
        //     incorrectPosition: [blockViewId],
        //   },
        //   distractorFeedback: [string],      // any per-distractor hint text
        // }
        myUI.renderFeedback(feedback);
    },
});
```

Blocks are identified by `view.id` (a string) rather than DOM elements, so the object stays plain and serializable; look elements up yourself via `problem.getBlockById(id)` if you need them.

**Precedence for whether Parsons paints its own UI:** default `true` → `showFeedback` option → PIF-authored `grader.show_feedback` (i.e. `pifJson.value.options.grader.show_feedback`, when present) → `problem.grader.showfeedback`. Each of the first three is resolved once, at construction, into `problem.grader.showfeedback` — but that flag is the final word after that: you can flip it directly at any point (e.g. mid-session) to override whatever the constructor resolved, without touching any of the original sources.

**`showFeedbackText` is independent and only matters once the master switch above is on.** It gates *only* the message box (`feedbackArea.fadeIn`/`.html`) — every `addClass("correct"/"incorrect"/"indentLeft"/"indentRight"/"incorrectPosition")` call in `paintFeedback()` always runs regardless of it, so block-level highlighting is never affected by `showFeedbackText`. `onFeedback` is never affected by any of this (`showFeedback`, `showFeedbackText`, or `grader.showfeedback`) — it always fires with the full feedback object.

### Debug feedback: `debugFeedback` / `onDebugFeedback`

A separate channel from the student-facing feedback above — this is for *structural* problems: invalid or missing PIF data, a malformed block, a saved-state hash that no longer matches the problem definition, MathJax failing to typeset, a fixed block ending up somewhere it shouldn't. These are developer-facing, not student-facing.

```js
new Parsons({
    orig, divid, pifJson,
    debugFeedback: false,     // default; keep Parsons' own on-screen warning box off
    onDebugFeedback(info) {
        // info = { message: string, details: any, timestamp: Date }
        myLogger.warn("[parsons]", info.message, info.details);
    },
});
```

`onDebugFeedback` always fires when such a problem occurs, and it's always logged via `console.warn` too — `debugFeedback` only controls whether Parsons *additionally* shows its own on-screen warning box.

### Interaction hooks: `onCheck` / `onReset` / `onHelp`

Fire the instant the corresponding button is clicked — before any of the resulting logic (grading, resetting, adaptive help) runs. Use these when you want to know "a button was pressed" as its own event, distinct from `onStateChange`/`onFeedback`, which report the *result* of an action rather than the interaction itself.

```js
new Parsons({
    orig, divid, pifJson,
    onCheck() { analytics.track("parsons_check_clicked", { divid }); },
    onReset() { analytics.track("parsons_reset_clicked", { divid }); },
    onHelp()  { analytics.track("parsons_help_clicked", { divid }); },
});
```

### Full example

```js
new Parsons({
    orig: document.getElementById("my-problem"),
    divid: "my-problem",
    pifJson: myPifJson,
    initialState: myBackend.getSavedState("my-problem"), // or null
    onStateChange: (state) => myBackend.saveProgress("my-problem", state),
    showFeedback: false,
    onFeedback: (feedback) => myUI.renderFeedback(feedback),
    debugFeedback: false,
    onDebugFeedback: (info) => myLogger.warn("[parsons]", info.message, info.details),
    onCheck: () => analytics.track("parsons_check_clicked"),
    onReset: () => analytics.track("parsons_reset_clicked"),
    onHelp: () => analytics.track("parsons_help_clicked"),
});
```
