const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const REPO = '/Users/kwasibiritwum-nyarko/zone/sandbox/Parsons';
const fixtureName = process.argv[2] || 'pb-reduction.json';
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

  // localStorage polyfill (jsdom provides window.localStorage already for http url)
  window.eBookConfig = { isPlaygroundEnv: true };

  // parsons.js references a bare global `$` at module load time (bottom of
  // the file), so pre-attach jquery to the window before the bundle runs.
  const jqueryFactory = require('jquery');
  const jq = jqueryFactory(window);
  window.$ = jq;
  window.jQuery = jq;
  // Minimal stub for the jquery.i18n plugin (not loaded in this harness) so
  // bare `$.i18n(key, ...)` calls in parsons.js don't throw.
  jq.i18n = function (key) {
    if (key === undefined) return { load: function () {} };
    return key;
  };

  // jsdom doesn't implement canvas 2D context without the native `canvas`
  // package; parsonsLine.js uses a scratch canvas purely to sniff which
  // font actually rendered. Stub it out with a deterministic fake.
  window.HTMLCanvasElement.prototype.getContext = function () {
    return {
      font: '',
      measureText: function (text) {
        return { width: text.length * 7 };
      },
    };
  };

  const bundlePath = path.join(REPO, 'dist/parsons.js');
  const bundleCode = fs.readFileSync(bundlePath, 'utf8');

  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = bundleCode;
  window.document.head.appendChild(scriptEl);

  console.log('window.Parsons?', typeof window.Parsons);
  console.log('window.$?', typeof window.$);

  const problem = new window.Parsons({
    orig: window.document.getElementById('parsons-container'),
    pifJson: pifJson,
    divid: 'parsons-container',
    useRunestoneServices: false,
  });

  // wait a bit for async initializeAreas
  await new Promise((r) => setTimeout(r, 500));

  console.log('solution tags:', problem.solution.map(l => l.tag));
  console.log('blocks:', problem.blocks.length);

  function moveAllToAnswerInOrder(orderTags) {
    // clear answer area
    while (problem.answerArea.firstChild) problem.answerArea.removeChild(problem.answerArea.firstChild);
    // put blocks back to source too (simplify: just move desired ones)
    for (const tag of orderTags) {
      const block = problem.blocks.find(b => b.lines[0] && b.lines[0].tag === tag);
      if (!block) { console.log('NO BLOCK FOR TAG', tag); continue; }
      problem.answerArea.appendChild(block.view);
    }
  }

  const correctOrder = problem.solution.map(l => l.tag);
  const wrongOrder = [...correctOrder].reverse();
  console.log('correctOrder:', correctOrder, 'wrongOrder:', wrongOrder);

  // Step 1: solve it correctly first.
  moveAllToAnswerInOrder(correctOrder);
  problem.checkCurrentAnswer();
  console.log('=== STEP1 correct order: grade=', problem.grade, 'hasSolved=', problem.hasSolved);

  // Step 2: reset.
  problem.resetView();
  await new Promise((r) => setTimeout(r, 500));
  console.log('=== STEP2 after reset: hasSolved=', problem.hasSolved, 'grade(stale)=', problem.grade, 'graderState=', problem.grader.graderState);

  // Step 3: rearrange WRONG and check again - this should NOT be "correct".
  moveAllToAnswerInOrder(wrongOrder);
  problem.checkCurrentAnswer();
  console.log('=== STEP3 wrong order after reset: grade=', problem.grade, 'hasSolved=', problem.hasSolved, 'graderState=', problem.grader.graderState);

  problem.renderFeedback();
  console.log('=== STEP3b after renderFeedback: problem.grade=', problem.grade);

})().catch(e => { console.error('ERROR', e); process.exit(1); });
