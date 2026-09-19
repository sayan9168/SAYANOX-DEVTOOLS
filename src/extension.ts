import * as vscode from "vscode";
import {analyzeSource} from "./analyzer";
import {securityScan} from "./security";
import {askOllama} from "./ollama";
import {Finding,AnalysisResult} from "./types";
let diagnostics:vscode.DiagnosticCollection;
export function activate(context:vscode.ExtensionContext){
 diagnostics=vscode.languages.createDiagnosticCollection("sayanox");context.subscriptions.push(diagnostics);
 context.subscriptions.push(
  vscode.commands.registerCommand("sayanox.analyzeFile",()=>runScan(false)),
  vscode.commands.registerCommand("sayanox.securityScan",()=>runScan(true)),
  vscode.commands.registerCommand("sayanox.projectHealth",showHealth),
  vscode.commands.registerCommand("sayanox.askLocalAI",askAI),
  vscode.window.onDidChangeActiveTextEditor(refreshDiagnostics));
 refreshDiagnostics();
}
async function runScan(security:boolean){
 const editor=vscode.window.activeTextEditor;if(!editor){vscode.window.showInformationMessage("Open a source file first.");return;}
 const result=security?securityScan(editor.document.fileName,editor.document.getText()):analyzeSource(editor.document.fileName,editor.document.getText());
 applyDiagnostics(editor.document,result);const e=result.findings.filter(f=>f.severity==="error").length,w=result.findings.filter(f=>f.severity==="warning").length;
 vscode.window.showInformationMessage(`SAYANOX ${security?"Security":"Analysis"}: ${result.score}/100 · ${e} errors · ${w} warnings`);
}
function applyDiagnostics(doc:vscode.TextDocument,result:AnalysisResult){
 const items=result.findings.map((f:Finding)=>{const line=Math.max(0,Math.min(doc.lineCount-1,f.line-1));const start=new vscode.Position(line,Math.max(0,(f.column??1)-1));const end=new vscode.Position(line,doc.lineAt(line).text.length);
 const sev=f.severity==="error"?vscode.DiagnosticSeverity.Error:f.severity==="warning"?vscode.DiagnosticSeverity.Warning:vscode.DiagnosticSeverity.Information;
 const d=new vscode.Diagnostic(new vscode.Range(start,end),`[${f.rule}] ${f.message}`,sev);d.source="SAYANOX";d.code=f.rule;return d;});diagnostics.set(doc.uri,items);
}
function refreshDiagnostics(){const e=vscode.window.activeTextEditor;if(e)applyDiagnostics(e.document,analyzeSource(e.document.fileName,e.document.getText()));}
async function askAI(){
 const c=vscode.workspace.getConfiguration("sayanox.ollama");if(!c.get<boolean>("enabled")){vscode.window.showWarningMessage("Enable sayanox.ollama.enabled first.");return;}
 const question=await vscode.window.showInputBox({prompt:"Ask the local SAYANOX AI"});if(!question)return;
 const code=vscode.window.activeTextEditor?.document.getText().slice(0,12000)??"No file is open.";
 try{const answer=await askOllama(c.get<string>("endpoint","http://127.0.0.1:11434"),c.get<string>("model","gemma:1b"),question+"\n\nCode context:\n"+code);
 const doc=await vscode.workspace.openTextDocument({content:answer,language:"markdown"});await vscode.window.showTextDocument(doc,vscode.ViewColumn.Beside);}
 catch(error){vscode.window.showErrorMessage("SAYANOX local AI error: "+String(error));}
}
async function showHealth(){
 const files=await vscode.workspace.findFiles("**/*.{ts,tsx,js,jsx,py,go,rs,java,c,cpp,h,hpp}","**/{node_modules,.git,dist,build,out}/**",500);
 let findings=0,errors=0,warnings=0;for(const uri of files){const data=await vscode.workspace.fs.readFile(uri);const r=analyzeSource(uri.fsPath,new TextDecoder().decode(data));findings+=r.findings.length;errors+=r.findings.filter(f=>f.severity==="error").length;warnings+=r.findings.filter(f=>f.severity==="warning").length;}
 vscode.window.showInformationMessage(`SAYANOX Project Health: ${files.length} files · ${findings} findings · ${errors} errors · ${warnings} warnings`);
}
export function deactivate(){diagnostics?.dispose();}