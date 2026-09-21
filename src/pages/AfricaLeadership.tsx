import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, ExternalLink } from "@/lib/icons";

const leaders = [
["Algeria","President","Abdelmadjid Tebboune"],["Angola","President","João Lourenço"],["Benin","President","Patrice Talon"],["Botswana","President","Duma Boko"],
["Burkina Faso","President","Ibrahim Traoré"],["Burundi","President","Évariste Ndayishimiye"],["Cameroon","President","Paul Biya"],["Cabo Verde","President","José Maria Neves"],
["Central African Republic","President","Faustin-Archange Touadéra"],["Chad","President","Mahamat Idriss Déby Itno"],["Comoros","President","Azali Assoumani"],["Congo","President","Denis Sassou Nguesso"],
["DR Congo","President","Félix Tshisekedi"],["Côte d’Ivoire","President","Alassane Ouattara"],["Djibouti","President","Ismaïl Omar Guelleh"],["Egypt","President","Abdel Fattah el-Sisi"],
["Equatorial Guinea","President","Teodoro Obiang Nguema Mbasogo"],["Eritrea","President","Isaias Afwerki"],["Eswatini","King","Mswati III"],["Ethiopia","Prime Minister","Abiy Ahmed"],
["Gabon","President","Brice Clotaire Oligui Nguema"],["Gambia","President","Adama Barrow"],["Ghana","President","John Dramani Mahama"],["Guinea","President","Mamady Doumbouya"],
["Guinea-Bissau","President","Umaro Sissoco Embaló"],["Kenya","President","William Ruto"],["Lesotho","King","Letsie III"],["Liberia","President","Joseph Boakai"],
["Libya","Prime Minister","Abdul Hamid Dbeibeh"],["Madagascar","President","Andry Rajoelina"],["Malawi","President","Peter Mutharika"],["Mali","President","Assimi Goïta"],
["Mauritania","President","Mohamed Ould Ghazouani"],["Mauritius","President","Dharam Gokhool"],["Morocco","King","Mohammed VI"],["Mozambique","President","Daniel Chapo"],
["Namibia","President","Netumbo Nandi-Ndaitwah"],["Niger","President","Abdourahamane Tchiani"],["Nigeria","President","Bola Tinubu"],["Rwanda","President","Paul Kagame"],
["São Tomé and Príncipe","President","Carlos Vila Nova"],["Senegal","President","Bassirou Diomaye Faye"],["Seychelles","President","Patrick Herminie"],["Sierra Leone","President","Julius Maada Bio"],
["Somalia","President","Hassan Sheikh Mohamud"],["South Africa","President","Cyril Ramaphosa"],["South Sudan","President","Salva Kiir Mayardit"],["Sudan","Chair of Sovereignty Council","Abdel Fattah al-Burhan"],
["Tanzania","President","Samia Suluhu Hassan"],["Togo","President","Jean-Lucien Savi de Tové"],["Tunisia","President","Kaïs Saïed"],["Uganda","President","Yoweri Museveni"],
["Zambia","President","Hakainde Hichilema"],["Zimbabwe","President","Emmerson Mnangagwa"]
] as const;

export default function AfricaLeadership() {
 const [query,setQuery]=useState("");
 const filtered=useMemo(()=>leaders.filter(([country,role,name])=>(country+" "+role+" "+name).toLowerCase().includes(query.toLowerCase())),[query]);
 return <div className="min-h-screen bg-background text-foreground"><Navbar/><main className="mx-auto max-w-7xl px-4 pt-20 pb-20 sm:px-6 lg:px-8">
  <p className="text-sm font-semibold uppercase tracking-wide text-primary">Africa knowledge</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">African heads of state and government</h1>
  <p className="mt-3 max-w-3xl text-muted-foreground">A searchable continental reference. Leadership changes, so entries should be re-verified against official government or African Union sources before use.</p>
  <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-card px-3 max-w-xl"><Search className="h-4 w-4 text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search country or leader" className="h-11 w-full bg-transparent text-sm outline-none"/></div>
  <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{filtered.map(([country,role,name])=><article key={country} className="rounded-xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">{country}</p><h2 className="mt-2 font-semibold">{name}</h2><p className="text-sm text-muted-foreground">{role}</p></article>)}</div>
  <a href="https://au.int/en/member_states/countryprofiles2" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary">Verify with African Union sources <ExternalLink className="h-4 w-4"/></a>
 </main></div>;
}
