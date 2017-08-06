Analyse-Control
===============

**Extract the control flow graph from a script.**
Control flow refers to what order a set of instructions execute in. By using
conditional statements and loops, the order of a set of instructions can be
changed. This library extracts all possible execution flows through a script as
a graph of nodes.

<!-- Limitations
-----------

 - Because of exceptions, functions with side-effects will be modeled such that
   any variables closed over will capture both states, given that the exception
   can be caught and the function re-run. IE in the given function:

   ```javascript
   var x = 1;
   function abc(input) {
     x = "unset";
     x = input.value;
     x = 1;
     return x;
   }
   ```

   An engineer might be led to believe that `x` will always be a number,
   however, given an input of:

   ```javascript
   var input = {};
   Object.define(input, "value", {
     getter: function() {
       throw new Error("why would you program anything like this?");
     }
   })
   abc(input);
   ```

   We can see that `x` can actually end up being a string or a number -->
