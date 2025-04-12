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
  We know that the first problem takes an arbitrary instance of its input (()which we will call (\textbf{I})), and transforms (\textbf{I}) to a solution (()which we will call (\textbf{SLN})). #tag:first; depends:start;
  =====
  We know that the second problem takes an arbitrary instance of its input (()which we will call (\textbf{I}’)), and transforms (\textbf{I}’) to a solution (()which we will call (\textbf{SLN}’)). #tag:second; depends:first;
  =====
  To perform the reduction, transform an arbitrary instance of the first problem to an instance of the second problem. In other words, there must be a transformation from any instance (\textbf{I}) of the first problem to some instance (\textbf{I}') of the second problem. #tag:transform; depends:second;
  =====
  Apply an algorithm for the second problem to the instance (\textbf{I}’), yielding a solution (\textbf{SLN}’). #tag:algorithm; depends:transform;
  =====
  Transform (\textbf{SLN}’) into the solution of (\textbf{I}) (()this would be (\textbf{SLN})). Note that (\textbf{SLN}) must in fact be the correct solution for (\textbf{I}) for the reduction to be acceptable. #tag:finish; depends:transform;
