.. parsonsprob:: pb-Clique2IS-DAG
  :language: math
  :grader: dag

  .. raw:: html

      <embed>
          <p>Show a proof that the decision form of Independent Set is NP-complete.</p>
      </embed>

  -----
  1. Show that INDEPENDENT SET is in NP. #tag:inNP; depends:;
  =====
  Nondeterministically guess some subset of the vertices. If this set is at least of size k (k is the parameter to the decision problem), and the vertices are all independent, then return YES. Otherwise return NO. #tag:algorithm; depends:inNP;
  =====
  Nondeterministically guess some collection of vertices. If the vertices are independent, and if it is the biggest such set, then return YES. Otherwise return NO. #distractor
  =====
  2. Show that INDEPENDENT SET is NP-hard by using a reduction of known NP-complete problem CLIQUE to IS. #tag:NPhard; depends:algorithm;
  =====
  2. Show that INDEPENDENT SET is NP-hard by using a reduction of IS to known NP-hard problem CLIQUE. #distractor
  =====
  Show transformations to reduce CLIQUE to IS. #tag:starthard; depends:NPhard;
  =====
  Show transformations to reduce IS to CLIQUE. #distractor
  =====
  To reduce a CLIQUE input instance to an IS input instance for a given graph $G = (V , E)$, construct a complementary graph $G' = (V' , E’)$ such that: #tag:reduce; depends:starthard;
  =====
  To reduce an IS input instance to a CLIQUE input instance for a given graph $G = (V , E)$, construct a complementary graph $G' = (V' , E’)$ such that: #distractor
  =====
  a. $V = V'$. That is, the complement graph will have the same vertices as the original graph. #tag:step1; depends:reduce;
  =====
  b. $E'$ is the complement of $E$ that is $G'$ has all the edges that is <b>not</b> present in $G$. #tag:step2; depends:step1;
  =====
  Construction of the complementary graph can be done in polynomial time. #tag:polynomial; depends:step2;
  =====
  We need to show that with this reduction, there is an independent set of size k in the complement graph if and only iff there exists a clique of size k in G. #tag:iff; depends:step2;
  =====
  <b>If there is an independent set of size $k$ in the complement graph $G'$</b>, it implies no two vertices share an edge in $G'$, which further implies all of those vertices share an edge with all others in $G$ forming a clique. That is, <b>there exists a clique of size $k$ in $G$</b>. #tag:if; depends:iff;
  =====
  <b>If there is a clique of size $k$ in the graph $G$</b>, it implies all vertices share an edge with all others in $G$, which further implies no two of these vertices share an edge in $G'$ (thus forming an Independent Set. That is, <b>there exists an independent set of size $k$ in $G'$</b>. #tag:onlyif; depends:iff;
