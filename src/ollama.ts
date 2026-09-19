export async function askOllama(endpoint:string,model:string,prompt:string):Promise<string>{
 const response=await fetch(endpoint.replace(/\/$/,"")+"/api/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({model,prompt,stream:false})});
 if(!response.ok)throw new Error("Ollama request failed: "+response.status);
 const data=await response.json() as {response?:string}; return data.response??"No response returned by the local model.";
}