.. parsonsprob:: pa-ex-maxdist
   :language: java
   :adaptive:
   :maxdist: 2

   The following program segment is a method that should return string array
   that is in reverse order -- so {"b", "a", "z"} should return {"z", "a", "b"}.

   But, the blocks have been mixed up and include **two extra blocks** that
   are not needed in a correct solution.
   -----
   public static String[] reverse(String[] arr) {
   =====
       String[] result = new String[arr.length];
   =====
       String[] result = arr; #distractor
   =====
       int i = arr.length - 1;
   =====
       int i = arr.length; #distractor
   =====
       for (String element: arr) {
   =====
       for (element: arr) { #distractor
   =====
         result[i--] = element;
   =====
         result[i] = element; #distractor
   =====
       } // end for loop
   =====
       return result;
   =====
   } // end reverse method