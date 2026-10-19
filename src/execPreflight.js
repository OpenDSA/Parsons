// Pre-flight checks for exec-graded exercises in languages whose own
// compiler/interpreter gives no indentation feedback (e.g. Java,
// JavaScript) - unlike Python or Ruby, where a bad indent is itself a
// parse error the interpreter would catch once the code actually runs.
// These checks stand in for that feedback *before* code is handed off
// for execution grading: first that brackets are balanced and properly
// nested (a prerequisite - indentation can't be meaningfully judged
// against unbalanced code), then that each line's indentation agrees
// with its own brace-nesting depth.
//
// Deliberately NOT a comparison against the solution's authored indent
// (that mechanism already exists for order/dag grading - see
// lineGrader.js/dagGrader.js's checkCorrectIndentation()). This is a
// structural self-consistency check instead, closer to what a linter or
// auto-formatter would flag, independent of what the "correct" answer is.

const BRACKET_OPENERS = { "(": ")", "[": "]", "{": "}" };
const BRACKET_CLOSERS = { ")": "(", "]": "[", "}": "{" };

// Walks `code`, skipping over string/char literals and // and /* */
// comments, matching ( ) [ ] { } with a stack. Returns a human-readable
// description of the first problem found (unmatched/misnested/unclosed
// bracket), or null if everything balances.
export function findBracketMismatch(code) {
    const stack = [];
    let inString = null; // one of '"', "'", "`", or null
    let inLineComment = false;
    let inBlockComment = false;
    let i = 0;

    while (i < code.length) {
        const ch = code[i];
        const next = code[i + 1];

        if (inLineComment) {
            if (ch === "\n") inLineComment = false;
            i++;
            continue;
        }
        if (inBlockComment) {
            if (ch === "*" && next === "/") {
                inBlockComment = false;
                i += 2;
                continue;
            }
            i++;
            continue;
        }
        if (inString) {
            if (ch === "\\") {
                i += 2; // skip the escaped character too
                continue;
            }
            if (ch === inString) inString = null;
            i++;
            continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
            inString = ch;
            i++;
            continue;
        }
        if (ch === "/" && next === "/") {
            inLineComment = true;
            i += 2;
            continue;
        }
        if (ch === "/" && next === "*") {
            inBlockComment = true;
            i += 2;
            continue;
        }
        if (BRACKET_OPENERS[ch]) {
            stack.push(ch);
            i++;
            continue;
        }
        if (BRACKET_CLOSERS[ch]) {
            const expectedOpener = BRACKET_CLOSERS[ch];
            const top = stack.pop();
            if (top !== expectedOpener) {
                return top === undefined
                    ? `'${ch}' has nothing open to close.`
                    : `'${ch}' doesn't match the most recently opened '${top}'.`;
            }
            i++;
            continue;
        }
        i++;
    }

    if (stack.length > 0) {
        return `'${stack[stack.length - 1]}' is never closed.`;
    }
    return null;
}

// Scans a single line's text (skipping strings/comments, same as above)
// and returns:
//   leadingCloses - count of '}' at the start of the line (before any
//     other non-whitespace content), e.g. "}}" -> 2, "} else {" -> 1.
//     These dedent the line itself relative to the depth carried in from
//     the previous line.
//   netDelta - (opens - closes) of '{'/'}' across the whole line, used
//     to carry the running depth into the next line.
// Only '{'/'}' are tracked here (unlike findBracketMismatch's three
// bracket types) since those are what actually define an indentation
// level in C-like languages; parens/brackets spanning a line don't
// normally shift a Parsons block's indent.
function scanBraceDelta(text) {
    let leadingCloses = 0;
    let netDelta = 0;
    let sawContent = false;
    let inString = null;
    let inLineComment = false;
    let inBlockComment = false;
    let i = 0;

    while (i < text.length) {
        const ch = text[i];
        const next = text[i + 1];

        if (inLineComment) {
            i++;
            continue;
        }
        if (inBlockComment) {
            if (ch === "*" && next === "/") {
                inBlockComment = false;
                i += 2;
                continue;
            }
            i++;
            continue;
        }
        if (inString) {
            if (ch === "\\") {
                i += 2;
                continue;
            }
            if (ch === inString) inString = null;
            sawContent = true;
            i++;
            continue;
        }
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
            inString = ch;
            sawContent = true;
            i++;
            continue;
        }
        if (ch === "/" && next === "/") {
            inLineComment = true;
            i += 2;
            continue;
        }
        if (ch === "/" && next === "*") {
            inBlockComment = true;
            sawContent = true;
            i += 2;
            continue;
        }
        if (ch === "{") {
            netDelta++;
            sawContent = true;
            i++;
            continue;
        }
        if (ch === "}") {
            netDelta--;
            if (!sawContent) leadingCloses++;
            i++;
            continue;
        }
        sawContent = true;
        i++;
    }

    return { leadingCloses, netDelta };
}

// entries: [{ text, indent, block }] in the order the student currently
// has them arranged (one per ParsonsLine; `block` is whatever reference
// the caller wants attached to a mismatch - the owning ParsonsBlock).
// `indent` is the block's chosen indent level (an integer count of
// indent steps, not raw spaces/pixels).
//
// Returns { tooDeep: [block...], tooShallow: [block...] } - the blocks
// whose line indent exceeds (tooDeep) or falls short of (tooShallow) the
// depth implied by brace nesting so far - or null if everything's
// self-consistent.
export function findIndentationMismatch(entries) {
    let depth = 0;
    const tooDeep = [];
    const tooShallow = [];

    for (const entry of entries) {
        const { leadingCloses, netDelta } = scanBraceDelta(entry.text);
        const expected = Math.max(0, depth - leadingCloses);
        if (entry.indent > expected) {
            tooDeep.push(entry.block);
        } else if (entry.indent < expected) {
            tooShallow.push(entry.block);
        }
        depth = Math.max(0, depth + netDelta);
    }

    if (tooDeep.length === 0 && tooShallow.length === 0) {
        return null;
    }
    return { tooDeep, tooShallow };
}
