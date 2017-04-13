;;
===
Program:start -> Program:endOfDeclarations
Program:endOfDeclarations -> EmptyStatement:start
EmptyStatement:start -> EmptyStatement:end
EmptyStatement:end -> EmptyStatement:start
EmptyStatement:start -> EmptyStatement:end
EmptyStatement:end -> Program:end
