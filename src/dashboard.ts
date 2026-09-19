import * as vscode from "vscode";
import {Finding} from "./types";
export function showDashboard(context:vscode.ExtensionContext,findings:Finding[]){
 const panel=vscode.window.createWebviewPanel("sayanoxDashboard","SAYANOX Dashboard",vscode.ViewColumn.One,{enableScripts:true});
 const counts={error:findings.filter(f=>f.severity==="error").length,warning:findings.filter(f=>f.severity==="warning").length,info:findings.filter(f=>f.severity==="info").length};
 const rows=findings.map(f=>`<tr><td>${esc(f.rule)}</td><td>${esc(f.severity)}</td><td>${f.line}</td><td>${esc(f.message)}</td><td>${esc(f.suggestion??"")}</td></tr>`).join("");
 panel.webview.html=`<!doctype html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui;padding:24px} .grid{display:flex;gap:12px}.card{padding:18px;border:1px solid #444;border-radius:12px;min-width:110px}table{width:100%;margin-top:24px;border-collapse:collapse}td,th{padding:9px;border-bottom:1px solid #444;text-align:left}</style></head><body><h1>SAYANOX DevTools</h1><div class="grid"><div class="card">Errors<br><b>${counts.error}</b></div><div class="card">Warnings<br><b>${counts.warning}</b></div><div class="card">Info<br><b>${counts.info}</b></div></div><table><thead><tr><th>Rule</th><th>Severity</th><th>Line</th><th>Finding</th><th>Suggestion</th></tr></thead><tbody>${rows||"<tr><td colspan=5>No findings</td></tr>"}</tbody></table></body></html>`;
}
function esc(s:string){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}