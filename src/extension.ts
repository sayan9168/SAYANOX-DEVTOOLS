import * as vscode from "vscode";
import { analyzeSource } from "./analyzer";
import { securityScan } from "./security";
import { askOllama } from "./ollama";
import { Finding } from "./types";

let diagnostics:vscode.DiagnosticCollection;

export function activate(context:vscode.ExtensionContext){
  diagnostics=vscode.languages.createDiagnosticCollection("sayanox");
  context.subscriptions.push(diagnostics);

  const analyze=vscode.commands.registerCommand("sayanox.analyzeFile",()=>analyzeCurrentFile(false));
  const security=vscode.commands.registerCommand("sayanox.securityScan",()=>analyzeCurrentFile(true));
  const health=vscode.commands.registerCommand("sayanox.projectHealth",()=>showHealth());
  const ai=vscode.commands.registerCommand("sayanox.askLocalAI",()=>askAI());
  context.subscriptions.push(analyze,security,health,ai);

  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(()=>refreshDiagnostics()));
  refreshDiagnostics();
}

async function analyzeCurrentFile(security:boolean){
  const editor=vscode.window.activeTextEditor;
  if(!editor){vscode.window.showInformationMessage("SAYANOX: Open a source file first.");return;}
  const result=security?securityScan(editor.document.fileName,editor.document.getText()):analyzeSource(editor.document.fileName,editor.document.getText());
  applyDiagnostics(editor.document,result.findings);
  const errors=result.findings.filter(f=>f.severity==="error").length;
  const warnings=result.findings.filter(f=>f.severity==="warning").length;
  vscode.window.showInformationMessage(`SAYANOX ${security?"Security":"Analysis"}: score ${result.score}/100 · ${errors} errors · ${warnings} warnings`);
}

function applyDiagnostics(document:vscode.TextDocument,findings:Finding[]){
  const items=findings.map(f=>{
    const line=Math.max(0,Math.min(document.lineCount-1,f.line-1));
    const start=new vscode.Position(line,Math.max(0,(f.column??1)-1));
    const end=new vscode.Position(line,document.lineAt(line).text.length);
    const severity=f.severity==="error"?vscode.DiagnosticSeverity.Error:f.severity==="warning"?vscode.DiagnosticSeverity.Warning:vscode.DiagnosticSeverity.Information;
    const d=new vscode.Diagnostic(new vscode.Range(start,end),`[${f.rule}] ${f.message}`,severity);
    d.source="SAYANOX";
    d.code=f.rule;
    d.relatedInformation=f.suggestion?[new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri,new vscode.Range(start,end)),f.suggestion)]:undefined;
    return d;
  });
  diagnostics.set(document.uri,items);
}

function refreshDiagnostics(){
  const editor=vscode.window.activeTextEditor;
  if(editor) applyDiagnostics(editor.document,analyzeSource(editor.document.fileName,editor.document.getText()).findings);
}

async function askAI(){
  const config=vscode.workspace.getConfiguration("sayanox.ollama");
  if(!config.get<boolean>("enabled")){vscode.window.showWarningMessage("Enable sayanox.ollama.enabled in Settings first.");return;}
  const editor=vscode.window.activeTextEditor;
  const prompt=await vscode.window.showInputBox({prompt:"Ask the local SAYANOX AI",placeHolder:"Explain or improve this code..."});
  if(!prompt)return;
  const context=editor?.document.getText().slice(0,12000)??"No file is open.";
  try{
    const answer=await askOllama(config.get<string>("endpoint","http://127.0.0.1:11434"),config.get<string>("model","gemma:1b"),prompt+"\\n\\nCode context:\\n"+context);
    const doc=await vscode.workspace.openTextDocument({content:answer,language:"markdown"});
    await vscode.window.showTextDocument(doc,vscode.ViewColumn.Beside);
  }catch(error){
    vscode.window.showErrorMessage("SAYANOX local AI error: "+String(error));
  }
}

async function showHealth(){
  const files=await vscode.workspace.findFiles("**/*.{ts,tsx,js,jsx,py,go,rs,java,c,cpp,h,hpp}","**/{node_modules,.git,dist,build,out}/**",500);
  let total=0,errors=0,warnings=0;
  for(const uri of files){
    const text=await vscode.workspace.fs.readFile(uri);
    const result=analyzeSource(uri.fsPath,new TextDecoder().decode(text));
    total+=result.findings.length;
    errors+=result.findings.filter(f=>f.severity==="error").length;
    warnings+=result.findings.filter(f=>f.severity==="warning").length;
  }
  vscode.window.showInformationMessage(`SAYANOX Project Health: scanned ${files.length} files · ${total} findings · ${errors} errors · ${warnings} warnings`);
}

export function deactivate(){diagnostics?.dispose();}
