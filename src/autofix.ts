import * as vscode from "vscode";
import { Finding } from "./types";
export function provideSafeFixes(document:vscode.TextDocument, findings:Finding[]):vscode.CodeAction[]{
 const actions:vscode.CodeAction[]=[];
 for(const f of findings){
  const line=Math.max(0,Math.min(document.lineCount-1,f.line-1));
  const text=document.lineAt(line).text;
  if(f.rule==="CONSOLE" && /console\.(log|debug)\s*\(/.test(text)){
   const a=new vscode.CodeAction("SAYANOX: Remove debug logging",vscode.CodeActionKind.QuickFix);
   a.diagnostics=[]; a.isPreferred=true; a.edit=new vscode.WorkspaceEdit();
   a.edit.delete(document.uri,new vscode.Range(new vscode.Position(line,0),new vscode.Position(line+1,0))); actions.push(a);
  }
  if(f.rule==="ANY" && /:\s*any\b/.test(text)){
   const a=new vscode.CodeAction("SAYANOX: Replace any with unknown",vscode.CodeActionKind.QuickFix);
   a.diagnostics=[]; a.edit=new vscode.WorkspaceEdit();
   a.edit.replace(document.uri,new vscode.Range(new vscode.Position(line,0),new vscode.Position(line,text.length)),text.replace(/:\s*any\b/,": unknown")); actions.push(a);
  }
 }
 return actions;
}