import {AnalysisResult,Finding} from "./types";
const rules:Array<{id:string;re:RegExp;message:string;suggestion:string}>= [
{id:"SECRET-AWS",re:/AKIA[0-9A-Z]{16}/,message:"Possible AWS access key detected.",suggestion:"Remove the secret and rotate the credential."},
{id:"SECRET-PRIVATE-KEY",re:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,message:"Private key material detected.",suggestion:"Remove and revoke the key."},
{id:"SECRET-GENERIC",re:/(password|passwd|api[_-]?key|secret)\s*[:=]\s*["'][^"']{8,}["']/i,message:"Possible hard-coded secret detected.",suggestion:"Use a secure secret store or environment variable."},
{id:"COMMAND-INJECTION",re:/child_process|execSync\s*\(|exec\s*\(/,message:"Process execution API detected; review input handling.",suggestion:"Validate inputs and avoid unsafe shell interpolation."},
{id:"SQL-CONCAT",re:/(SELECT|INSERT|UPDATE|DELETE).*\+.*(FROM|INTO|SET|WHERE)/i,message:"Possible SQL string concatenation detected.",suggestion:"Use parameterized queries."}];
export function securityScan(fileName:string,source:string):AnalysisResult{
 const findings:Finding[]=[];
 source.split(/\r?\n/).forEach((line,index)=>{for(const rule of rules){const m=line.match(rule.re);if(m)findings.push({rule:rule.id,message:rule.message,suggestion:rule.suggestion,severity:"error",line:index+1,column:(m.index??0)+1});}});
 return {file:fileName,findings,score:Math.max(0,100-findings.length*25)};
}