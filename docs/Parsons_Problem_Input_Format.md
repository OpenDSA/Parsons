# Parsons Problem Input Format

First draft by Cliff Shaffer  
With help from:  
Steve Edwards, Barb Ericson, Seth Poulsen, and Kwasi Biritwum-Nyarko  
Last updated: 3/12/2025

[1\. Introduction](#introduction)

[2\. The Problem Preamble](#the-problem-preamble)

[3\. The Blocks Specification](#the-blocks-specification)

[4\. Order-based Grading](#order-based-grading)

[4.1 Simple DAG](#4.1-dag-grading)

[4.2 Simplified Notation](#4.2-simplified-notation)

[4.3 Nested DAGs](#4.3-nested-dags)

[5\. Execution-based Grading](#execution-based-grading)

[5.1 Preamble](#5.1-preamble)

[5.2 Tests](#5.2-tests)

[5.3 Reference Solution](#5.3-reference-solution)

[6\. Open Questions](#open-questions)

[7\. Change Log](#7.-change-log)

[8\. Obsolete Content](#8.-obsolete-content)

[8.1 Explicit DAGs](#8.1-explicit-dags)

## 

1. ## Introduction {#introduction}

The SPLICE Parsons Problem Input Format (PIF) is a slightly augmented version of [PEML](https://cssplice.org/peml/index.html) markup, which in turn derives from [ArchieML](https://archieml.org/). See examples for Parsons problems defined using PIF at: [https://github.com/CSSPLICE/peml-feasibility-examples/tree/main/parsons](https://github.com/CSSPLICE/peml-feasibility-examples/tree/main/parsons).

A note on vocabulary: In this document, the main content of a Parsons problem specification is a collection of *blocks*, which are the individual entities that a student arranges into some order (and possibly must modify in some way). Sometimes, multiple blocks need to be grouped together for some purpose. This is called a *block list*.

The operating assumption is that some Parsons problem implementation will read this file and interpret it as appropriate (or some translator will translate the PIF specification into the appropriate format used by the Parsons problem implementation). Not all Parsons problem implementations will be able to handle all features defined by PIF. Hopefully the system (or translator) will fail gracefully on such files.

The rest of this document contains a description of the major PEML tags that go into defining a Parsons problem. You can see a short list of these at [https://github.com/CSSPLICE/peml-feasibility-examples/blob/main/parsons/parsons-template.peml](https://github.com/CSSPLICE/peml-feasibility-examples/blob/main/parsons/parsons-template.peml).

PEML supports many keys not discussed in this specification. Generally they can be added for information purposes without harm, but PIF translators will typically ignore them.

Comments: Start with \# at the beginning of the line, and must be on lines by themselves.

The body of the problem specification is a series of key: value pairs. Note that PEML requires that all keys start at the beginning of the line (no indentation). PEML does allow indentation for complex value parts that naturally span multiple lines.

A PIF problem specification can be viewed as having three parts:

1. The PIF problem preamble, which consists of largely informational key:value pairs.  
2. The collection of blocks. In addition to specifying the blocks, it collectively embodies a DAG (or recursive DAG of DAGs) when grading is based on block order.  
3. Optionally, the necessary information for compiling and testing the code if the grading is done by execution.

2. ## The Problem Preamble {#the-problem-preamble}

exercise\_id: {Raw text string}  
**Required**. This is meant to be a unique identifier for the exercise within any given implementation system. It does not need to be human readable in any meaningful way. A popular choice is the link to the exercise source (the PIF file) in some repository.

title: {Text in Markdown format}  
**Required**. This should be human readable.

License block: **Required.** It consists of the following three key:value pairs.  
license.id: {A string from the [license keywords used by github](https://help.github.com/en/articles/licensing-a-repository)}  
license.owner.email: {Your email address}  
license.owner.name: {Your name}  
Technically, you can leave this out and most systems will be able to accept the problem specification. But we strongly encourage you to include this because nobody can safely use your exercise unless the file says that they can (and you can always explicitly deny use if you like). Thus, the PIF specification does officially require this.

tags.style: parsons, {order|execute}, \<indent\>  
**Required**. This tag is what lets an exercise system know that this is a Parsons problem (as opposed to, say, a multiple choice question or a coding exercise). There must be (at least) two style values (in no particular order). One is the keyword parsons. The other is either order or execute. order means that the blocks have to be put into some order that satisfies (meaning, is a legal ordering for) a topological sort on a specified DAG. execute means that the exercise is graded by taking the blocks as given by the student, converting them to code, and running them through execution in some programming language. Obviously, which of these you pick will dictate a lot of what comes later in the problem specification. For example, if you pick order, then the DAG must be inferrable from the block information (perhaps using depends tags). If you pick execute, then you must specify the programming language, and some mechanism (often test cases) that will be used for grading the solution. The keyword indent is optional. If included in the list, then the implementation is expected to support allowing students to set blocks to varying indentation levels. This might or might not affect grading. See the discussion on indentation in Section 3\.

tags.topics: {Whatever keywords you want}  
**Optional.** This lets you describe the problem topics.

tags.interface\_layout: {horizontal | vertical}  
**Optional:** Most implementations have an area that contains the initial list of blocks, and an area where blocks are placed to construct the answer. This tag lets the problem author recommend to the system whether those should be placed side-by-side (horizontally) or one above the other (vertically).

instructions:----------  
Put here whatever text that you want students to see preceding the blocks.  
\----------  
**Required**. Uses Git-flavored Markdown input, with LaTeX notation to support math. May use multiple lines. The \---------- line ends the instructions.

numbered: {true|false}  
**Optional:** When this appears and is set to true, it indicates to the implementation that the blocks are intended to be numbered (in their display order).

\[systems\]  
language: \<Your programming language\>  
\[\]  
**Required** for execute-style problems, **optional** for order-based grading. Note that the language key is an element of the \[systems\] array, as indicated here (if language is not being specified, then there is no need to indicate a \[systems\] array if it is not otherwise being used). Whenever the language is specified, the presentation system can use this value to determine formatting and syntax highlighting (which is why the author might choose to define language for an exercise that is graded by block order). Be careful what you put in for the programming language. The string has to be recognizable by the system that implements the problem. This is usually a specific list of possible keywords, and case might matter.

3. ## The Blocks Specification {#the-blocks-specification}

The heart of any Parsons problem is the blocks that the student will manipulate into some order (possibly along with fixed text portions that appear at appropriate places, which are just some special blocks). In PIF, the block list defined as a hashmap on assets.code.blocks containing a (possibly nested) array of blocks along with various descriptors. The general format would be:

assets.code.blocks.\<key\>: \<value\> {Repeat as needed for various keys}  
\[assets.code.blocks.content\]  
{Put your blocks here}  
\[\]

Notice the syntax for PEML arrays:  
\[key-name\]  
{stuff: typically a series of key: value pairs, or possibly sub-arrays}  
\[\]

Each block has a series of key:value pairs, only one of which is required: The display key followed by the block text. Blocks commonly also have an optional blockid tag whose value is a simple alphanumeric string. Generally good practice is that either every block has a blockid tag, or none do (see [Section 4 Order-based Grading](#order-based-grading)).

It is a restriction of the underlying PEML notation syntax that every block start with the same key (nearly always this would either be the blockid if these are used, or display if blockid is not used).

Here is a simple example:

\[assets.code.blocks.content\]  
blockid: one  
display: print('Hello')

blockid: two  
display: print('Parsons')

blockid: three  
display: print('Problems\!')  
\[\]

Following PEML standard notation, any block can be defined to span multiple lines, as delimited by \---------- (or delimited by any other symbol repeated at least three times).

blockid: starter  
display:----------  
public static void Swap(int\[\] arr, int i, int j)  
{  
\----------

**Fixed blocks:** The blockid can take the special keyword fixed. A “fixed” block contains text that appears fixed in the student solution, and cannot be manipulated. This lets the problem developer specify things like framing code around the solution, fixed lines of code within the solution that offset subsections of blocks, or sub-section descriptions for things like proofs. Problem authors should be aware that not all implementations have the ability to support fixed blocks. Here is an example showing how the two lines of starter code for a method could be shown as a fixed block (that presumably comes at the beginning of the blocks list).

blockid: fixed  
display:----------  
public static void Swap(int\[\] arr, int i, int j)  
{  
\----------

In the list of blocks for a problem, some might be fixed and some not fixed. Any that appear in the list between two fixed blocks are meant to appear between those fixed blocks in the solution (but which might be displayed in random order between those fixed blocks). For example:

\[assets.code.blocks.content\]  
blockid: fixed  
display: Fixed Start

blockid: randomg1b1  
display: Random Group 1 Block 1

blockid: randomg1b2  
display: Random Group 1 Block 2

blockid: randomg1b3  
display: Random Group 1 Block 3

blockid: fixed  
display: Fixed Middle

blockid: randomg2b1  
display: Random Group 2 Block 1

blockid: randomg2b2  
display: Random Group 2 Block 2

blockid: randomg1b3  
display: Random Group 2 Block 3

blockid: fixed  
display: Fixed End  
\[\]

In the above example there is a fixed block that displays “Fixed Start”, followed by three blocks that should appear in the solution in some order (they can be displayed in random order to the student), followed by a fixed block that displays “Fixed Middle”, followed by three more blocks that should appear in the solution in some order after the “Fixed Middle” block (they can be displayed in random order to the student), and finally a fixed block that displays “Fixed End”.

The display field is generally text in Git-flavored Markdown format that indicates what is displayed to the student for that block. This means that things like math can easily be added. Note that execute\-style problems should only have display text that is actual code in the associated programming language (or use a code field to replace the displayed text as described below). Here is an example of using math styling in a simple proof exercise.

\[assets.code.blocks.content\]  
blockid: one  
display: Assume $A \\land B \\land C$.

blockid: two  
display: Then $A$ is true.

blockid: three  
display: Then $C$ is true.

blockid: four  
display: Since $A$ and $C$, we know $A \\land C$.  
\[\]

Blocks specifications can be more complicated. For problems that require specific indentation be indicated by the student, the required indentation level can be specified by the indent key. For “pseudo-code” exercises (where the code to be executed for a block is different from the display text for that block), the executable code can be specified by the code field. For any problem with execute grading, any block where the code field is absent uses the display field string for its code. Here is an example that uses indent and code fields in block specifications. Note that in this example, the displayed lines appear to the student as Java code, but the actual executable will be in Python.

\[assets.code.blocks.content\]  
blockid: one  
display: for (int i=0;i\<3;i++) {  
code: for i in range(3):  
indent: 0

blockid: twoindent  
display: System.out.print("I ");  
code: print('I ', end='')  
indent: 1

blockid: three  
display: System.out.print("am ");  
code: print('am ', end='')  
indent: 1

blockid: four  
display: System.out.print("a Java program ");  
code: print('a Java program ', end='')  
indent: 1

blockid: five  
display: }  
code:  
indent: 0  
\[\]

Note that when the grading style is order, then the indent value keyword in the tags.style key/value pair means that the student must indicate a particular indent level for each block, and that this indent level must be specified in the PIF file for each block (as illustrated in the example above). However, when the grading style is execute, then using the indent keyword in the tags.style key/value pair is solely to inform the implementation that the blocks must be indentable by the student (because a language like Python will require proper indentation to execute). In that case, adding the indent key/value pair to the blocks is optional and will be ignored by the grading process (aside from what happens when the code is executed). The indent property is never needed for distractor blocks. If any block has an indent key/value pair, then the indent style key must be set.

**Reusable blocks:** Usually a block can be used only one time in the solution, and a typical implementation will remove it from the source area when the student drags it to the solution area. However, sometimes the author might want to allow a block to be used more than once. For example, there might be a need for three closing braces to indicate completing nested blocks. Instead of providing three such blocks explicitly (with potential confusion about which instance of the same display text is which in the solution), the block can be marked as “reusable”. If the block is indentable, then different uses of the block might have different indent levels. Reusable blocks can only be used with execute grading (because there is no reasonable way to indicate all the constraints required for reusable blocks in order grading). Here is an example:

blockid: MyReusableBlock  
reusable: true  
display: }

**Toggles and text boxes:** Blocks can contain toggle boxes (places where the student has to select one of a fixed number of options) or text boxes (places where the student has to type in code). The toggle or text box is delimited by two instances of a single-character delimiter symbol. The default delimiter symbol is \`, but this can be changed. In the case of a toggle, the individual choices are delimited by a single instance of the delimiter symbol. A textbox is indicated by four instances of the delimiter symbol (like: \`\`\`\`). If there is only one choice given, then it is treated as a textbox with initial code (that presumably needs to be modified by the student). Toggles and textboxes only make sense in the context of the execute grading option.

Examples:

blockid: mytoggle1  
display: if \`\`a\`b\`c\`\` \`\`\<\`\>\`\>=\`\` b

Here, there are two separate toggle boxes. First the student chooses between a, b, and c. Then the student chooses between \<, \>, and \>=. (Assume that the goal is to reach if a \< b).

blockid: mytextbox1  
display: if a \`\`\`\` b

Here, the student has to type something between a and b, with no prompt on the choices. (Again, assume the goal is to reach  if a \< b).

blockid: mybuggyblock  
display: if a \`\`\<\>\`\` b

 Here, the student must replace \<\> with whatever they think is correct. (In this case, if the goal is to reach if a \< b, then they would just edit to get rid of the \> character).

The delimiter symbol can be changed in either of two ways. If the author wants to change it for a particular block, then the optional delimiter tag is added, such as:

blockid: mytoggle1  
delimiter: \\  
display: if \\\\a\\b\\c\\\\ \\\\\<\\\>\\\>=\\\\ b

Alternatively, the author can change the default for the entire problem specification by adding the delimiter definition as a key of the assets.code.blocks object, as follows:

assets.code.blocks.delimiter: \\  
\[assets.code.blocks.content\]  
{Put your blocks here}  
\[\]

**Block lists:** There are a number of reasons why a collection of blocks might need to be grouped together. Grouping blocks can help with specifying restrictions on block order when grading; with indicating distractor blocks; or with controlling block layout in the interface. By default, the full list of blocks is considered a block list. But authors can specify sub-lists of blocks and define appropriate properties. Note that a block defined to be a block list, it does not have a display key.

\[assets.code.blocks.content\]  
blockid: myblocklist  
\[.blocklist\]  
\<subblock1\>

\<subblock2\>  
\[\]

\<the-next-block\>  
\[\]

**Block list layout:** Any block list can use the layout key to specify whether its layout should be horizontal or vertical. Since this can apply to any block list, this means that the implementation system can be prompted to show all blocks horizontally, or only a sublist of blocks. The most typical use case is a single horizontal list of blocks, such as for describing a problem to write a Regular Expression. The syntax for a problem to create a RegEx with an arbitrary number of a’s followed by an arbitrary number of b’s might look like this:

Assets.code.blocks.layout: horizontal  
\[assets.code.blocks.content\]  
blockid: B1  
display: a

blockid: B2  
display: \*

blockid: B3  
display: b

blockid: B4  
display: \*  
\[\]

**Pick-ones (grouped distractors):** A special type of block list has the key value pickone. Only one of the grouped blocks (the first one in the list) should be selected in the final solution. Ideally the exercise implementation system would indicate to students that they should pick exactly one of the grouped blocks.. Here is an example of pick-one blocks. Note that the pickone tag is set to true. 

blockid: mygroup\_name  
depends: whatever  
pickone: true  
picklimit: 1  
\[.blocklist\]  
blockid: one  
display: int temp \= arr\[i\];

blockid: onedistract1  
display: int temp \= arr\[j\];

Blockide: onedistract2  
Display: int temp \= arr\[l\];  
\[\]

The picklimit tag is optional. This indicates the number of distractors that should be displayed (selected at random if there are more distractors than are meant to be displayed).

PIF supports any number of distractors in the pick-one block list. However, exercise authors should recognize that any given implementation might handle this in different ways. Some implementations have no such concept, and so the distractor block(s) might appear anywhere in the randomized blocklist. Other implementations only have the concept of paired distractors (a correct block and a single associated distractor block). In which case, the implementation might choose to ignore additional distractor blocks in the pick-one list.

**Distractor Feedback:** Distractor blocks can have feedback text associated with them, such that if the block appears in the student answer, that text is intended to be displayed in proximity to it when the exercise is evaluated and feedback is presented. Examples:

blockid: pickone1  
pickone: true  
\[.blocklist\]

blockid: one  
display: int temp \= arr\[i\];

blockid: onea  
display: int temp \= arr\[j\];  
feedback: This was the wrong choice.  
\[\]											

blockid: four  
display: int temp \= arr\[j\];  
feedback: This line should not appear in the answer.

**Starter code**: Sometimes the author would like for the blocks to be presented within a framing context, such as a function header at the top, a closing bracket at the bottom, and the moveable blocks in between. This could be implemented with fixed blocks. But as a convenience, this can instead be implemented using PEML standard notation for starter code. It typically looks as follows.

\[assets.code.starter.files\]  
content:----------  
public ArrayList\<Integer\> reverseContents(int\[\] contents) {  
    \_\_\_  
}  
\----------

In this example, \_\_\_ is used to mark where the blocks in the blocks list will appear, with immovable code above and below.

4. ## Order-based Grading {#order-based-grading}

### 4.1 DAG Grading {#4.1-dag-grading}

When the grading specification is “order”, a DAG is **required** to be specified implicitly, typically by the use of depends tags in the various blocks. Any student-submitted solution is expressed to the grader as an order list of some subset of the blocks, and it is accepted as correct if it is a legal topological sort for the DAG.

A depends tag can have an empty value. This indicates that the block is the (or, a) root of the DAG. (Note that a depends tag with an empty value is different from a block with no depends tag. See the next section about simplified notation for when a depends tag can be omitted.)

Consider a simple example that includes a distractor and some choices on the acceptable ordering of the blocks in the student’s solution. In the figure, the strings are block IDs.  
![][image1]

The image on the left shows the relationship in the blocks as specified (arrows point to parents in the DAG, which are blocks that the block explicitly depends on). The version on the right shows the actual DAG to be processed (arrows are reversed). In both versions, block onea is crossed out since it is a distractor, and so does not participate in the DAG. In this example, there are two acceptable solutions since there are two legal topological sorts of the DAG.

* one two three four  
* one three two four

Being a distractor, Block  onea is not part of any solution.

The block definitions specify their relationship within the DAG by specifying their direct dependencies with the depends tag. The example DAG above could be written using the following depends tag values. In the example, a pickone group is used. This is not actually required, these could just be independent blocks with one of them having \-1 as its dependency to indicate that it cannot appear in any solution. The advantage of putting them together as a pickone list is that the implementation interface now has enough information to indicate that only one should be picked if it chooses to provide that information to the student.

\[assets.code.blocks.content\]

blockid: pickone1  
pickone: true  
\[.blocklist\]  
blockid: one  
display: good  
depends:

blockid: onea  
display: not so good  
depends: \-1  
\[\]											

blockid: two  
display: block 2  
depends: one

blockid: three  
display: block 3  
depends: one

blockid: four  
display: block 4  
depends: two, three  
\[\]

### 4.2 Simplified Notation {#4.2-simplified-notation}

The depends tag is optional. If a block does not have a depends tag, then the block is dependent on the preceding block. This allows for a simpler way to present a single-order list of blocks. If the first block on the list has no depends tag, then it is the (or, a) root of the DAG. If the preceding block is a distractor, then that is ignored and the first non-distractor block preceding that is the actual dependency for the block.

Since the blockid tag is optional, a block can only be a depends target for another block if it has a blockid tag, or if the block that immediately follows has no explicit depends tag.

Here is an example of a minimalist set of information for the case when the block ordering is just the blocks as given, with a distractor thrown in.

\[assets.code.blocks.content\]  
display: print('Hello')

display: print('Parsons')

display: print('Oops\!')  
depends: \-1

display: print('Problems\!')  
\[\]

The only acceptable solution for this example would be:

print('Hello')  
print('Parsons')  
print('Problems\!')

### 4.3 Nested DAGs {#4.3-nested-dags}

A simple DAG is not always sufficient for specifying the possible legal orders. Here is a simple example:

if (atest) {  
  doAstuff();  
}  
if (btest) {  
  doBstuff();  
}  
if (ctest) {  
  doCstuff();  
}

In this example, the three cases are independent and can be done in any order, but the code inside the “if” block has to go with the proper “if” test. This can be indicated by using a DAG of DAGs. The sub-DAGs are indicated by using block sublists.

\[assets.code.blocks.content\]  
blockid: testAblock  
depends:  
\[.blocklist\]  
blockid: caseA  
display: if (testA) {  
depends:

blockid: stuffA  
display:----------  
  doAstuff();  
}  
\----------  
depends: caseA  
\[\]

blockid: testBblock  
depends:  
\[.blocklist\]  
blockid: caseB  
display: if (testB) {  
depends:

blockid: stuffB  
display:----------  
  doBstuff();  
}  
\----------  
depends: caseB  
\[\]

blockid: testCblock  
depends:  
\[.blocklist\]  
blockid: caseC  
display: if (testC) {  
depends:

blockid: stuffC  
display:----------  
  doCstuff();  
}  
\----------  
depends: caseC  
\[\]

Note that a block sublist (i.e., a nested DAG) is considered to be a block in all respects (with the exception that it has no display key), especially in terms of how it behaves for the purposes of order-based grading. It generally should have a depends tag to indicate how it should be ordered (if it is missing, then it is assumed to depend on the preceding non-distractor block).

5. ## Execution-based Grading {#execution-based-grading}

### 5.1 Preamble {#5.1-preamble}

When the grading specification is execute, this is how you specify the context of how to place the code built from the student’s blocks, and the test cases or required output.

The programming language to be used for execution must be specified with a language tag within the \[systems\] block (see Section 2).

Sometimes you have “wrapper code” that should be used when executing the solution, but which the student should not see, specified as in this example:

\[assets.code.wrapper.files\]  
content:----------  
public class StringProblem  
{  
   \_\_\_  
}  
\----------  
\[\]

In the example, the last set of dashes signals the end of the content block. The set of underscores inside the brackets signals where the student code will go.

### 5.2 Tests {#5.2-tests}

When the coding exercise is to create a method with specified inputs and outputs, the best way to test is by providing unit tests in the following format.

\[assets.test.files\]  
format: text/csv-unquoted  
pattern\_actual: subject.compressString({{message}})  
content:----------  
message,expected,description  
"""bbbaaccccd""","""b3a2c4d1""",example  
"""abccdeff""","""abccdeff""",example  
"""a""","""a"""  
"""abb""","""abb"""  
"""aaacdddaaa""","""a3c1d3a3"""  
"""aabcbbbb""","""a2b1c1b4"""  
\----------  
\[\]

In this example, it is assumed that the student is told to write a method called compressString that takes a string parameter and returns a string. (This would probably be done either by describing this requirement in the instructions and providing appropriate blocks that allow the student to specify the method signature, or by supplying fixed blocks to define the method signature.) Note the first line after the start of the content block in this example specifies the format of the tests. In this case, message is the input parameter (it was defined in the pattern\_actual value field), expected is a special keyword to indicate the output value, and description is a special keyword that indicates an (optional) parameter that indicates whether the test case is exposed or hidden from the student when the exercise is graded.

TODO: Show what to do when the exercise is not a method with unit tests, but instead the validation is done by checking a single, static value for the output.

### 5.3 Reference Solution {#5.3-reference-solution}

Exercise authors may include an optional section with a reference solution. One reason to provide this is because the implementing system might be able to execute this over the test cases as a way to cross-validate the two.

Following standard PEML format, the reference solution is specified as follows.

TODO: Show PEML format for reference solution.

6. ## Open Questions {#open-questions}

1. What should this be called? I had previously assumed that the community consensus was that the term “Parsons problem” could be applied to any block reordering problem. But not everyone uses the term this way, some limiting it to only coding problems. What term should we use? Stick with Parsons problems? Or call it something else? (If so, the specification should say in appropriate places that this includes Parsons problems as a subset.)  
2. How can we handle blocks with “holes” in them for placing other blocks? There might be constraints on which blocks can fill in the holes, or any available blocks might be fair game. An example use case might be code for the start and the end of a method (which might even be fixed code). This might be handled with two separate blocks, but the interface might want to indicate that they are linked in some way.  
3. As currently written, specific context usage features (things not intrinsic to an exercise definition, but rather that depend on how the exercise is to be used) are deliberately left out of the spec. The idea here is that context would be given to the implementation system as part of system authoring and use of exercises, not as part of the PIF definition. But perhaps this is inconvenient to actual use. An alternative is to put tags into PIF that allow problem authors (or instructors modifying a problem definition for use in a given course) to specify these contextual features. So far, these features have been identified as falling into this category:  
   1. Block numbering  
   2. A fixed order given to all users of the exercise (which ideally is generated randomly, but identically to all users)  
   3. The relative relationship between the drop zone for constructing the solution, and the block pool. They could reasonably be side-by-side, or one above the other.  
   4. First Wrong: (For order-based grading) Indicate to the student the first block recognized by the system to be wrong in some way (that is, it violates the required dependencies).

## 7\. Change Log {#7.-change-log}

1/2/2025: Added support for a “simplified” presentation, by making tag and depends fields optional (with default behavior when they are missing).  
3/12/2025: Ditched the notion of an explicit DAG section.  
4/8/2025: Changed the blocks list to be an array belonging to \[assets.code.blocks\] rather than be part of \[assets.code.starter.files\].  
4/9/2025: Simplify the syntax for block lists and decorator keys; clean up pickone syntax (it is just a blocklist with a pickone: true key)

## 8\. Obsolete Content {#8.-obsolete-content}

OBSOLETE, LEFT FOR NOW UNTIL DETAILS ARE ALL RESOLVED: PIF is agnostic on as many implementation-dependent things as possible, like whether blocks of code are presented in a particular way such as with a mono-spaced font. (Of course, PIF does supply enough information so that an implementation can deduce whether the blocks contain code or not. Note that not all Parsons problems are meant to be coding exercises. For example, they might be math proofs.) PIF is agnostic on how the implementation system handles fixed blocks (these are blocks that are not ones that the student has to select and place, but are fixed in the solution). PIF does not provide a way to dictate that all copies of the problem (to different students) provide the same random ordering, since again this is considered an issue for how the problem is **presented**. Anything that relates to presentation as opposed to intrinsic property should get handled by the authoring system associated with the local system implementation.

### 8.1 Explicit DAGs {#8.1-explicit-dags}

Open Question: Previously, the DAG was defined in a separate section from the block specification. Support is now added to define the DAG implicitly by adding depends fields to the individual blocks. If this is considered clearly superior, we could just drop the support for the explicit version in the \[assets.test.files\] section.

After discussion at the 11th SPLICE Workshop (at SIGCSE 2025), participants agreed to drop the explicit DAG support from PIF.

Basic example:

#### Method 1: Explicit DAG Definition

The tag \[assets.test.files\] is a PEML specification for an array of objects. There is   
only one item for this array: the content. This in turn is a list of blockids, with the blockids for dependency blocks listed. If a given block is a distractor, then its depends tag has the special blockid value \-1.

\[assets.test.files\]  
Content:----------  
\# A series of lines where each line has the format:  
\<blockid\>: \<zero or more comma-separated dependency blockids\>  
\----------  
\[\]

Here is an example:  
\[assets.test.files\]  
content:----------  
one:  
onea: \-1  
two: one  
three: one  
four: two, three  
\----------  
\[\]

Explicit nested DAG example:

\[assets.code.blocks.content\]  
blockid: caseA  
display: if (testA) {

blockid: stuffA  
display:----------  
  doAstuff();  
}  
\----------

blockid: caseB  
display: if (testB) {

blockid: stuffB  
display:----------  
  doBstuff();  
}  
\----------

blockid: caseC  
display: if (testC) {

blockid: stuffC  
display:----------  
  doCstuff();  
}  
\----------  
\[\]

\# Specify the nested DAG.  
\# This defines three sub-dags, all of which have no listed  
\# dependencies (meaning their roots have no prereqs, so they can go  
\# in any order).  
\[assets.test.files\]  
content:----------  
\[DAG\]  
caseA:  
stuffA: caseA  
\[\]  
\[DAG\]  
caseB:  
stuffA: caseB  
\[\]  
\[DAG\]  
caseC:  
stuffA: caseC  
\[\]  
\----------  
\[\]

[image1]: <data:image/png;base64,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>