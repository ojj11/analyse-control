if (1) {
}
====
Program:start -> Program:endOfDeclarations
Program:endOfDeclarations -> IfStatement:start
IfStatement:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> BlockStatement:start
Literal:end -> IfStatement:end
BlockStatement:start -> BlockStatement:end
BlockStatement:end -> IfStatement:end
IfStatement:end -> Program:end
