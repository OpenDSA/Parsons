.. parsonspro:: java_countdown_paired2
   :numbered: left

   The following program segment should print a countdown from 15 to 0 (15, 14, 13, ... 0).  But the blocks have been mixed up and include <b>one extra block</b> that is not needed in a correct solution.  Drag the needed blocks from the left and put them in the correct order on the right.  Click the *Check Me* button to check your solution.</p>
   -----
   public class Test1
   {
   =====
       public static void main(String[] args)
       {
   =====
           for (int i = 15; i >=0; i--)
   =====
           for (int i = 15; i > 0; i--) #paired: This will never reach 0
   =====
               System.out.println(i);
   =====
       }
   =====
   }