.. parsonsprob:: par_ex_group1

   Construct a function that returns the max value from a list.
   -----
   def findmax(alist):
       if len(alist) == 0:
           return None
       curmax = alist[0]
       for item in alist:
           if item > curmax:
               curmax = item
       return curmax