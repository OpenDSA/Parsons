.. parsonsprob:: pb-nptemplate-DAG
  :language: math
  :grader: dag

  .. raw:: html

      <embed>
          <p>Show the general process for an NP-Completeness proof.</p>
      </embed>

  -----
  To prove that a problem X is NP-complete do this: #tag:starter; depends:;
  =====
  1. Show that X is in NP. #tag:xinNP; depends:starter;
  =====
  Create an algorithm to solve X (()that might or might not use non-determinism) that runs in polynomial time. #tag:algorithm; depends:xinNP;
  =====
  2. Show that X is NP-hard. #tag:starthard; depends:algorithm;
  =====
  Choose a known NP-hard problem A. #tag:choose; depends:starthard;
  =====
  Define two transformations. #tag:trans; depends:choose;
  =====
  Describe a polynomial-time algorithm that takes an arbitrary instance (\textbf{I}) of A to an instance (\textbf{I}') of X. #tag:t1; depends:trans;
  =====
  Describe a polynomial-time algorithm that takes an arbitrary instance (\textbf{I}) of X to an instance (\textbf{I}') of A. #distractor
  =====
  Describe a polynomial-time transformation from the solution for (\textbf{I}’) in problem X call it (\textbf{SLN}') to (\textbf{SLN}) such that (\textbf{SLN}) is the solution for (\textbf{I}) in problem A. #tag:t2; depends:trans;
  =====
  Describe a polynomial-time transformation from the solution for (\textbf{I}’) in problem A call it (\textbf{SLN}’) to (\textbf{SLN}) such that (\textbf{SLN}) is the solution for (\textbf{I}) in problem X. #distractor
