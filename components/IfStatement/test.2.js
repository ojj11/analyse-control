if (1) {
  ;
} else {
  ;
}
====
Program:start -> Program:endOfDeclarations
Program:endOfDeclarations -> IfStatement:start
IfStatement:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> BlockStatement:start
Literal:end -> BlockStatement:start
BlockStatement:start -> EmptyStatement:start
EmptyStatement:start -> EmptyStatement:end
EmptyStatement:end -> BlockStatement:end
BlockStatement:end -> IfStatement:end
IfStatement:end -> Program:end
BlockStatement:start -> EmptyStatement:start
EmptyStatement:start -> EmptyStatement:end
EmptyStatement:end -> BlockStatement:end
BlockStatement:end -> IfStatement:end
