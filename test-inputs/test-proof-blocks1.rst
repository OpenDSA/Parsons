.. parsonsprob:: test_proof_blocks_1
  :language: math
  :grader: dag

  .. raw:: html

      <embed>
          <p>Drag and drop <font color="red"><strong>ALL</strong></font> of the blocks below to create a proof of the following statement.</p>
          <center><font color="red">If graphs \(G\) and \(H\) are isomorphic and \(G\) is 2-colorable, then \(H\) is 2-colorable.</font></center>
      </embed>

  -----
  Assume \(G\) and \(H\) are isomorphic graphs and \(G\) is 2-colorable. #tag:0; depends:;
  =====
  Let \(c:V(G) \to \{red, blue\}\) be a 2-coloring of \(G\). #tag: 1; depends:0;
  =====
  Let \(f\) be an isomorphism \(V(H) \to V(G)\) #tag: 2; depends: 0;
  =====
  Define \(c':V(H) \to \{red, blue\}\) as \(c'(v)=c(f(v))\) #tag:3;depends:1,2;
  =====
  Let \(\langle u - v \rangle\) be an edge in \(H\). (If instead there are no edges in \(H\), then \(H\) is trivially 2-colorable and we are done.) #tag:4;depends:0;
  =====
  \(\langle f(u) - f(v) \rangle\) is an edge in \(G\) #tag:5;depends:4,2;
  =====
  \(c(f(u)) \ne c(f(v))\) #tag:6;depends:5,1;
  =====
  \(c'(u) \ne c'(v)\) #tag:7;depends:6,3;
  =====
  \(c'\) is a 2-coloring of \(H\), so \(H\) is 2-colorable. (end of proof) #tag:8;depends:7;
