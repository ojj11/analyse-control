if (1) {

} else if (2) {
  ;
}
====
Program:start -> Program:endOfDeclarations
Program:endOfDeclarations -> IfStatement:start
IfStatement:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> IfStatement:start
Literal:end -> BlockStatement:start
IfStatement:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> BlockStatement:start
Literal:end -> IfStatement:end
BlockStatement:start -> EmptyStatement:start
EmptyStatement:start -> EmptyStatement:end
EmptyStatement:end -> BlockStatement:end
BlockStatement:end -> IfStatement:end
IfStatement:end -> IfStatement:end
IfStatement:end -> Program:end
BlockStatement:start -> BlockStatement:end
BlockStatement:end -> IfStatement:end
