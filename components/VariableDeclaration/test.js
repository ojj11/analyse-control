var x = 1;
var y = 0;
====
Program:start -> VariableDeclarator:hoistStart
VariableDeclarator:hoistStart -> VariableDeclarator:hoistEnd
VariableDeclarator:hoistEnd -> VariableDeclarator:hoistStart
VariableDeclarator:hoistStart -> VariableDeclarator:hoistEnd
VariableDeclarator:hoistEnd -> Program:endOfDeclarations
Program:endOfDeclarations -> VariableDeclaration:start
VariableDeclaration:start -> VariableDeclarator:start
VariableDeclarator:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> VariableDeclarator:end
VariableDeclarator:end -> VariableDeclaration:end
VariableDeclaration:end -> VariableDeclaration:start
VariableDeclaration:start -> VariableDeclarator:start
VariableDeclarator:start -> Literal:start
Literal:start -> Literal:end
Literal:end -> VariableDeclarator:end
VariableDeclarator:end -> VariableDeclaration:end
VariableDeclaration:end -> Program:end
