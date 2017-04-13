if (1);
====
Program:start -> Program:endOfDeclarations
Program:endOfDeclarations -> IfStatement:start
IfStatement:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> EmptyStatement:start
Literal:end -> IfStatement:end
EmptyStatement:start -> EmptyStatement:end
EmptyStatement:end -> IfStatement:end
IfStatement:end -> Program:end
