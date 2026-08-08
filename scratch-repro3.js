const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const REPO = '/Users/kwasibiritwum-nyarko/zone/sandbox/Parsons';
const pifJson = JSON.parse(fs.readFileSync(path.join(REPO, 'tests/positive/jsparsons-java-example-order.json'), 'utf8'));

const html = `<!doctype html><html><head></head><body>
<div id="parsons-container" class="parsons" data-component="parsons">
  <div class="parsons_question parsons-text"><p>q</p></div>
</div>
</body></html>`;

(async () => {
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true });
  const { window } = dom;
  window.eBookConfig = { isPlaygroundEnv: true };
  const jq = require('jquery')(window);
  window.$ = jq; window.jQuery = jq;
  jq.i18n = function (key) { return key === undefined ? { load: function(){} } : key; };
  window.HTMLCanvasElement.prototype.getContext = function () {
    return { font: '', measureText: (t) => ({ width: t.length * 7 }) };
  };
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = fs.readFileSync(path.join(REPO, 'dist/parsons.js'), 'utf8');
  window.document.head.appendChild(scriptEl);

  const origLog = console.log;
  console.log = (...a) => { if (a[0] instanceof Array) return; origLog(...a); };

  const problem = new window.Parsons({
    orig: window.document.getElementById('parsons-container'),
    pifJson, divid: 'parsons-container', useRunestoneServices: false,
  });
  await new Promise(r => setTimeout(r, 300));

  // Place all blocks in the CORRECT order into the answer area, correct indent too.
  const order = problem.solution.map(l => l.tag);
  for (const tag of order) {
    const block = problem.blocks.find(b => b.lines[0].tag === tag);
    block.indent = block.lines[0].indent; // start at their true prescribed indent
    problem.answerArea.appendChild(block.view);
  }

  console.log('BEFORE drag - line.indent values:', problem.solution.map(l => `${l.tag}=${l.indent}`));

  // Grade now: should be correct (order + indent both right).
  problem.checkCurrentAnswer();
  console.log('grade before any drag:', problem.grade);

  // Now simulate a real mouse-drag of the "two" block (needs indent=1) within the answer
  // area, ending up positioned at indent level 0 (flush left / wrong).
  const draggedBlock = problem.blocks.find(b => b.lines[0].tag === 'two');
  problem.moving = draggedBlock;
  problem.movingState = () => 'answer'; // force the "hovering over answer area" branch
  problem.movingX = 0;
  problem.movingY = 0;
  problem.indent = 3; // max indent range, same as options.indent.max_indents

  problem.updateView();

  console.log('AFTER drag (dropped at indent 0) - line.indent values:', problem.solution.map(l => `${l.tag}=${l.indent}`));
  console.log('draggedBlock.indent now =', draggedBlock.indent);

  delete problem.moving;
  problem.checkCurrentAnswer2 = problem.checkCurrentAnswer;
  // Reset hasSolved so we can check again with the (now wrong) indentation
  problem.hasSolved = false;
  problem.checkCurrentAnswer();
  console.log('grade AFTER dragging block to wrong visual indent:', problem.grade, '(expected: incorrectIndent, since "two" should be indent=1 but is now at 0)');
  console.log('answerLines order:', problem.answerLines().map(l => l.tag));
  console.log('solution order:', problem.solution.map(l => l.tag));
  console.log('indentLeft:', problem.grader.indentLeft.map(l=>l.tag), 'indentRight:', problem.grader.indentRight.map(l=>l.tag));
  console.log('correctLines:', problem.grader.correctLines, 'correctLength:', problem.grader.correctLength);

})().catch(e => { console.error('ERROR', e); process.exit(1); });
