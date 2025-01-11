.. parsonsprob:: pb-reduction
  :language: math
  :grader: dag

  .. raw:: html

      <embed>
          <p>Show the general process for reducing one problem to another.</p>
      </embed>

  -----
  Consider any two problems for which a suitable reduction from one to the other can be found. #tag:start; depends:;
  =====
  The first problem takes an arbitrary instance of its input, which we will call <b>I</b>, and transforms <b>I</b> to a solution, which we will call <b>SLN</b>. #tag:first; depends:start;
  =====
  The second problem takes an arbitrary instance of its input, which we will call <b>I’</b>, and transforms <b>I’</b> to a solution, which we will call <b>SLN’</b>. #tag:second; depends:first;
  =====
  Transform an arbitrary instance of the first problem to an instance of the second problem. In other words, there must be a transformation from any instance <b>I</b> of the first problem to an instance <b>I’</b> of the second problem. #tag:transform; depends:second;
  =====
  Apply an algorithm for the second problem to the instance <b>I’</b>,
yielding a solution <b>SLN’</b>. #tag:algorithm; depends:transform;
  =====
  Transform <b>SLN’</b> to the solution of <b>I</b>, known as <b>SLN</b>. Note that <b>SLN</b> must in fact be the correct solution for <b>I</b> for the reduction to be acceptable. #tag:finish; depends:transform;
