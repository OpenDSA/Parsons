const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const REPO = '/Users/kwasibiritwum-nyarko/zone/sandbox/Parsons';
const fixtureName = process.argv[2] || 'jsparsons-java-example-order.json';
const pifJson = JSON.parse(fs.readFileSync(path.join(REPO, 'tests/positive', fixtureName), 'utf8'));

const html = `<!doctype html><html><head></head><body>
<div id="parsons-container" class="parsons" data-component="parsons">
  <div class="parsons_question parsons-text"><p>q</p></div>
</div>
</body></html>`;

(async () => {
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  window.eBookConfig = { isPlaygroundEnv: true };

  const jqueryFactory = require('jquery');
  const jq = jqueryFactory(window);
  window.$ = jq;
  window.jQuery = jq;
  jq.i18n = function (key) {
    if (key === undefined) return { load: function () {} };
    return key;
  };

  window.HTMLCanvasElement.prototype.getContext = function () {
    return { font: '', measureText: function (text) { return { width: text.length * 7 }; } };
  };

  const bundlePath = path.join(REPO, 'dist/parsons.js');
  const bundleCode = fs.readFileSync(bundlePath, 'utf8');
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = bundleCode;
  window.document.head.appendChild(scriptEl);

  const origLog = console.log;
  console.log = function (...args) {
    // suppress the noisy debug console.log(answerLines) dump from answerLines()
    if (args[0] instanceof Array) return;
    origLog(...args);
  };

  const problem = new window.Parsons({
    orig: window.document.getElementById('parsons-container'),
    pifJson: pifJson,
    divid: 'parsons-container',
    useRunestoneServices: false,
  });

  await new Promise((r) => setTimeout(r, 300));

  console.log('solution:', problem.solution.map(l => ({ tag: l.tag, indent: l.indent })));

  function placeInOrder(tagsInOrder, indentOverrides) {
    while (problem.answerArea.firstChild) problem.answerArea.removeChild(problem.answerArea.firstChild);
    for (const tag of tagsInOrder) {
      const block = problem.blocks.find(b => b.lines[0] && b.lines[0].tag === tag);
      if (!block) { console.log('NO BLOCK FOR TAG', tag); continue; }
      if (indentOverrides && indentOverrides[tag] !== undefined) {
        block.indent = indentOverrides[tag];
      }
      problem.answerArea.appendChild(block.view);
    }
  }

  const correctOrder = problem.solution.map(l => l.tag);
  console.log('correctOrder tags:', correctOrder);

  // Correct order, but flatten ALL indentation to 0 (wrong for tags two/three/four which need indent=1)
  placeInOrder(correctOrder, {}); // block.indent defaults to 0 for freshly built blocks - deliberately NOT setting it to 1

  problem.checkCurrentAnswer();
  console.log('=== correct order, WRONG (flat) indent: grade=', problem.grade);
  console.log('    indentLeft:', problem.grader.indentLeft.map(l => l.tag));
  console.log('    indentRight:', problem.grader.indentRight.map(l => l.tag));
  for (const tag of correctOrder) {
    const block = problem.blocks.find(b => b.lines[0] && b.lines[0].tag === tag);
    const line = block.lines[0];
    console.log(`    tag=${tag} prescribedIndent=${line.indent} block.indent=${block.indent} viewIndent()=${line.viewIndent()} block.solutionIndent()=${block.solutionIndent()}`);
  }

})().catch(e => { console.error('ERROR', e); process.exit(1); });
