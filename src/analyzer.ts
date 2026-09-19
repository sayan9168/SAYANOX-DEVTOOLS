import * as path from "node:path";
import { AnalysisResult, Finding } from "./types";
const rules = [
  { id:"TODO", re:/\bTODO\b/i, message:"TODO marker found.", suggestion:"Resolve or track this task before release.", severity:"info" as const },
  { id:"ANY", re:/:\s*any\b/, message:"Explicit any reduces type safety.", suggestion:"Prefer a precise type.", severity:"warning" as const },
  { id:"EVAL", re:/\beval\s*\(/, message:"eval() can execute untrusted code.", suggestion:"Use safe parsing.", severity:"error" as const },
  { id:"INNERHTML", re:/\.innerHTML\s*=/, message:"Direct innerHTML assignment may enable XSS.", suggestion:"Prefer textContent or trusted sanitization.", severity:"error" as const },
  { id:"CONSOLE", re:/\bconsole\.(log|debug)\s*\(/, message:"Debug logging detected.", suggestion:"Remove or gate debug logging.", severity:"info" as const }
];
export function analyzeSource(fileName:string, source:string):AnalysisResult {
  const findings:Finding[]=[];
  source.split(/\r?\n/).forEach((line,index)=>{
    for(const rule of rules){ const m=line.match(rule.re); if(m) findings.push({rule:rule.id,message:rule.message,suggestion:rule.suggestion,severity:rule.severity,line:index+1,column:(m.index??0)+1}); }
  });
  const errors=findings.filter(f=>f.severity==="error").length;
  const warnings=findings.filter(f=>f.severity==="warning").length;
  return {file:path.basename(fileName),findings,score:Math.max(0,100-errors*20-warnings*8-findings.filter(f=>f.severity==="info").length*2)};
}