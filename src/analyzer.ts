import * as path from "node:path";
import {AnalysisResult,Finding} from "./types";
const rules:Array<{id:string;re:RegExp;message:string;suggestion:string;severity:"info"|"warning"|"error"}>=[
{id:"TODO",re:/\bTODO\b/i,message:"TODO marker found.",suggestion:"Resolve or track this task before release.",severity:"info"},
{id:"ANY",re/:\s*any\b/,message:"Explicit any reduces type safety.",suggestion:"Prefer a precise TypeScript type.",severity:"warning"},
{id:"EVAL",re:/\beval\s*\(/,message:"eval() can execute untrusted code.",suggestion:"Use explicit parsing or a safe evaluator.",severity:"error"},
{id:"INNERHTML",re:/\.innerHTML\s*=/,message:"Direct innerHTML assignment can create XSS risk.",suggestion:"Prefer textContent or sanitized DOM APIs.",severity:"error"},
{id:"CONSOLE",re:/\bconsole\.(log|debug)\s*\(/,message:"Debug logging detected.",suggestion:"Remove or gate debug logs for production.",severity:"info"}];
export function analyzeSource(fileName:string,source:string):AnalysisResult{
 const findings:Finding[]=[];
 source.split(/\r?\n/).forEach((line,index)=>{for(const rule of rules){const m=line.match(rule.re);if(m)findings.push({rule:rule.id,message:rule.message,suggestion:rule.suggestion,severity:rule.severity,line:index+1,column:(m.index??0)+1});}});
 const e=findings.filter(f=>f.severity==="error").length,w=findings.filter(f=>f.severity==="warning").length;
 return {file:path.basename(fileName),findings,score:Math.max(0,100-e*20-w*8-findings.filter(f=>f.severity==="info").length*2)};
}