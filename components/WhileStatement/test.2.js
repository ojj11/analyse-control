while (1);
====
Program:start -> Program:endOfDeclarations
Program:endOfDeclarations -> WhileStatement:start
WhileStatement:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> EmptyStatement:start
Literal:end -> WhileStatement:end
EmptyStatement:start -> EmptyStatement:end
EmptyStatement:end -> Literal:start
WhileStatement:end -> Program:end
