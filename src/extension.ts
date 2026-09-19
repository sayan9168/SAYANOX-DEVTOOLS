import * as vscode from "vscode";
import {analyzeSource} from "./analyzer";
import {securityScan} from "./security";
import {askOllama} from "./ollama";
import {Finding,AnalysisResult} from "./types";
import {showDashboard} from "./dashboard";
import {provideSafeFixes} from "./autofix";
let diagnostics:vscode.DiagnosticCollection;
let lastFindings:Finding[]=[];
export function activate(context:vscode.ExtensionContext){
 diagnostics=vscode.languages.createDiagnosticCollection("sayanox");context.subscriptions.push(diagnostics);
 context.subscriptions.push(
  vscode.commands.registerCommand("sayanox.analyzeFile",()=>runScan(false)),
  vscode.commands.registerCommand("sayanox.securityScan",()=>runScan(true)),
  vscode.commands.registerCommand("sayanox.projectHealth",showHealth),
  vscode.commands.registerCommand("sayanox.dashboard",()=>showDashboard(context,lastFindings)),
  vscode.commands.registerCommand("sayanox.askLocalAI",askAI),
  vscode.window.onDidChangeActiveTextEditor(refreshDiagnostics),
  vscode.languages.registerCodeActionsProvider({scheme:"file"}, {provideCodeActions:(doc)=>provideSafeFixes(doc,lastFindings.filter(f=>f.line>0))},{providedCodeActionKinds:[vscode.CodeActionKind.QuickFix]})
 );
 refreshDiagnostics();
}
async function runScan(security:boolean){const e=vscode.window.activeTextEditor;if(!e){vscode.window.showInformationMessage("Open a source file first.");return;}const r=security?securityScan(e.document.fileName,e.document.getText()):analyzeSource(e.document.fileName,e.document.getText());lastFindings=r.findings;applyDiagnostics(e.document,r);vscode.window.showInformationMessage(`SAYANOX ${security?"Security":"Analysis"}: ${r.score}/100 · ${r.findings.length} findings`);}
function applyDiagnostics(doc:vscode.TextDocument,r:AnalysisResult){diagnostics.set(doc.uri,r.findings.map(f=>{const line=Math.max(0,Math.min(doc.lineCount-1,f.line-1));const start=new vscode.Position(line,Math.max(0,(f.column??1)-1));const end=new vscode.Position(line,doc.lineAt(line).text.length);const s=f.severity==="error"?vscode.DiagnosticSeverity.Error:f.severity==="warning"?vscode.DiagnosticSeverity.Warning:vscode.DiagnosticSeverity.Information;const d=new vscode.Diagnostic(new vscode.Range(start,end),`[${f.rule}] ${f.message}`,s);d.source="SAYANOX";d.code=f.rule;return d;}));}
function refreshDiagnostics(){const e=vscode.window.activeTextEditor;if(e){const r=analyzeSource(e.document.fileName,e.document.getText());lastFindings=r.findings;applyDiagnostics(e.document,r);}}
async function askAI(){const c=vscode.workspace.getConfiguration("sayanox.ollama");if(!c.get<boolean>("enabled")){vscode.window.showWarningMessage("Enable sayanox.ollama.enabled first.");return;}const q=await vscode.window.showInputBox({prompt:"Ask the local SAYANOX AI"});if(!q)return;try{const answer=await askOllama(c.get("endpoint","http://127.0.0.1:11434"),c.get("model","gemma:1b"),q+"\n\nCode:\n"+(vscode.window.activeTextEditor?.document.getText().slice(0,12000)??""));const doc=await vscode.workspace.openTextDocument({content:answer,language:"markdown"});await vscode.window.showTextDocument(doc,vscode.ViewColumn.Beside);}catch(err){vscode.window.showErrorMessage("SAYANOX local AI error: "+String(err));}}
async function showHealth(){const files=await vscode.workspace.findFiles("**/*.{ts,tsx,js,jsx,py,go,rs,java,c,cpp,h,hpp}","**/{node_modules,.git,dist,build,out}/**",500);let n=0,e=0,w=0;for(const u of files){const b=await vscode.workspace.fs.readFile(u);const r=analyzeSource(u.fsPath,new TextDecoder().decode(b));n+=r.findings.length;e+=r.findings.filter(x=>x.severity==="error").length;w+=r.findings.filter(x=>x.severity==="warning").length;}vscode.window.showInformationMessage(`SAYANOX Project Health: ${files.length} files · ${n} findings · ${e} errors · ${w} warnings`);}
export function deactivate(){diagnostics?.dispose();}