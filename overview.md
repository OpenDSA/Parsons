<!-- THIS FILE HAS BEEN ADDED SOLELY AS A REFERENCE FOR RUNESTONE
    BEFORE A PROBLEM IS RENDERED, THE PROBLEM IS SERVED TO THE BROWSER IN THIS FORMAT.
    BELOW ARE SOME BASIC EXAMPLES DEMONSTRATING HOW FEATURES ARE EXPRESSED BEFORE THEY ARE RENDERED.
    

    WHEN A PIF EXERCISED IS PARSED AND FURTHER CONVERTED TO A JSON FORMAT FOR RUNESTONE,
    -->
# Runestone Reference
This file has been added soleley as a reference for how relevant information is presented in the browser to be rendered into a Parsons Problem.

Below are some basic examples demonstrating key features in Runestone's Implementation of Parsons. The exercises below can be found [here](https://runestone.academy/ns/books/published/overview/Assessments/parsons.html).


### Brief Overview
After a PIF excercise is validated and parsed, it can be fed to any supported system for problem rendering. Where rendering means, constructing the problem in a browser for use.

At the time of writing No single system supports all the features in Parons Input Format (PIF). For this reason the Programming Exercise Markup Language (PEML) gem which parses PIF exerices makes converters available in the spirit of interoperability. With these converters parsed PIF results can be translated into formats that are easily consumed by other Parsons implementations.

The runestone converter provides a JSON which is used in `./server/helpers/parsonsBuild.js` to construct problems ready to be rendered (these problems are of the structure below).


#### Simple Parsons Example
````html
<div data-component="parsons" id="morning" class="parsons">
    <div class="parsons_question parsons-text">
        <p>Put the blocks in order to describe a morning routine.</p>

    </div>
    <pre class="parsonsblocks" data-question_label="2.3.1" style="visibility: hidden;">        get up
    ---
    eat breakfast
    ---
    brush your teeth
            </pre>
</div>
````



#### Numbered Parsons Example
````html
<div data-component="parsons" id="per_person_cost" class="parsons">
    <div class="parsons_question parsons-text">
        <p>The following program should figure out the cost per person for a dinner including the tip. But the
            blocks have been mixed up. Drag the blocks from the left and put them in the correct order on the
            right. Click the <em>Check Me</em> button to check your solution.&lt;/p&gt;</p>

    </div>
    <pre class="parsonsblocks" data-question_label="2.3.2" data-numbered="left" style="visibility: hidden;">        bill = 89.23
    ---
    tip = bill * 0.20
    ---
    total = bill + tip
    ---
    numPeople = 3
    perPersonCost = total / numPeople
    ---
    print(perPersonCost)
            </pre>
</div>
````



#### Exercise with distractor
````html
<div data-component="parsons" id="java_countdown" class="parsons">
    <div class="parsons_question parsons-text">
        <p>The following program segment should print a countdown from 15 to 0 (15, 14, 13, … 0). But the blocks
            have been mixed up and include &lt;b&gt;one extra block&lt;/b&gt; that is not needed in a correct
            solution. Drag the needed blocks from the left and put them in the correct order on the right. Click
            the <em>Check Me</em> button to check your solution.&lt;/p&gt;</p>

    </div>
    <pre class="parsonsblocks" data-question_label="2.3.3" data-adaptive="true" data-noindent="true"
        data-numbered="left" style="visibility: hidden;">        public class Test1
    {
    ---
        public static void main(String[] args)
        {
    ---
            for (int i = 15; i &gt;=0; i--)
    ---
            for (int i = 15; i &gt; 0; i--) #distractor
    ---
                System.out.println(i);
    ---
        }
    ---
    }
            </pre>
</div>
````

#### Adaptive, Numbered, Noindent
````html
<div data-component="parsons" id="java_countdown_paired" class="parsons">
    <div class="parsons_question parsons-text">
        <p>The following program segment should print a countdown from 15 to 0 (15, 14, 13, … 0). But the blocks
            have been mixed up and include &lt;b&gt;one extra block&lt;/b&gt; that is not needed in a correct
            solution. Drag the needed blocks from the left and put them in the correct order on the right. Click
            the <em>Check Me</em> button to check your solution.&lt;/p&gt;</p>

    </div>
    <pre class="parsonsblocks" data-question_label="2.3.4" data-noindent="true" data-numbered="left"
        style="visibility: hidden;">        public class Test1
    {
    ---
        public static void main(String[] args)
        {
    ---
            for (int i = 15; i &gt;=0; i--)
    ---
            for (int i = 15; i &gt; 0; i--) #paired: This will stop when i is 0 so the countdown won't include 0
    ---
                System.out.println(i);
    ---
        }
    ---
    }
            </pre>
</div>
````

#### numbered Exercise with indents allowed
````html
<div data-component="parsons" id="java_countdown_paired2" class="parsons">
    <div class="parsons_question parsons-text">
        <p>The following program segment should print a countdown from 15 to 0 (15, 14, 13, … 0). But the blocks
            have been mixed up and include &lt;b&gt;one extra block&lt;/b&gt; that is not needed in a correct
            solution. Drag the needed blocks from the left and put them in the correct order on the right. Click
            the <em>Check Me</em> button to check your solution.&lt;/p&gt;</p>

    </div>
    <pre class="parsonsblocks" data-question_label="2.3.5" data-numbered="left" style="visibility: hidden;">        public class Test1
    {
    ---
        public static void main(String[] args)
        {
    ---
            for (int i = 15; i &gt;=0; i--)
    ---
            for (int i = 15; i &gt; 0; i--) #paired: This will never reach 0
    ---
                System.out.println(i);
    ---
        }
    ---
    }
            </pre>
</div>
````

#### Exercise using a DAG
````html
<div data-component="parsons" id="simple_dag" class="parsons">
    <div class="parsons_question parsons-text">

    </div>
    <pre class="parsonsblocks" data-question_label="2.3.1.1" data-grader="dag" style="visibility: hidden;">        a = 5 #tag:0; depends:;
    ---
    b = 10 #tag:1; depends:;
    ---
    result = a * b #tag:2; depends: 0,1;
    ---
    print(f"result = {result}") #tag:3; depends: 2;
            </pre>
</div>


#### Prrof blocks using Math (Tex)

<div data-component="parsons" id="test_proof_blocks_1" class="parsons">
    <div class="parsons_question parsons-text">
        <embed>
        <p>Drag and drop <font color="red"><strong>ALL</strong></font> of the blocks below to create a proof
            of the following statement.</p>
        <center>
            <font color="red">If graphs \(G\) and \(H\) are isomorphic and \(G\) is 2-colorable, then \(H\)
                is 2-colorable.</font>
        </center>

    </div>
    <pre class="parsonsblocks" data-question_label="2.3.2.1" data-language="natural" data-grader="dag"
        style="visibility: hidden;">        Assume \(G\) and \(H\) are isomorphic graphs and \(G\) is 2-colorable. #tag:0; depends:;
    ---
    Let \(c:V(G) \to \{red, blue\}\) be a 2-coloring of \(G\). #tag: 1; depends:0;
    ---
    Let \(f\) be an isomorphism \(V(H) \to V(G)\) #tag: 2; depends: 0;
    ---
    Define \(c':V(H) \to \{red, blue\}\) as \(c'(v)=c(f(v))\) #tag:3;depends:1,2;
    ---
    Let \(\langle u - v \rangle\) be an edge in \(H\). (If instead there are no edges in \(H\), then \(H\) is trivially 2-colorable and we are done.) #tag:4;depends:0;
    ---
    \(\langle f(u) - f(v) \rangle\) is an edge in \(G\) #tag:5;depends:4,2;
    ---
    \(c(f(u)) \ne c(f(v))\) #tag:6;depends:5,1;
    ---
    \(c'(u) \ne c'(v)\) #tag:7;depends:6,3;
    ---
    \(c'\) is a 2-coloring of \(H\), so \(H\) is 2-colorable. (end of proof) #tag:8;depends:7;
            </pre>
</div>
````