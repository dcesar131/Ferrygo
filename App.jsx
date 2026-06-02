import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PAYPAL CONFIGURATION — replace these values to go live
// ─────────────────────────────────────────────────────────────────────────────
const PAYPAL_CONFIG = {
  CLIENT_ID: "YOUR_PAYPAL_CLIENT_ID_HERE",         // from developer.paypal.com
  PLATFORM_MERCHANT_ID: "ALEXANDRAS_MERCHANT_ID",  // Alexandra's PayPal Merchant ID
  ENVIRONMENT: "sandbox",                           // "sandbox" or "production"
  PLATFORM_FEE_PCT: 0.08,                          // 8% → Alexandra's account
  PAYPAL_FEE_PCT: 0.0349,                          // PayPal's ~3.49% + $0.49
  PAYPAL_FEE_FIXED: 0.49,
  CURRENCY: "USD",
};

const PORTS = {
  DR: ["Santo Domingo","Puerto Plata","Monte Cristi","Pedernales"],
  Haiti: ["Cap-Haïtien","Port-de-Paix","Fort-Liberté","Gonaïves","Saint-Marc","Port-au-Prince","Miragoâne","Jacmel","Les Cayes","Jérémie"],
  Islands: ["Île de la Tortue","Île de la Gonâve","Île-à-Vâche"],
};

const INTERNATIONAL_ROUTES = [
  {id:1,from:"Monte Cristi",to:"Port-de-Paix",duration:"1h 15min",price:45,distance:"42 nm",type:"international",popular:true},
  {id:2,from:"Puerto Plata",to:"Cap-Haïtien",duration:"2h 30min",price:65,distance:"87 nm",type:"international",popular:true},
  {id:3,from:"Santo Domingo",to:"Port-au-Prince",duration:"5h 00min",price:95,distance:"160 nm",type:"international",popular:false},
  {id:4,from:"Pedernales",to:"Les Cayes",duration:"1h 45min",price:50,distance:"58 nm",type:"international",popular:false},
  {id:5,from:"Santo Domingo",to:"Jacmel",duration:"4h 30min",price:85,distance:"142 nm",type:"international",popular:false},
  {id:6,from:"Monte Cristi",to:"Cap-Haïtien",duration:"3h 00min",price:70,distance:"98 nm",type:"international",popular:false},
  {id:7,from:"Puerto Plata",to:"Port-de-Paix",duration:"2h 00min",price:55,distance:"71 nm",type:"international",popular:false},
  {id:8,from:"Cap-Haïtien",to:"Puerto Plata",duration:"2h 30min",price:65,distance:"87 nm",type:"international",popular:true},
  {id:9,from:"Port-de-Paix",to:"Monte Cristi",duration:"1h 15min",price:45,distance:"42 nm",type:"international",popular:false},
  {id:10,from:"Port-au-Prince",to:"Santo Domingo",duration:"5h 00min",price:95,distance:"160 nm",type:"international",popular:false},
  {id:11,from:"Les Cayes",to:"Pedernales",duration:"1h 45min",price:50,distance:"58 nm",type:"international",popular:false},
  {id:12,from:"Gonaïves",to:"Puerto Plata",duration:"3h 30min",price:75,distance:"115 nm",type:"international",popular:false},
];

const DOMESTIC_ROUTES = [
  {id:101,from:"Cap-Haïtien",to:"Port-de-Paix",duration:"1h 30min",price:12,distance:"48 nm",type:"domestic",popular:true},
  {id:102,from:"Cap-Haïtien",to:"Fort-Liberté",duration:"45min",price:8,distance:"25 nm",type:"domestic",popular:false},
  {id:103,from:"Port-de-Paix",to:"Île de la Tortue",duration:"30min",price:6,distance:"9 nm",type:"domestic",popular:true},
  {id:104,from:"Cap-Haïtien",to:"Gonaïves",duration:"2h 30min",price:18,distance:"80 nm",type:"domestic",popular:false},
  {id:105,from:"Port-de-Paix",to:"Cap-Haïtien",duration:"1h 30min",price:12,distance:"48 nm",type:"domestic",popular:false},
  {id:106,from:"Fort-Liberté",to:"Cap-Haïtien",duration:"45min",price:8,distance:"25 nm",type:"domestic",popular:false},
  {id:107,from:"Port-au-Prince",to:"Île de la Gonâve",duration:"1h 15min",price:10,distance:"35 nm",type:"domestic",popular:true},
  {id:108,from:"Port-au-Prince",to:"Saint-Marc",duration:"2h 00min",price:15,distance:"65 nm",type:"domestic",popular:false},
  {id:109,from:"Port-au-Prince",to:"Gonaïves",duration:"3h 30min",price:22,distance:"110 nm",type:"domestic",popular:false},
  {id:110,from:"Saint-Marc",to:"Gonaïves",duration:"1h 30min",price:10,distance:"45 nm",type:"domestic",popular:false},
  {id:111,from:"Port-au-Prince",to:"Miragoâne",duration:"1h 45min",price:14,distance:"55 nm",type:"domestic",popular:false},
  {id:112,from:"Gonaïves",to:"Port-au-Prince",duration:"3h 30min",price:22,distance:"110 nm",type:"domestic",popular:false},
  {id:113,from:"Port-au-Prince",to:"Jacmel",duration:"1h 30min",price:15,distance:"48 nm",type:"domestic",popular:true},
  {id:114,from:"Port-au-Prince",to:"Les Cayes",duration:"3h 00min",price:20,distance:"95 nm",type:"domestic",popular:false},
  {id:115,from:"Les Cayes",to:"Île-à-Vâche",duration:"30min",price:5,distance:"12 nm",type:"domestic",popular:true},
  {id:116,from:"Les Cayes",to:"Jérémie",duration:"2h 00min",price:16,distance:"62 nm",type:"domestic",popular:false},
  {id:117,from:"Jacmel",to:"Les Cayes",duration:"2h 15min",price:18,distance:"70 nm",type:"domestic",popular:false},
  {id:118,from:"Miragoâne",to:"Les Cayes",duration:"2h 00min",price:16,distance:"62 nm",type:"domestic",popular:false},
  {id:119,from:"Jérémie",to:"Port-au-Prince",duration:"3h 30min",price:22,distance:"108 nm",type:"domestic",popular:false},
  {id:120,from:"Jacmel",to:"Port-au-Prince",duration:"1h 30min",price:15,distance:"48 nm",type:"domestic",popular:false},
  {id:121,from:"Île-à-Vâche",to:"Les Cayes",duration:"30min",price:5,distance:"12 nm",type:"domestic",popular:false},
  {id:122,from:"Île de la Gonâve",to:"Port-au-Prince",duration:"1h 15min",price:10,distance:"35 nm",type:"domestic",popular:false},
  {id:123,from:"Île de la Tortue",to:"Port-de-Paix",duration:"30min",price:6,distance:"9 nm",type:"domestic",popular:false},
];

const ALL_ROUTES=[...INTERNATIONAL_ROUTES,...DOMESTIC_ROUTES];
const DEPARTURES=["05:00","06:30","08:00","09:30","11:00","13:00","15:00","17:00","19:00"];
const TODAY=new Date().toISOString().split("T")[0];

function genRef(){return "HTF-"+Math.random().toString(36).substring(2,8).toUpperCase();}
function genId(){return Math.random().toString(36).substring(2,10);}
function priceFor(type,base){return type==="child"?Math.round(base*0.5):type==="senior"?Math.round(base*0.75):base;}
function f2(n){return Number(n).toFixed(2);}
function isDR(p){return PORTS.DR.includes(p);}
function isIsland(p){return PORTS.Islands.includes(p);}
function pColor(p){
  if(isDR(p))return{bg:"rgba(60,160,255,0.14)",color:"#70c0ff",border:"rgba(60,160,255,0.3)"};
  if(isIsland(p))return{bg:"rgba(255,200,60,0.14)",color:"#ffc850",border:"rgba(255,200,60,0.3)"};
  return{bg:"rgba(255,100,60,0.14)",color:"#ff9070",border:"rgba(255,100,60,0.3)"};
}
function pFlag(p){return isDR(p)?"🇩🇴":isIsland(p)?"🏝️":"🇭🇹";}

// ─── PayPal Button Component ────────────────────────────────────────────────
function PayPalBtn({amount,travelers,route,onSuccess,onError}){
  const ref=useRef(null);
  const [ready,setReady]=useState(false);
  const [err,setErr]=useState(null);
  const isDemo=PAYPAL_CONFIG.CLIENT_ID==="YOUR_PAYPAL_CLIENT_ID_HERE";

  useEffect(()=>{
    if(isDemo){setReady(true);return;}
    if(document.getElementById("pp-sdk")){setReady(true);return;}
    const s=document.createElement("script");
    s.id="pp-sdk";
    s.src=`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.CLIENT_ID}&currency=USD&intent=capture`;
    s.onload=()=>setReady(true);
    s.onerror=()=>setErr("Failed to load PayPal SDK. Check your Client ID.");
    document.body.appendChild(s);
  },[]);

  useEffect(()=>{
    if(!ready||isDemo||!ref.current||!window.paypal)return;
    ref.current.innerHTML="";
    window.paypal.Buttons({
      style:{layout:"vertical",color:"gold",shape:"rect",label:"pay",height:46},
      createOrder:(data,actions)=>actions.order.create({
        purchase_units:[{
          amount:{currency_code:"USD",value:f2(amount)},
          description:`HaitiVoyage: ${route.from} → ${route.to}`,
          // Platform fee split — requires PayPal Commerce Platform approval
          payment_instruction:{
            disbursement_mode:"INSTANT",
            platform_fees:[{
              amount:{currency_code:"USD",value:f2(amount*PAYPAL_CONFIG.PLATFORM_FEE_PCT)},
              payee:{merchant_id:PAYPAL_CONFIG.PLATFORM_MERCHANT_ID},
            }],
          },
        }],
        application_context:{brand_name:"HaitiVoyage",shipping_preference:"NO_SHIPPING",user_action:"PAY_NOW"},
      }),
      onApprove:async(data,actions)=>{
        const order=await actions.order.capture();
        onSuccess({orderId:order.id,status:order.status,payer:order.payer});
      },
      onError:()=>onError("payment_failed"),
      onCancel:()=>onError("cancelled"),
    }).render(ref.current);
  },[ready]);

  if(err) return <div style={{color:"#ff8080",fontSize:12,padding:12,background:"rgba(255,80,80,0.08)",borderRadius:8}}>{err}</div>;

  if(isDemo) return (
    <div>
      <div style={{background:"rgba(255,196,57,0.07)",border:"1px solid rgba(255,196,57,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
        <div style={{fontSize:11,color:"#ffc850",fontWeight:600,marginBottom:5}}>⚙️ Setup Required — Demo Mode Active</div>
        <div style={{fontSize:11,color:"#9abfb4",lineHeight:1.7}}>
          To accept real PayPal payments, open <code style={{background:"rgba(255,255,255,0.07)",padding:"1px 5px",borderRadius:4,color:"#4de8b0"}}>haiti_ferry_app.jsx</code> and replace the two values at the top of <code style={{background:"rgba(255,255,255,0.07)",padding:"1px 5px",borderRadius:4,color:"#4de8b0"}}>PAYPAL_CONFIG</code>:
          <div style={{marginTop:8,display:"grid",gap:6}}>
            {[
              ["CLIENT_ID","Get from developer.paypal.com → Apps & Credentials"],
              ["PLATFORM_MERCHANT_ID","Get from PayPal Business Account Settings → Account Info"],
            ].map(([k,v])=>(
              <div key={k} style={{background:"rgba(255,255,255,0.04)",borderRadius:7,padding:"7px 10px"}}>
                <span style={{color:"#4de8b0",fontFamily:"monospace",fontSize:11}}>{k}</span>
                <span style={{color:"#4d8a7a",fontSize:10,marginLeft:8}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={()=>onSuccess({orderId:"DEMO-"+genRef(),status:"COMPLETED",payer:{name:{given_name:"Demo"},email_address:"demo@demo.com"},isDemo:true})}
        style={{width:"100%",padding:"14px",background:"#FFD140",color:"#003087",border:"none",borderRadius:8,fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        <span style={{fontStyle:"italic",fontSize:17,fontWeight:900}}>Pay<span style={{color:"#009cde"}}>Pal</span></span>
        Demo — Pay ${f2(amount)} USD
      </button>
      <div style={{textAlign:"center",fontSize:10,color:"#3d6a60",marginTop:7}}>Demo button only. No real payment processed.</div>
    </div>
  );

  if(!ready) return <div style={{padding:14,textAlign:"center",color:"#4d8a7a",fontSize:13}}>⏳ Loading PayPal...</div>;

  return <div ref={ref} style={{minHeight:50}}/>;
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function HaitiFerryApp(){
  const [view,setView]=useState("home");
  const [tab,setTab]=useState("international");
  const [users,setUsers]=useState([{id:"admin",name:"Admin",email:"admin@haitivoyage.com",password:"admin123",role:"admin"}]);
  const [bookings,setBookings]=useState([]);
  const [currentUser,setCurrentUser]=useState(null);
  const [authForm,setAuthForm]=useState({name:"",email:"",password:""});
  const [authError,setAuthError]=useState("");
  const [bStep,setBStep]=useState(0);
  const [bFrom,setBFrom]=useState("");
  const [bTo,setBTo]=useState("");
  const [bDate,setBDate]=useState("");
  const [bRoute,setBRoute]=useState(null);
  const [bDep,setBDep]=useState("");
  const [travelers,setTravelers]=useState([{id:genId(),name:"",age:"",type:"adult"}]);
  const [lastBook,setLastBook]=useState(null);
  const [payErr,setPayErr]=useState("");
  const [lang,setLang]=useState("en");
  const [sf,setSf]=useState("");
  const [st,setSt]=useState("");

  const T={
    en:{book:"Book a Crossing",signIn:"Sign In",reg:"Register",trips:"My Trips",out:"Log out",from:"From",to:"To",date:"Date",search:"Search Routes",intl:"DR ↔ Haiti",dom:"Within Haiti",pop:"Popular Routes",noRoute:"No routes found.",add:"+ Add Traveler"},
    fr:{book:"Réserver",signIn:"Connexion",reg:"S'inscrire",trips:"Mes Voyages",out:"Déconnexion",from:"De",to:"À",date:"Date",search:"Rechercher",intl:"RD ↔ Haïti",dom:"Interne Haïti",pop:"Routes Populaires",noRoute:"Aucune route.",add:"+ Ajouter"},
    ht:{book:"Rezève",signIn:"Konekte",reg:"Enskri",trips:"Vwayaj mwen",out:"Dekonekte",from:"Depi",to:"Ale",date:"Dat",search:"Chèche",intl:"RD ↔ Ayiti",dom:"Anndan Ayiti",pop:"Wout Popilè",noRoute:"Pa gen wout.",add:"+ Ajoute"},
  }[lang];

  const ticketTotal=bRoute?travelers.reduce((s,t)=>s+priceFor(t.type,bRoute.price),0):0;
  const platformFee=Math.round(ticketTotal*PAYPAL_CONFIG.PLATFORM_FEE_PCT*100)/100;
  const operatorTotal=Math.round((ticketTotal-platformFee)*100)/100;
  const paypalFee=Math.round((ticketTotal*PAYPAL_CONFIG.PAYPAL_FEE_PCT+PAYPAL_CONFIG.PAYPAL_FEE_FIXED)*100)/100;
  const grandTotal=ticketTotal;

  const activeRoutes=ALL_ROUTES.filter(r=>r.type===tab);
  const searchRoutes=activeRoutes.filter(r=>(!sf||r.from.toLowerCase().includes(sf.toLowerCase()))&&(!st||r.to.toLowerCase().includes(st.toLowerCase())));
  const bookRoutes=ALL_ROUTES.filter(r=>(!bFrom||r.from===bFrom)&&(!bTo||r.to===bTo));
  const tvValid=travelers.every(t=>t.name.trim()&&t.age);

  const reset=()=>{setBStep(0);setBFrom("");setBTo("");setBDate("");setBRoute(null);setBDep("");setTravelers([{id:genId(),name:"",age:"",type:"adult"}]);setPayErr("");};
  const doLogin=()=>{const u=users.find(u=>u.email===authForm.email&&u.password===authForm.password);if(!u){setAuthError("Invalid email or password.");return;}setCurrentUser(u);setAuthError("");setAuthForm({name:"",email:"",password:""});setView("home");};
  const doReg=()=>{if(!authForm.name||!authForm.email||!authForm.password){setAuthError("All fields required.");return;}if(users.find(u=>u.email===authForm.email)){setAuthError("Email already registered.");return;}const u={id:genId(),name:authForm.name,email:authForm.email,password:authForm.password,role:"user"};setUsers(us=>[...us,u]);setCurrentUser(u);setAuthError("");setAuthForm({name:"",email:"",password:""});setView("home");};
  const doLogout=()=>{setCurrentUser(null);setView("home");reset();};

  const onPPSuccess=(result)=>{
    const b={id:genRef(),paypalOrderId:result.orderId,paypalStatus:result.status,isDemo:result.isDemo||false,userId:currentUser.id,userName:currentUser.name,userEmail:currentUser.email,route:bRoute,date:bDate,departure:bDep,travelers:travelers.map(t=>({...t})),breakdown:{ticketTotal,platformFee,operatorTotal,paypalFee,grandTotal},status:"confirmed",bookedAt:new Date().toLocaleString()};
    setBookings(bs=>[b,...bs]);setLastBook(b);setBStep(5);
  };
  const onPPError=(reason)=>{
    if(reason==="cancelled"){setPayErr("Payment cancelled. Try again.");return;}
    setPayErr("Payment failed. Please try again.");
  };

  const cancel=(id)=>setBookings(bs=>bs.map(b=>b.id===id?{...b,status:"cancelled"}:b));
  const myTrips=bookings.filter(b=>b.userId===currentUser?.id);

  const G={
    wrap:{minHeight:"100vh",background:"#071a18",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#ddf0ec"},
    nav:{background:"rgba(0,0,0,0.55)",borderBottom:"1px solid rgba(77,232,176,0.08)",padding:"0 22px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"},
    card:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"18px 22px"},
    inp:{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#ddf0ec",fontSize:13,outline:"none",boxSizing:"border-box"},
    sel:{width:"100%",padding:"10px 12px",background:"#0b2422",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#ddf0ec",fontSize:13,outline:"none",boxSizing:"border-box"},
    lbl:{display:"block",fontSize:10,color:"#4d8a7a",letterSpacing:1,textTransform:"uppercase",marginBottom:4,fontWeight:600},
    btnP:{padding:"9px 20px",background:"#4de8b0",color:"#071a18",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13},
    btnG:{padding:"8px 18px",background:"transparent",color:"#4de8b0",border:"1px solid rgba(77,232,176,0.22)",borderRadius:8,cursor:"pointer",fontSize:13},
    btnD:{padding:"5px 11px",background:"rgba(255,80,80,0.1)",color:"#ff8080",border:"1px solid rgba(255,80,80,0.22)",borderRadius:6,cursor:"pointer",fontSize:11},
    bdg:(c)=>({display:"inline-block",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:c==="g"?"rgba(77,232,176,0.1)":c==="r"?"rgba(255,80,80,0.1)":"rgba(255,200,80,0.1)",color:c==="g"?"#4de8b0":c==="r"?"#ff8080":"#ffc850",border:`1px solid ${c==="g"?"rgba(77,232,176,0.22)":c==="r"?"rgba(255,80,80,0.22)":"rgba(255,200,80,0.22)"}`}),
  };

  const PT=({port})=>{const c=pColor(port);return<span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:11,fontSize:11,fontWeight:600,background:c.bg,color:c.color,border:`1px solid ${c.border}`}}>{pFlag(port)} {port}</span>;};
  const Arr=()=><span style={{color:"#4de8b0",margin:"0 6px",fontSize:11}}>→</span>;
  const Usd=()=><span style={{fontSize:10,color:"#4d8a7a",fontWeight:400,marginLeft:3}}>USD</span>;

  const Nav=()=>(
    <div style={G.nav}>
      <div style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}} onClick={()=>setView("home")}>
        <span style={{fontSize:24}}>⛴️</span>
        <div><div style={{fontSize:16,fontWeight:700,color:"#4de8b0"}}>HaitiVoyage</div><div style={{fontSize:9,color:"rgba(77,232,176,0.45)",letterSpacing:2}}>HAITI · DR · ISLANDS</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{display:"flex",gap:3,marginRight:4}}>
          {["en","fr","ht"].map(l=><button key={l} onClick={()=>setLang(l)} style={{padding:"3px 8px",fontSize:10,fontWeight:lang===l?700:400,background:lang===l?"rgba(77,232,176,0.13)":"transparent",border:`1px solid ${lang===l?"rgba(77,232,176,0.35)":"rgba(255,255,255,0.07)"}`,borderRadius:5,color:lang===l?"#4de8b0":"#4d8a7a",cursor:"pointer"}}>{l.toUpperCase()}</button>)}
        </div>
        {currentUser?(
          <><span style={{fontSize:12,color:"#7ab4a8"}}>👤 {currentUser.name}</span>
          <button style={G.btnG} onClick={()=>setView("myTrips")}>{T.trips}</button>
          {currentUser.role==="admin"&&<button style={{...G.btnG,color:"#ffc850",borderColor:"rgba(255,200,80,0.22)"}} onClick={()=>setView("admin")}>Admin</button>}
          <button style={G.btnG} onClick={doLogout}>{T.out}</button></>
        ):(
          <><button style={G.btnG} onClick={()=>{setView("login");setAuthError("");}}>{T.signIn}</button>
          <button style={G.btnP} onClick={()=>{setView("register");setAuthError("");}}>{T.reg}</button></>
        )}
      </div>
    </div>
  );

  const Steps=({cur})=>{
    const s=["Route","Sailing","Travelers","Payment","—","Done"];
    return<div style={{display:"flex",alignItems:"center",marginBottom:24}}>{s.map((l,i)=><div key={i} style={{display:"flex",alignItems:"center",flex:i<s.length-1?1:"none"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:25,height:25,borderRadius:"50%",background:i<cur?"#4de8b0":i===cur?"rgba(77,232,176,0.18)":"rgba(255,255,255,0.05)",color:i<cur?"#071a18":i===cur?"#4de8b0":"#4d8a7a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,border:i===cur?"2px solid #4de8b0":"none"}}>{i<cur?"✓":i+1}</div><div style={{fontSize:8,color:i===cur?"#4de8b0":"#4d8a7a",marginTop:2,whiteSpace:"nowrap"}}>{l}</div></div>{i<s.length-1&&<div style={{flex:1,height:1,margin:"0 3px",marginBottom:12,background:i<cur?"#4de8b0":"rgba(255,255,255,0.06)"}}/>}</div>)}</div>;
  };

  if(view==="home")return(
    <div style={G.wrap}><Nav/>
      <div style={{maxWidth:880,margin:"0 auto",padding:"46px 20px"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:52,marginBottom:10}}>⛴️</div>
          <h1 style={{fontSize:34,color:"#4de8b0",margin:"0 0 7px",fontWeight:700}}>HaitiVoyage</h1>
          <p style={{color:"#7ab4a8",fontSize:14,margin:"0 0 5px"}}>Haiti ↔ Dominican Republic · Coastal Haiti · Island Crossings</p>
          <p style={{color:"#4d8a7a",fontSize:12,margin:"0 0 6px"}}>All fares in <strong style={{color:"#4de8b0"}}>US Dollars (USD)</strong> · Secure checkout via <strong style={{color:"#FFD140"}}>PayPal</strong></p>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:20}}>
            <button style={{...G.btnP,padding:"12px 30px",fontSize:14}} onClick={()=>{if(!currentUser){setView("login");}else{reset();setView("book");}}}>{T.book}</button>
            {!currentUser&&<button style={{...G.btnG,padding:"12px 28px",fontSize:13}} onClick={()=>{setView("register");setAuthError("");}}>{T.reg}</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16,borderBottom:"1px solid rgba(255,255,255,0.06)",paddingBottom:10,alignItems:"center"}}>
          {[["international","🌊 "+T.intl],["domestic","🇭🇹 "+T.dom]].map(([t,l])=><button key={t} onClick={()=>{setTab(t);setSf("");setSt("");}} style={{padding:"8px 18px",borderRadius:8,fontSize:12,fontWeight:tab===t?700:400,background:tab===t?"rgba(77,232,176,0.12)":"transparent",border:`1px solid ${tab===t?"rgba(77,232,176,0.35)":"rgba(255,255,255,0.07)"}`,color:tab===t?"#4de8b0":"#4d8a7a",cursor:"pointer"}}>{l}</button>)}
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            <input style={{...G.inp,width:128,fontSize:11}} placeholder="From..." value={sf} onChange={e=>setSf(e.target.value)}/>
            <input style={{...G.inp,width:128,fontSize:11}} placeholder="To..." value={st} onChange={e=>setSt(e.target.value)}/>
          </div>
        </div>
        {!sf&&!st&&activeRoutes.filter(r=>r.popular).length>0&&(
          <><p style={{fontSize:11,fontWeight:600,color:"#4d8a7a",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{T.pop}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:22}}>
            {activeRoutes.filter(r=>r.popular).map(r=>(
              <div key={r.id} style={{...G.card,cursor:"pointer",border:"1px solid rgba(77,232,176,0.13)"}} onClick={()=>{if(!currentUser){setView("login");}else{setBFrom(r.from);setBTo(r.to);reset();setView("book");}}}>
                <div style={{marginBottom:7}}><PT port={r.from}/><Arr/><PT port={r.to}/></div>
                <div style={{fontSize:18,fontWeight:700,color:"#4de8b0"}}>${r.price}<Usd/></div>
                <div style={{fontSize:11,color:"#4d8a7a",marginTop:2}}>⏱ {r.duration} · {r.distance}</div>
              </div>
            ))}
          </div></>
        )}
        <p style={{fontSize:11,fontWeight:600,color:"#4d8a7a",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>
          {sf||st?"Search Results":"All Routes"} <span style={{color:"#4de8b0",fontWeight:400}}>({searchRoutes.length})</span>
        </p>
        {searchRoutes.length===0?<div style={{...G.card,textAlign:"center",color:"#4d8a7a",padding:30}}>{T.noRoute}</div>
          :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {searchRoutes.map(r=>(
              <div key={r.id} style={{...G.card,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{marginBottom:5}}><PT port={r.from}/><Arr/><PT port={r.to}/></div><div style={{fontSize:10,color:"#4d8a7a"}}>⏱ {r.duration} · {r.distance}</div></div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:700,color:"#4de8b0"}}>${r.price}<Usd/></div>
                  <button style={{...G.btnG,fontSize:10,padding:"4px 10px",marginTop:5}} onClick={()=>{if(!currentUser){setView("login");}else{setBFrom(r.from);setBTo(r.to);reset();setView("book");}}}>Book</button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );

  if(view==="login"||view==="register"){
    const isL=view==="login";
    return<div style={G.wrap}><Nav/>
      <div style={{maxWidth:400,margin:"56px auto",padding:"0 20px"}}>
        <div style={G.card}>
          <h2 style={{margin:"0 0 20px",color:"#4de8b0",fontSize:20}}>{isL?"Welcome back":"Create account"}</h2>
          {!isL&&<div style={{marginBottom:12}}><label style={G.lbl}>Full Name</label><input style={G.inp} placeholder="Your full name" value={authForm.name} onChange={e=>setAuthForm(f=>({...f,name:e.target.value}))}/></div>}
          <div style={{marginBottom:12}}><label style={G.lbl}>Email</label><input style={G.inp} type="email" placeholder="your@email.com" value={authForm.email} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))}/></div>
          <div style={{marginBottom:16}}><label style={G.lbl}>Password</label><input style={G.inp} type="password" placeholder="••••••••" value={authForm.password} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))}/></div>
          {authError&&<div style={{color:"#ff8080",fontSize:12,marginBottom:12}}>{authError}</div>}
          <button style={{...G.btnP,width:"100%",padding:"11px",fontSize:14}} onClick={isL?doLogin:doReg}>{isL?T.signIn:T.reg}</button>
          <div style={{textAlign:"center",marginTop:12,fontSize:12,color:"#4d8a7a"}}>{isL?"No account? ":"Have one? "}<span style={{color:"#4de8b0",cursor:"pointer"}} onClick={()=>setView(isL?"register":"login")}>{isL?T.reg:T.signIn}</span></div>
          {isL&&<div style={{textAlign:"center",marginTop:7,fontSize:10,color:"#2d5a50"}}>Demo: admin@haitivoyage.com / admin123</div>}
        </div>
      </div>
    </div>;
  }

  if(view==="book")return(
    <div style={G.wrap}><Nav/>
      <div style={{maxWidth:660,margin:"0 auto",padding:"26px 18px"}}>
        {bStep<5&&<Steps cur={bStep}/>}

        {bStep===0&&<div style={G.card}>
          <h2 style={{margin:"0 0 18px",color:"#4de8b0",fontSize:18}}>Select your route</h2>
          <div style={{display:"flex",gap:7,marginBottom:14}}>
            {[["international","🌊 "+T.intl],["domestic","🇭🇹 "+T.dom]].map(([t,l])=><button key={t} onClick={()=>{setTab(t);setBFrom("");setBTo("");}} style={{padding:"7px 15px",borderRadius:7,fontSize:11,fontWeight:tab===t?700:400,background:tab===t?"rgba(77,232,176,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${tab===t?"rgba(77,232,176,0.35)":"rgba(255,255,255,0.07)"}`,color:tab===t?"#4de8b0":"#4d8a7a",cursor:"pointer"}}>{l}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div><label style={G.lbl}>{T.from}</label>
              <select style={G.sel} value={bFrom} onChange={e=>setBFrom(e.target.value)}><option value="">Select port</option>
                {tab==="international"?<><optgroup label="🇩🇴 Dominican Republic">{PORTS.DR.map(p=><option key={p}>{p}</option>)}</optgroup><optgroup label="🇭🇹 Haiti">{PORTS.Haiti.map(p=><option key={p}>{p}</option>)}</optgroup></>
                :<><optgroup label="🇭🇹 Haiti — Mainland">{PORTS.Haiti.map(p=><option key={p}>{p}</option>)}</optgroup><optgroup label="🏝️ Islands">{PORTS.Islands.map(p=><option key={p}>{p}</option>)}</optgroup></>}
              </select>
            </div>
            <div><label style={G.lbl}>{T.to}</label>
              <select style={G.sel} value={bTo} onChange={e=>setBTo(e.target.value)}><option value="">Select port</option>
                {tab==="international"?<><optgroup label="🇩🇴 Dominican Republic">{PORTS.DR.filter(p=>p!==bFrom).map(p=><option key={p}>{p}</option>)}</optgroup><optgroup label="🇭🇹 Haiti">{PORTS.Haiti.filter(p=>p!==bFrom).map(p=><option key={p}>{p}</option>)}</optgroup></>
                :<><optgroup label="🇭🇹 Haiti — Mainland">{PORTS.Haiti.filter(p=>p!==bFrom).map(p=><option key={p}>{p}</option>)}</optgroup><optgroup label="🏝️ Islands">{PORTS.Islands.filter(p=>p!==bFrom).map(p=><option key={p}>{p}</option>)}</optgroup></>}
              </select>
            </div>
          </div>
          <div style={{marginBottom:18}}><label style={G.lbl}>{T.date}</label><input type="date" min={TODAY} value={bDate} onChange={e=>setBDate(e.target.value)} style={G.inp}/></div>
          <button style={{...G.btnP,width:"100%",padding:"11px",opacity:(bFrom&&bTo&&bDate)?1:0.4}} disabled={!bFrom||!bTo||!bDate} onClick={()=>setBStep(1)}>{T.search}</button>
        </div>}

        {bStep===1&&<div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <button style={G.btnG} onClick={()=>setBStep(0)}>← Back</button>
            <div><PT port={bFrom}/><Arr/><PT port={bTo}/><span style={{fontSize:11,color:"#4d8a7a",marginLeft:9}}>{bDate}</span></div>
          </div>
          {bookRoutes.length===0?<div style={{...G.card,textAlign:"center",color:"#4d8a7a",padding:36}}>{T.noRoute}</div>
          :bookRoutes.map(r=>(
            <div key={r.id} style={{...G.card,marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:11}}>
                <div><div style={{marginBottom:5}}><PT port={r.from}/><Arr/><PT port={r.to}/></div><div style={{fontSize:11,color:"#4d8a7a"}}>⏱ {r.duration} · 🧭 {r.distance}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:19,fontWeight:700,color:"#4de8b0"}}>${r.price}<Usd/></div><div style={{fontSize:9,color:"#4d8a7a"}}>per adult</div></div>
              </div>
              <div style={{fontSize:11,color:"#4d8a7a",marginBottom:7}}>Select departure:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {DEPARTURES.map(d=><button key={d} onClick={()=>{setBRoute(r);setBDep(d);setBStep(2);}} style={{padding:"5px 11px",borderRadius:6,fontSize:11,cursor:"pointer",background:"rgba(77,232,176,0.06)",border:"1px solid rgba(77,232,176,0.16)",color:"#4de8b0"}}>{d}</button>)}
              </div>
            </div>
          ))}
        </div>}

        {bStep===2&&bRoute&&<div style={G.card}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><button style={G.btnG} onClick={()=>setBStep(1)}>← Back</button><h2 style={{margin:0,fontSize:17,color:"#4de8b0"}}>Traveler Details</h2></div>
          <div style={{background:"rgba(77,232,176,0.05)",borderRadius:9,padding:"9px 13px",marginBottom:16,fontSize:12}}><PT port={bRoute.from}/><Arr/><PT port={bRoute.to}/><span style={{color:"#4d8a7a",marginLeft:9}}>{bDate} at {bDep}</span></div>
          {travelers.map((t,i)=>(
            <div key={t.id} style={{display:"grid",gridTemplateColumns:"1fr 70px 1fr auto",gap:7,marginBottom:8}}>
              <div>{i===0&&<label style={G.lbl}>Full Name</label>}<input style={G.inp} placeholder="Full name" value={t.name} onChange={e=>setTravelers(ts=>ts.map(x=>x.id===t.id?{...x,name:e.target.value}:x))}/></div>
              <div>{i===0&&<label style={G.lbl}>Age</label>}<input style={G.inp} placeholder="Age" type="number" min={1} max={120} value={t.age} onChange={e=>setTravelers(ts=>ts.map(x=>x.id===t.id?{...x,age:e.target.value}:x))}/></div>
              <div>{i===0&&<label style={G.lbl}>Ticket Type</label>}
                <select style={G.sel} value={t.type} onChange={e=>setTravelers(ts=>ts.map(x=>x.id===t.id?{...x,type:e.target.value}:x))}>
                  <option value="adult">Adult — ${bRoute.price} USD</option>
                  <option value="child">Child (50% off) — ${Math.round(bRoute.price*0.5)} USD</option>
                  <option value="senior">Senior (25% off) — ${Math.round(bRoute.price*0.75)} USD</option>
                </select>
              </div>
              <div style={{paddingTop:i===0?19:0}}><button onClick={()=>setTravelers(ts=>ts.filter(x=>x.id!==t.id))} style={G.btnD} disabled={i===0}>✕</button></div>
            </div>
          ))}
          <button style={{...G.btnG,marginTop:4,marginBottom:16,fontSize:11}} onClick={()=>setTravelers(ts=>[...ts,{id:genId(),name:"",age:"",type:"adult"}])}>{T.add}</button>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#4d8a7a",fontSize:12}}>Tickets ({travelers.length})</span><span style={{fontSize:13}}>${f2(ticketTotal)} USD</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#4d8a7a",fontSize:12}}>Platform fee (8%) → HaitiVoyage</span><span style={{color:"#4d8a7a",fontSize:12}}>${f2(platformFee)} USD</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}><span style={{color:"#4d8a7a",fontSize:12}}>Operator receives</span><span style={{color:"#4d8a7a",fontSize:12}}>${f2(operatorTotal)} USD</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600,fontSize:14}}>You pay</span><span style={{fontSize:19,fontWeight:700,color:"#4de8b0"}}>${f2(grandTotal)}<Usd/></span></div>
          </div>
          <button style={{...G.btnP,width:"100%",padding:"11px",marginTop:13,opacity:tvValid?1:0.4}} disabled={!tvValid} onClick={()=>setBStep(3)}>Continue to Payment</button>
        </div>}

        {bStep===3&&bRoute&&<div style={G.card}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><button style={G.btnG} onClick={()=>setBStep(2)}>← Back</button><h2 style={{margin:0,fontSize:17,color:"#4de8b0"}}>Secure Payment</h2></div>
          <div style={{background:"rgba(77,232,176,0.05)",borderRadius:10,padding:"12px 16px",marginBottom:16,border:"1px solid rgba(77,232,176,0.1)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div><PT port={bRoute.from}/><Arr/><PT port={bRoute.to}/></div>
              <span style={{fontSize:12,color:"#4d8a7a"}}>{bDate} · {bDep}</span>
            </div>
            <div style={{fontSize:12,color:"#4d8a7a",marginBottom:6}}>{travelers.length} traveler{travelers.length>1?"s":""}: {travelers.map(t=>`${t.name||"—"} (${t.type})`).join(", ")}</div>
            <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:8,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:14,fontWeight:600}}>Total</span>
              <span style={{fontSize:18,fontWeight:700,color:"#4de8b0"}}>${f2(grandTotal)} USD</span>
            </div>
          </div>
          <div style={{background:"rgba(255,209,64,0.05)",border:"1px solid rgba(255,209,64,0.14)",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:11,color:"#9abfb4",lineHeight:1.6}}>
            <span style={{color:"#FFD140",fontWeight:600}}>PayPal</span> handles your payment securely. The 8% platform fee (${f2(platformFee)} USD) is automatically routed to Alexandra's PayPal account. You are never charged extra.
          </div>
          {payErr&&<div style={{color:"#ff8080",fontSize:12,marginBottom:14,padding:"10px",background:"rgba(255,80,80,0.08)",borderRadius:8}}>{payErr}</div>}
          <PayPalBtn amount={grandTotal} travelers={travelers} route={bRoute} onSuccess={onPPSuccess} onError={onPPError}/>
          <div style={{textAlign:"center",marginTop:10,fontSize:10,color:"#2d5a50"}}>🔒 Powered by PayPal. HaitiVoyage never stores your card details.</div>
        </div>}

        {bStep===5&&lastBook&&<div style={{...G.card,border:"1px solid rgba(77,232,176,0.2)",textAlign:"center"}}>
          <div style={{fontSize:46,marginBottom:9}}>🎉</div>
          <div style={{fontSize:21,color:"#4de8b0",fontWeight:700,marginBottom:5}}>Booking Confirmed!</div>
          <div style={{fontSize:12,color:"#4d8a7a",marginBottom:16}}>
            {lastBook.isDemo?"[Demo] ":""}Payment of <strong style={{color:"#4de8b0"}}>${f2(lastBook.breakdown.grandTotal)} USD</strong> received via PayPal
            {lastBook.paypalOrderId&&<><br/><span style={{fontFamily:"monospace",color:"#7ab4a8",fontSize:11}}>PayPal Order: {lastBook.paypalOrderId}</span></>}
          </div>
          <div style={{background:"rgba(77,232,176,0.06)",border:"1px solid rgba(77,232,176,0.13)",borderRadius:9,padding:"9px 16px",marginBottom:16,display:"inline-block"}}>
            <div style={{fontSize:8,color:"#4d8a7a",letterSpacing:2,marginBottom:2}}>BOOKING REF</div>
            <div style={{fontSize:19,fontWeight:700,color:"#4de8b0",letterSpacing:4}}>{lastBook.id}</div>
          </div>
          <div style={{fontSize:12,color:"#7ab4a8",lineHeight:2,marginBottom:16}}>
            <div><PT port={lastBook.route.from}/><Arr/><PT port={lastBook.route.to}/></div>
            <div>📅 {lastBook.date} at {lastBook.departure}</div>
            <div>👥 {lastBook.travelers.map(t=>t.name).join(", ")}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"9px 13px",marginBottom:16,fontSize:11,textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",color:"#4d8a7a"}}><span>Tickets</span><span>${f2(lastBook.breakdown.ticketTotal)} USD</span></div>
            <div style={{display:"flex",justifyContent:"space-between",color:"#4d8a7a"}}><span>8% fee → HaitiVoyage (Alexandra)</span><span>${f2(lastBook.breakdown.platformFee)} USD</span></div>
            <div style={{display:"flex",justifyContent:"space-between",color:"#4d8a7a"}}><span>Operator receives</span><span>${f2(lastBook.breakdown.operatorTotal)} USD</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:7,paddingTop:7,borderTop:"1px solid rgba(255,255,255,0.06)",color:"#4de8b0",fontWeight:600}}><span>Total paid</span><span>${f2(lastBook.breakdown.grandTotal)} USD</span></div>
          </div>
          <div style={{display:"flex",gap:9,justifyContent:"center"}}>
            <button style={G.btnP} onClick={()=>{reset();setView("book");}}>Book Another</button>
            <button style={G.btnG} onClick={()=>setView("myTrips")}>{T.trips}</button>
          </div>
        </div>}
      </div>
    </div>
  );

  if(view==="myTrips")return(
    <div style={G.wrap}><Nav/>
      <div style={{maxWidth:680,margin:"0 auto",padding:"26px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 style={{margin:0,color:"#4de8b0",fontSize:19}}>{T.trips}</h2>
          <button style={G.btnP} onClick={()=>{reset();setView("book");}}>+ New Booking</button>
        </div>
        {myTrips.length===0?<div style={{...G.card,textAlign:"center",padding:"38px 22px",color:"#4d8a7a"}}>No trips yet. Book your first crossing!</div>
        :myTrips.map(b=>(
          <div key={b.id} style={{...G.card,marginBottom:11}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
              <div><div style={{marginBottom:4}}><PT port={b.route.from}/><Arr/><PT port={b.route.to}/></div><div style={{fontSize:10,color:"#4d8a7a"}}>📅 {b.date} at {b.departure}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:7}}><span style={G.bdg(b.status==="confirmed"?"g":"r")}>{b.status}</span>{b.isDemo&&<span style={{fontSize:10,background:"rgba(255,200,80,0.1)",color:"#ffc850",padding:"1px 7px",borderRadius:10,border:"1px solid rgba(255,200,80,0.2)"}}>demo</span>}<span style={{fontSize:16,fontWeight:700,color:"#4de8b0"}}>${f2(b.breakdown.grandTotal)}<Usd/></span></div>
            </div>
            <div style={{fontSize:10,color:"#4d8a7a",marginBottom:7}}>Ref: <span style={{color:"#7ab4a8",fontFamily:"monospace"}}>{b.id}</span>{b.paypalOrderId&&<> · PayPal: <span style={{fontFamily:"monospace"}}>{b.paypalOrderId.substring(0,14)}...</span></>}</div>
            {b.status==="confirmed"&&<button style={G.btnD} onClick={()=>cancel(b.id)}>Cancel</button>}
          </div>
        ))}
      </div>
    </div>
  );

  if(view==="admin"&&currentUser?.role==="admin"){
    const conf=bookings.filter(b=>b.status==="confirmed");
    const gross=conf.reduce((s,b)=>s+b.breakdown.grandTotal,0);
    const platform=conf.reduce((s,b)=>s+b.breakdown.platformFee,0);
    const operator=conf.reduce((s,b)=>s+b.breakdown.operatorTotal,0);
    return<div style={G.wrap}><Nav/>
      <div style={{maxWidth:820,margin:"0 auto",padding:"26px 18px"}}>
        <h2 style={{color:"#ffc850",marginBottom:18,fontSize:19}}>⚙️ Admin Dashboard</h2>

        {PAYPAL_CONFIG.CLIENT_ID==="YOUR_PAYPAL_CLIENT_ID_HERE"&&(
          <div style={{background:"rgba(255,196,57,0.07)",border:"1px solid rgba(255,196,57,0.18)",borderRadius:10,padding:"14px 18px",marginBottom:20}}>
            <div style={{fontSize:12,color:"#ffc850",fontWeight:600,marginBottom:10}}>⚙️ PayPal Setup — 6 Steps to Go Live</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                ["Step 1","Create PayPal Business account","paypal.com/business — free"],
                ["Step 2","Apply for Commerce Platform","developer.paypal.com → Marketplaces & Platforms"],
                ["Step 3","Get your Client ID","Apps & Credentials → copy Client ID"],
                ["Step 4","Get your Merchant ID","Account Settings → Account Info → Merchant ID"],
                ["Step 5","Add Client ID to app","Replace YOUR_PAYPAL_CLIENT_ID_HERE in PAYPAL_CONFIG"],
                ["Step 6","Add Merchant ID to app","Replace ALEXANDRAS_MERCHANT_ID in PAYPAL_CONFIG"],
              ].map(([step,title,detail])=>(
                <div key={step} style={{background:"rgba(255,255,255,0.03)",borderRadius:7,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:"#ffc850",marginBottom:2}}>{step}</div>
                  <div style={{fontSize:12,color:"#ddf0ec",marginBottom:2}}>{title}</div>
                  <div style={{fontSize:10,color:"#4d8a7a"}}>{detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:20}}>
          {[["👥","Users",users.length,"blue"],["🎫","Bookings",bookings.length,"blue"],["💰","Gross Revenue (USD)","$"+f2(gross),"green"],["📊","Alexandra's Earnings (USD)","$"+f2(platform),"green"]].map(([ic,lb,vl,c])=>(
            <div key={lb} style={{...G.card,textAlign:"center",padding:"13px 9px"}}>
              <div style={{fontSize:17}}>{ic}</div>
              <div style={{fontSize:17,fontWeight:700,color:c==="green"?"#4de8b0":"#70c0ff",margin:"4px 0 2px"}}>{vl}</div>
              <div style={{fontSize:10,color:"#4d8a7a"}}>{lb}</div>
            </div>
          ))}
        </div>

        <div style={{background:"rgba(77,232,176,0.04)",border:"1px solid rgba(77,232,176,0.1)",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:12}}>
          <div style={{color:"#4de8b0",fontWeight:600,marginBottom:7}}>💸 How Money Flows (PayPal Commerce Platform)</div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",color:"#9abfb4",fontSize:11}}>
            <span>Passenger pays ${f2(gross/Math.max(conf.length,1))} avg</span><span style={{color:"#4de8b0"}}>→</span>
            <span style={{color:"#FFD140"}}>8% instantly to Alexandra's PayPal (${f2(platform)} total)</span><span style={{color:"#4de8b0"}}>+</span>
            <span>92% to ferry operator (${f2(operator)} total)</span><span style={{color:"#4de8b0"}}>→</span>
            <span>Alexandra withdraws to bank anytime from PayPal</span>
          </div>
        </div>

        <h3 style={{color:"#4de8b0",marginBottom:11,fontSize:13}}>All Bookings</h3>
        {bookings.length===0?<div style={{...G.card,textAlign:"center",color:"#4d8a7a",padding:26}}>No bookings yet.</div>
        :bookings.map(b=>(
          <div key={b.id} style={{...G.card,marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <div><PT port={b.route.from}/><Arr/><PT port={b.route.to}/><span style={{fontSize:10,color:"#4d8a7a",marginLeft:9}}>{b.date} · {b.departure}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><span style={G.bdg(b.status==="confirmed"?"g":"r")}>{b.status}</span>{b.isDemo&&<span style={{fontSize:10,background:"rgba(255,200,80,0.1)",color:"#ffc850",padding:"1px 7px",borderRadius:10,border:"1px solid rgba(255,200,80,0.2)"}}>demo</span>}<span style={{color:"#4de8b0",fontWeight:700,fontSize:13}}>${f2(b.breakdown.grandTotal)} USD</span></div>
            </div>
            <div style={{fontSize:10,color:"#4d8a7a",marginBottom:4}}>👤 {b.userName} ({b.userEmail}) · Ref: <span style={{fontFamily:"monospace",color:"#7ab4a8"}}>{b.id}</span>{b.paypalOrderId&&<> · PayPal: <span style={{fontFamily:"monospace"}}>{b.paypalOrderId}</span></>}</div>
            <div style={{fontSize:10,color:"#4d8a7a"}}>Tickets ${f2(b.breakdown.ticketTotal)} · Alexandra ${f2(b.breakdown.platformFee)} · Operator ${f2(b.breakdown.operatorTotal)}</div>
            {b.status==="confirmed"&&<button style={{...G.btnD,marginTop:6,fontSize:10}} onClick={()=>cancel(b.id)}>Cancel</button>}
          </div>
        ))}
      </div>
    </div>;
  }

  return null;
}
