import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
type RemoteJob=Record<string,unknown>;
const rows:Record<string,unknown>[]=[];
function add(j:RemoteJob,source:string){
 const id=String(j.id??j.jobId??j.url??""); const title=String(j.jobTitle??j.title??""); const company=String(j.companyName??j.company_name??j.company??""); const url=String(j.url??j.jobUrl??"");
 if(!id||!title||!url)return;
 const raw=j.skills??j.jobIndustry??[]; const skills=Array.isArray(raw)?raw.map(String):String(raw).split(",").map(x=>x.trim()).filter(Boolean);
 rows.push({title,opportunity_type:String(j.job_type??j.jobType??"job").toLowerCase().includes("intern")?"internship":"job",company_name:company||null,location:"Remote",remote:true,country_code:null,description:String(j.jobDescription??j.jobExcerpt??j.description??"")||null,skills,skills_required:skills,application_url:url,source,source_id:id,source_name:source==="remotive"?"Remotive":"Jobicy",source_url:url,posted_at:String(j.pubDate??j.publication_date??new Date().toISOString()),is_active:true,status:"active",last_verified_at:new Date().toISOString(),updated_at:new Date().toISOString()});
}
Deno.serve(async()=>{
 const result={jobicy:0,remotive:0,synced:0,error:null as string|null};
 try{
  const a=await fetch("https://jobicy.com/api/v2/remote-jobs?count=50"); if(a.ok){const d=await a.json();for(const j of d.jobs??[])add(j,"jobicy");result.jobicy=d.jobs?.length??0;}
  const b=await fetch("https://remotive.com/api/remote-jobs?limit=50"); if(b.ok){const d=await b.json();for(const j of d.jobs??[])add(j,"remotive");result.remotive=d.jobs?.length??0;}
  const unique=Array.from(new Map(rows.map(x=>[String(x.source)+":"+String(x.source_id),x])).values());
  if(unique.length){const {error}=await supabase.from("opportunities").upsert(unique,{onConflict:"source,source_id"});if(error)throw error;}
  result.synced=unique.length;
 }catch(error){result.error=error instanceof Error?error.message:String(error);}
 return new Response(JSON.stringify(result),{headers:{"content-type":"application/json"}});
});
