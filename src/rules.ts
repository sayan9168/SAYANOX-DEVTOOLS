import {Finding} from "./types";
export interface Rule{id:string;severity:"info"|"warning"|"error";message:string;suggestion:string;test:(line:string)=>boolean}
export const RULES:Rule[]=[
{id:"TODO",severity:"info",message:"TODO marker found.",suggestion:"Resolve or track this task before release.",test:l=>/\bTODO\b/i.test(l)},
{id:"ANY",severity:"warning",message:"Explicit any reduces type safety.",suggestion:"Prefer a precise type.",test:l=>/:\s*any\b/.test(l)},
{id:"EVAL",severity:"error",message:"eval() can execute untrusted code.",suggestion:"Use safe parsing.",test:l=>/\beval\s*\(/.test(l)},
{id:"INNERHTML",severity:"error",message:"Direct innerHTML assignment may enable XSS.",suggestion:"Prefer textContent or trusted sanitization.",test:l=>/\.innerHTML\s*=/.test(l)},
{id:"CONSOLE",severity:"info",message:"Debug logging detected.",suggestion:"Remove or gate debug logging.",test:l=>/\bconsole\.(log|debug)\s*\(/.test(l)}
];
export function scanRules(source:string):Finding[]{const out:Finding[]=[];source.split(/\r?\n/).forEach((line,i)=>RULES.forEach(r=>{const m=line.match(new RegExp(r.test.source));if(m)out.push({rule:r.id,message:r.message,suggestion:r.suggestion,severity:r.severity,line:i+1,column:(m.index??0)+1})}));return out}