
import { useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Loader2 } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback(){
  const navigate=useNavigate();
  useEffect(function(){
    void (async function(){
      const session=await supabase.auth.getSession();
      const user=session.data.session?.user;
      if(!user){navigate("/auth",{replace:true});return;}
      const profile=await supabase.from("profiles").select("onboarding_complete,account_role").eq("id",user.id).maybeSingle();
      if(profile.data?.onboarding_complete && profile.data.account_role){
        navigate(profile.data.account_role==="startup_founder"?"/portal/founder":"/portal/"+profile.data.account_role,{replace:true});
      } else {
        navigate("/onboarding",{replace:true});
      }
    })();
  },[navigate]);
  return <div className="min-h-dvh grid place-items-center bg-background"><div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary"/><p className="mt-3 text-sm text-muted-foreground">Finishing sign-in…</p></div></div>;
}
