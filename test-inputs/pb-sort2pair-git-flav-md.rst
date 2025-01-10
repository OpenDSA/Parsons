.. parsonsprob:: pb-sort2pair
  :language: math
  :grader: dag

  .. raw:: html

      <embed>
          <p>Show the steps to prove that the SORTING problem can be reduced to the PAIRING problem.</p>
      </embed>

  -----
  Start with an input instance to SORTING (an array of records). #tag:start; depends:;
  =====
  Start with an input instance to PAIRING (an array of records). #distractor
  =====
  Start with an input instance to PAIRING (two arrays, one an array of n arbitrary records, the other with the values 0 to n-1). #distractor
  =====
  Define a transformation that converts an arbitrary instance of SORTING to some instance of PAIRING. #tag:t1; depends:start;
  =====
  Define a transformation that converts an arbitrary instance of PAIRING to some instance of SORTING. #distractor
  =====
  Feed to PAIRING the following two arrays: the input to SORTING (array A of size n) along with a second array with values 0 to n-1. #tag:pairingin; depends:t1;
  =====
  Compute PAIRING on its input. The result is **SLN'**, an array of paired records, where each such paired record is defined as (pos, pairedInput). #tag:pairing; depends:pairingin;
  =====
  Convert **SLN** to array **SLN**, the solution to SORTING, by doing a binsort on A’. Specifically, for each pair (pos, pairedInput) in **SLN'**, place pairedInput into position pos in array **SLN**. #tag:t2; depends:pairing;
  =====
  Return SLN, the solution to SORTING. #tag:finish; depends:t2;
  =====
  Return SLN, the solution to PAIRING. #distractor
