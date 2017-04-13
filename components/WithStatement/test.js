with(x) {
  // don't use with statements
}
====
Program:start -> Program:endOfDeclarations
Program:endOfDeclarations -> WithStatement:start
WithStatement:start -> Identifier:start
Identifier:start -> Identifier:end
Identifier:end -> BlockStatement:start
BlockStatement:start -> BlockStatement:end
BlockStatement:end -> WithStatement:end
WithStatement:end -> Program:end
