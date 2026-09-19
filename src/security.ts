import { AnalysisResult, Finding } from "./types";

const securityRules:Array<{id:string; re:RegExp; message:string; suggestion:string}>=[
  {id:"SECRET-AWS",re:/AKIA[0-9A-Z]{16}/,message:"Possible AWS access key detected.",suggestion:"Remove secrets from source and rotate the credential."},
  {id:"SECRET-PRIVATE-KEY",re:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,message:"Private key material detected.",suggestion:"Remove the key and rotate/revoke it immediately."},
  {id:"SECRET-GENERIC",re:/(password|passwd|api[_-]?key|secret)\\s*[:=]\\s*["'][^"']{8,}["']/i,message:"Possible hard-coded secret detected.",suggestion:"Move credentials to a secure environment or secret store."},
  {id:"COMMAND-INJECTION",re:/child_process|execSync\\s*\\(|exec\\s*\\(/,message:"Process execution API detected; review input handling.",suggestion:"Use allowlists and avoid passing untrusted input to shells."},
  {id:"SQL-CONCAT",re:/SELECT .*\\+|INSERT .*\\+|UPDATE .*\\+/i,message:"Possible SQL string concatenation detected.",suggestion:"Use parameterized queries."}
];

export function securityScan(fileName:string,source:string):AnalysisResult{
  const findings:Finding[]=[];
  source.split(/\\r?\\n/).forEach((line,index)=>{
    for(const rule of securityRules){
      const match=line.match(rule.re);
      if(match) findings.push({rule:rule.id,message:rule.message,suggestion:rule.suggestion,severity:"error",line:index+1,column:(match.index??0)+1});
    }
  });
  return {file:fileName,findings,score:Math.max(0,100-findings.length*25)};
}
