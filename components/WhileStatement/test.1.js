while (1) {
  ;
}
====
Program:start -> Program:endOfDeclarations
Program:endOfDeclarations -> WhileStatement:start
WhileStatement:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> BlockStatement:start
Literal:end -> WhileStatement:end
BlockStatement:start -> EmptyStatement:start
EmptyStatement:start -> EmptyStatement:end
EmptyStatement:end -> BlockStatement:end
BlockStatement:end -> Literal:start
WhileStatement:end -> Program:end
