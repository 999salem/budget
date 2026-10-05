const KEY="reset-finance-v3";
const initial={
  accounts:{chequing:112,savings:100,wise:0,rent:0,shakepay:4.30,cash:200,rbc:4202,mastercard:4714},
  limits:{rbc:5000,mastercard:5000},
  locked:{mastercard:true},
  bills:[
    {id:"rent",name:"Rent",amount:750,due:"2026-10-01",paid:true,account:"rent"},
    {id:"phone",name:"Phone",amount:110,due:"2026-10-15",paid:false,account:"shakepay"},
    {id:"insurance",name:"Insurance",amount:309.23,due:"2026-10-19",paid:false,account:"shakepay"}
  ],
  weeklyBudget:150,
  spentThisWeek:0,
  expenses:[],
  incomeLog:[],
  activeTab:"home",
  reward:{name:"NHL 27",target:0,unlocked:false},runway:{days:30,estimatedIncome:0,estimatedSpending:600,estimatedSavings:250},resetReason:"",
  mission:"Get through October without adding new credit card debt."
};
let state=load();
function load(){try{return {...structuredClone(initial),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return structuredClone(initial)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function money(n){return "$"+Number(n||0).toLocaleString("en-CA",{minimumFractionDigits:2,maximumFractionDigits:2})}
function debt(){return state.accounts.rbc+state.accounts.mastercard}
function available(){return state.accounts.chequing+state.accounts.savings+state.accounts.wise+state.accounts.rent+state.accounts.shakepay+state.accounts.cash}
function pct(a,b){return Math.max(0,Math.min(100,(a/b)*100))}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function render(){
  document.querySelectorAll(".navbtn").forEach(b=>b.classList.toggle("active",b.dataset.tab===state.activeTab));
  const c=document.getElementById("content");
  c.innerHTML={home:home,accounts:accounts,payday:payday,tips:tips,spending:spending}[state.activeTab]();
  bind();
}
function unpaidBillsTotal(){return state.bills.filter(b=>!b.paid).reduce((s,b)=>s+Number(b.amount||0),0)}
function safeToSpend(){const bills=unpaidBillsTotal(),gap=Math.max(0,1000-state.accounts.savings),wise=Math.max(0,state.weeklyBudget-state.spentThisWeek);return Math.max(0,state.accounts.chequing-bills-gap-wise)}
function debtUtilization(){return debt()/10000*100}
function debtMilestone(){const ms=[90,80,70,60,50,40,30],u=debtUtilization(),next=ms.find(x=>u>x-10)||30,target=10000*(next/100);return {util:u,next,target,amountToGo:Math.max(0,debt()-target)}}
function runway(){const income=Number(state.runway?.estimatedIncome||0),bills=unpaidBillsTotal(),spending=Number(state.runway?.estimatedSpending||600),savings=Number(state.runway?.estimatedSavings||250);return {income,bills,spending,savings,debtPotential:Math.max(0,income-bills-spending-savings)}}
function haptic(){try{if(navigator.vibrate)navigator.vibrate(12)}catch(e){}}

function getNextAction(){
 const shakeNeed=Math.max(0,419.23-state.accounts.shakepay);
 const savingsNeed=Math.max(0,1000-state.accounts.savings);
 const unpaid=state.bills.filter(b=>!b.paid);
 const unpaidTotal=unpaid.reduce((s,b)=>s+b.amount,0);
 const mastercardMin=state.accounts.mastercard>0 ? Math.min(50,state.accounts.mastercard) : 0;

 if(shakeNeed>0){
   return {
     title:"Fund Shakepay",
     detail:`${money(shakeNeed)} still needed for phone + insurance.`,
     label:"Priority"
   };
 }
 if(unpaidTotal>0){
   const nextBill=unpaid.slice().sort((a,b)=>a.due.localeCompare(b.due))[0];
   return {
     title:`Fund ${nextBill.name}`,
     detail:`${money(nextBill.amount)} • due ${nextBill.due}.`,
     label:"Bill"
   };
 }
 if(savingsNeed>0){
   return {
     title:"Build Savings",
     detail:`${money(savingsNeed)} still needed to reach your $1,000 minimum.`,
     label:"Priority"
   };
 }
 if(mastercardMin>0){
   return {
     title:"Pay Mastercard",
     detail:`Keep it locked • next payment target ${money(mastercardMin)}.`,
     label:"Debt"
   };
 }
 return {
   title:"Attack RBC Visa",
   detail:`Extra money can now go toward your active debt target.`,
   label:"Next"
 };
}

function home(){
 const unpaid=state.bills.filter(b=>!b.paid),billDue=unpaidBillsTotal(),next=getNextAction(),safe=safeToSpend(),r=runway(),m=debtMilestone();
 const rewardReady=state.accounts.savings>=1000&&state.bills.every(b=>b.paid)&&state.accounts.mastercard<=0;
 return `<div class="hero"><div class="eyebrow">TODAY</div><div class="title">${esc(next.title)}</div><div class="small">${esc(next.detail)}</div><div class="actionline"><span class="pill bluepill">${esc(next.label)}</span><button class="pill" id="todayAction">VIEW PLAN</button></div></div>
 <div class="card safe-card"><div class="eyebrow">SAFE TO SPEND</div><div class="money">${money(safe)}</div><div class="small">After upcoming bills, your $1,000 savings minimum, and this week's Wise budget.</div><div class="grid2" style="margin-top:12px"><div class="metric"><span class="small">Chequing</span><b>${money(state.accounts.chequing)}</b></div><div class="metric"><span class="small">Protected bills</span><b>${money(billDue)}</b></div></div></div>
 <div class="card"><div class="row"><div><div class="eyebrow">NEXT 30 DAYS</div><div class="title">Your runway</div></div><span class="pill">Estimate</span></div><div class="split"><div class="metric"><span class="small">Expected income</span><b>${money(r.income)}</b></div><div class="metric"><span class="small">Bills</span><b>-${money(r.bills)}</b></div><div class="metric"><span class="small">Spending</span><b>-${money(r.spending)}</b></div><div class="metric"><span class="small">Savings</span><b>-${money(r.savings)}</b></div></div><div class="notice" style="margin-top:10px">Potential debt payment: <b>${money(r.debtPotential)}</b>. Estimates never become actual income until you enter it.</div><button class="btn secondary" id="editRunway">Edit 30-day estimates</button></div>
 <div class="card"><div class="row"><div><div class="eyebrow">DEBT JOURNEY</div><div class="title">Total credit-card debt</div></div><b>${debtUtilization().toFixed(1)}%</b></div><div class="money">${money(debt())}<span class="small"> / $10,000</span></div><div class="progress"><i style="width:${debtUtilization()}%"></i></div><div class="milestones">${[90,80,70,60,50,40,30].map(x=>`<span class="${debtUtilization()<=x?'hit':''}">${x}%</span>`).join('')}</div><div class="notice">Next milestone: <b>${m.next}%</b> utilization • ${money(m.amountToGo)} to go.</div></div>
 <div class="card"><div class="row"><div><div class="eyebrow">REWARD VAULT</div><div class="title">🏒 ${esc(state.reward.name)}</div></div><span class="pill ${rewardReady?'bluepill':''}">${rewardReady?'UNLOCKED':'LOCKED'}</span></div><div class="small">Cash purchase only.</div><div class="check"><span>${state.accounts.savings>=1000?'✓':'○'}</span> $1,000 savings minimum</div><div class="check"><span>${state.bills.every(b=>b.paid)?'✓':'○'}</span> All bills funded</div><div class="check"><span>${state.accounts.mastercard<=0?'✓':'○'}</span> Mastercard cleared</div><div class="check"><span>○</span> Purchase with cash, never credit</div></div>
 <div class="card"><div class="row"><div><div class="title">Bills</div><div class="small">${unpaid.length?`${unpaid.length} pending • ${money(billDue)}`:'All bills marked paid'}</div></div><button class="pill bluepill" id="editBills">Edit</button></div>${state.bills.map(b=>`<div class="expense"><span>${esc(b.name)}<br><span class="small">Due ${esc(b.due)} • ${b.paid?'Paid':'Pending'}</span></span><span>${money(b.amount)} <button class="pill" data-paid="${b.id}">${b.paid?'Paid':'Mark paid'}</button></span></div>`).join('')}</div>
 <button class="btn danger" id="resetPlan">I MESSED UP — RESET MY PLAN</button>`;
}

function accounts(){
 const rows=[
 ["cash","Cash","Emergency flexibility • don't automatically use for debt",state.accounts.cash],
 ["chequing","Chequing","Day-to-day buffer",state.accounts.chequing],
 ["savings","Savings","Protected minimum: $1,000",state.accounts.savings],
 ["wise","Wise (Spending)","Weekly discretionary spending",state.accounts.wise],
 ["rent","Rent / Envision","Rent bucket",state.accounts.rent],
 ["shakepay","Shakepay","Phone + insurance target: $419.23",state.accounts.shakepay],
 ["rbc","RBC Visa","Active debt target",state.accounts.rbc],
 ["mastercard","Mastercard","LOCKED • minimum payment only",state.accounts.mastercard]
 ];
 return `<div class="card"><div class="row"><div><div class="eyebrow">Accounts</div><div class="title">Live balances</div></div><button class="pill bluepill" id="editBalances">Edit</button></div></div>
 <div class="list">${rows.map(([id,n,d,v])=>`<div class="account ${id==="mastercard"?"locked":""}">
  <div class="row"><div><div class="name">${n} ${id==="mastercard"?'<span class="pill">LOCKED</span>':""}</div><div class="desc">${d}</div></div><div class="amount">${money(v)}</div></div>
  ${["rbc","mastercard","shakepay","rent"].includes(id)?`<div class="progress ${id==="mastercard"?"white":""}"><i style="width:${id==="rbc"||id==="mastercard"?pct(v,5000):pct(v,id==="shakepay"?419.23:750)}%"></i></div>`:""}
 </div>`).join("")}</div>`;
}
function payday(){
 return `<div class="card blue"><div class="eyebrow">Payday wizard</div><div class="title">Enter the actual paycheque</div>
 <div class="label">Deposit amount</div><input class="input" id="payAmount" inputmode="decimal" placeholder="0.00">
 <div class="notice" style="margin-top:12px">The app will add the paycheque to Chequing first, then show a priority plan. It will never invent income.</div>
 <button class="btn" id="calcPay">Calculate plan</button></div>
 <div id="payResult"></div>`;
}
function tips(){
 return `<div class="card blue"><div class="eyebrow">Tip day</div><div class="title">Enter actual tips</div>
 <div class="label">Tip amount</div><input class="input" id="tipAmount" inputmode="decimal" placeholder="0.00">
 <button class="btn" id="calcTips">Calculate plan</button></div>
 <div class="card"><div class="title">Rule</div><div class="notice">If Shakepay is below $419.23, tips fund it first. After essential bills are covered, remaining tips go to RBC Visa.</div></div>
 <div class="card"><div class="title">Upcoming</div><div class="row"><span>Tip day</span><span class="pill bluepill">Tue, Oct 6 • ~ $150 estimate</span></div></div>
 <div id="tipResult"></div>`;
}
function spending(){
 const remain=Math.max(0,state.weeklyBudget-state.spentThisWeek);
 const days=[["Mon",20],["Tue",20],["Wed",20],["Thu",20],["Fri",20],["Sat",25],["Sun",25]];
 return `<div class="card blue"><div class="eyebrow">Wise spending</div><div class="title">Weekly budget</div><div class="money">${money(remain)}</div><div class="small">${money(state.weeklyBudget)} budget • ${money(state.spentThisWeek)} spent</div><div class="progress"><i style="width:${pct(state.spentThisWeek,state.weeklyBudget)}%"></i></div></div>
 <div class="card"><div class="title">Add expense</div><div class="split"><input class="input" id="expName" placeholder="What?"><input class="input" id="expAmt" inputmode="decimal" placeholder="$"></div><button class="btn" id="addExpense">Add expense</button></div>
 <div class="card"><div class="title">Daily targets</div>${days.map(x=>`<div class="expense"><span>${x[0]}</span><b>${money(x[1])}</b></div>`).join("")}</div>
 <div class="card"><div class="title">Recent expenses</div>${state.expenses.length?state.expenses.slice(-8).reverse().map(e=>`<div class="expense"><span>${esc(e.name)}<br><span class="small">${e.date}</span></span><b>-${money(e.amount)}</b></div>`).join(""):"<div class='empty'>No expenses yet.</div>"}</div>`;
}
function bind(){
 document.querySelectorAll(".navbtn").forEach(b=>b.onclick=()=>{state.activeTab=b.dataset.tab;save();render()});
 document.querySelectorAll("[data-paid]").forEach(b=>b.onclick=()=>{const bill=state.bills.find(x=>x.id===b.dataset.paid);if(bill){bill.paid=!bill.paid;save();render()}});
 const eb=document.getElementById("editBalances"); if(eb) eb.onclick=editBalances;
 const ebl=document.getElementById("editBills"); if(ebl) ebl.onclick=editBills;
 const ta=document.getElementById("todayAction"); if(ta) ta.onclick=()=>{state.activeTab="payday";save();render();haptic()};
 const er=document.getElementById("editRunway"); if(er) er.onclick=editRunway;
 const rp=document.getElementById("resetPlan"); if(rp) rp.onclick=resetPlan;
 const cp=document.getElementById("calcPay"); if(cp) cp.onclick=runPay;
 const ct=document.getElementById("calcTips"); if(ct) ct.onclick=runTips;
 const ae=document.getElementById("addExpense"); if(ae) ae.onclick=addExpense;
 document.getElementById("settingsBtn").onclick=settings;
}
function runPay(){
 const n=parseFloat(document.getElementById("payAmount").value);
 const out=document.getElementById("payResult");
 if(!Number.isFinite(n)||n<=0){
   out.innerHTML=`<div class="card"><div class="notice">Enter the actual paycheque amount first.</div></div>`;
   return;
 }

 let remaining=n, lines=[];
 const add=(label,amt,destination,type)=> {
   if(amt<=0) return;
   amt=Math.min(amt,remaining);
   remaining-=amt;
   lines.push({label,amt,destination,type});
 };

 // Priority order: essential bill bucket -> locked Mastercard minimum ->
 // weekly spending -> savings minimum -> remaining debt target.
 add("Fund Shakepay to $419.23",Math.max(0,419.23-state.accounts.shakepay),"Shakepay","transfer");
 add("Mastercard minimum payment",Math.min(50,state.accounts.mastercard),"Mastercard","debt");
 add("Weekly Wise spending",Math.min(150,Math.max(0,state.weeklyBudget-state.spentThisWeek)),"Wise","transfer");
 add("Build Savings to $1,000",Math.max(0,1000-state.accounts.savings),"Savings","transfer");
 if(remaining>0) add("Remaining → RBC Visa",remaining,"RBC Visa","debt");

 const result=`<div class="card">
   <div class="eyebrow">Your plan</div>
   <div class="title">${money(n)} paycheque</div>
   ${lines.map(x=>`<div class="expense"><span>${x.label}<br><span class="small">→ ${x.destination}</span></span><b>${money(x.amt)}</b></div>`).join("")}
   <div class="notice" style="margin-top:12px">When you apply this plan, the money is routed into these destinations. It will not sit in Chequing as unallocated money.</div>
   <button class="btn" id="applyPay">Apply this plan</button>
 </div>`;
 out.innerHTML=result;

 document.getElementById("applyPay").onclick=()=>{
   // Deposit the actual paycheque into Chequing first, then immediately
   // route each allocation out of Chequing into its destination.
   state.accounts.chequing += n;

   lines.forEach(x=>{
     state.accounts.chequing -= x.amt;

     if(x.destination==="Shakepay"){
       state.accounts.shakepay += x.amt;
     } else if(x.destination==="Wise"){
       state.accounts.wise += x.amt;
     } else if(x.destination==="Savings"){
       state.accounts.savings += x.amt;
     } else if(x.destination==="Mastercard"){
       state.accounts.mastercard=Math.max(0,state.accounts.mastercard-x.amt);
     } else if(x.destination==="RBC Visa"){
       state.accounts.rbc=Math.max(0,state.accounts.rbc-x.amt);
     }
   });

   // Keep floating-point noise out of the displayed balance.
   state.accounts.chequing=Math.round(state.accounts.chequing*100)/100;

   state.incomeLog.push({
     type:"paycheque",
     amount:n,
     allocations:lines.map(x=>({destination:x.destination,amount:x.amt})),
     date:new Date().toLocaleDateString("en-CA")
   });

   save();
   render();
 };
}
function runTips(){
 const n=parseFloat(document.getElementById("tipAmount").value),out=document.getElementById("tipResult");
 if(!Number.isFinite(n)||n<=0){out.innerHTML=`<div class="card"><div class="notice">Enter the actual tip amount first.</div></div>`;return}
 const toShake=Math.min(n,Math.max(0,419.23-state.accounts.shakepay)),toRbc=n-toShake;
 out.innerHTML=`<div class="card"><div class="eyebrow">Your plan</div>${toShake?`<div class="expense"><span>Shakepay</span><b>${money(toShake)}</b></div>`:""}<div class="expense"><span>RBC Visa</span><b>${money(toRbc)}</b></div><button class="btn" id="applyTips">Apply this plan</button></div>`;
 document.getElementById("applyTips").onclick=()=>{
   state.accounts.shakepay+=toShake;state.accounts.rbc=Math.max(0,state.accounts.rbc-toRbc);
   state.incomeLog.push({type:"tips",amount:n,date:new Date().toLocaleDateString("en-CA")});
   save();render();
 };
}
function addExpense(){
 const name=document.getElementById("expName").value.trim(),n=parseFloat(document.getElementById("expAmt").value);
 if(!name||!Number.isFinite(n)||n<=0)return;
 state.expenses.push({name,amount:n,date:new Date().toLocaleDateString("en-CA")});
 state.spentThisWeek+=n;state.accounts.wise=Math.max(0,state.accounts.wise-n);
 save();render();
}
function editBalances(){
 const fields=[["chequing","Chequing"],["savings","Savings"],["wise","Wise"],["rent","Rent"],["shakepay","Shakepay"],["cash","Cash"],["rbc","RBC Visa"],["mastercard","Mastercard"]];
 showModal(`<button class="close" id="close">×</button><div class="eyebrow">Edit balances</div><div class="title">Update your real numbers</div>${fields.map(([id,n])=>`<div style="margin:9px 0"><label class="label">${n}</label><input class="input bal" data-id="${id}" value="${state.accounts[id]}"></div>`).join("")}<button class="btn" id="saveBalances">Save balances</button>`);
 document.getElementById("close").onclick=closeModal;
 document.getElementById("saveBalances").onclick=()=>{document.querySelectorAll(".bal").forEach(i=>{const n=parseFloat(i.value);if(Number.isFinite(n)&&n>=0)state.accounts[i.dataset.id]=n});save();closeModal();render()};
}
function editRunway(){
 showModal(`<button class="close" id="close">×</button><div class="eyebrow">30-day runway</div><div class="title">Edit estimates</div><div class="small">Planning estimates only. Actual income goes through Payday or Tips.</div><label class="label" style="margin-top:12px">Expected income</label><input class="input runIncome" inputmode="decimal" value="${state.runway.estimatedIncome}"><label class="label">Expected spending</label><input class="input runSpend" inputmode="decimal" value="${state.runway.estimatedSpending}"><label class="label">Expected savings</label><input class="input runSave" inputmode="decimal" value="${state.runway.estimatedSavings}"><button class="btn" id="saveRunway">Save estimates</button>`);
 document.getElementById("close").onclick=closeModal;
 document.getElementById("saveRunway").onclick=()=>{let a=parseFloat(document.querySelector(".runIncome").value),b=parseFloat(document.querySelector(".runSpend").value),c=parseFloat(document.querySelector(".runSave").value);if(Number.isFinite(a)&&a>=0)state.runway.estimatedIncome=a;if(Number.isFinite(b)&&b>=0)state.runway.estimatedSpending=b;if(Number.isFinite(c)&&c>=0)state.runway.estimatedSavings=c;save();closeModal();render()};
}
function resetPlan(){
 showModal(`<button class="close" id="close">×</button><div class="eyebrow">RESET</div><div class="title">No judgment. Let's rebuild.</div><div class="small">Choose what happened. Your balances stay intact.</div><div class="list" style="margin-top:12px">${["Overspent","Unexpected bill","Lower paycheque","Used credit","Other"].map(x=>`<button class="btn secondary resetReason" data-reason="${x}">${x}</button>`).join("")}</div>`);
 document.getElementById("close").onclick=closeModal;
 document.querySelectorAll(".resetReason").forEach(b=>b.onclick=()=>{state.resetReason=b.dataset.reason;state.mission="Reset complete — follow the next action, one step at a time.";save();closeModal();render();haptic()});
}
function editBills(){
 showModal(`<button class="close" id="close">×</button>
 <div class="eyebrow">Bills</div>
 <div class="title">Edit your monthly bills</div>
 <div class="small" style="margin-bottom:12px">Update amounts, due dates, and whether each bill is already paid.</div>
 ${state.bills.map((b,i)=>`<div class="card" style="margin:9px 0">
   <label class="label">Bill name</label><input class="input billName" data-i="${i}" value="${esc(b.name)}">
   <div class="split" style="margin-top:9px">
     <div><label class="label">Amount</label><input class="input billAmount" data-i="${i}" inputmode="decimal" value="${b.amount}"></div>
     <div><label class="label">Due date</label><input class="input billDue" data-i="${i}" type="date" value="${esc(b.due)}"></div>
   </div>
   <label class="check"><input type="checkbox" class="billPaid" data-i="${i}" ${b.paid?"checked":""}> Paid</label>
 </div>`).join("")}
 <button class="btn" id="saveBills">Save bills</button>
 <button class="btn secondary" id="addBill">+ Add bill</button>`);
 document.getElementById("close").onclick=closeModal;
 document.getElementById("saveBills").onclick=()=>{
   document.querySelectorAll(".billName").forEach(i=>{
     const idx=Number(i.dataset.i);
     state.bills[idx].name=i.value.trim()||state.bills[idx].name;
   });
   document.querySelectorAll(".billAmount").forEach(i=>{
     const idx=Number(i.dataset.i),n=parseFloat(i.value);
     if(Number.isFinite(n)&&n>=0) state.bills[idx].amount=n;
   });
   document.querySelectorAll(".billDue").forEach(i=>{
     const idx=Number(i.dataset.i);
     if(i.value) state.bills[idx].due=i.value;
   });
   document.querySelectorAll(".billPaid").forEach(i=>{
     state.bills[Number(i.dataset.i)].paid=i.checked;
   });
   save();closeModal();render();
 };
 document.getElementById("addBill").onclick=()=>{
   state.bills.push({id:"bill-"+Date.now(),name:"New Bill",amount:0,due:new Date().toISOString().slice(0,10),paid:false,account:"chequing"});
   save();
   editBills();
 };
}

function settings(){
 showModal(`<button class="close" id="close">×</button><div class="eyebrow">Settings</div><div class="title">RESET</div>
 <div class="notice">Black + white UI with a minor blue accent. Data is stored on this device in local storage.</div>
 <button class="btn secondary" id="resetWeek">Reset weekly spending</button>
 <button class="btn danger" id="resetAll">Reset app to current starting balances</button>
 <div class="small" style="margin-top:10px">Reset app restores the October reset numbers used when this app was built.</div>`);
 document.getElementById("close").onclick=closeModal;
 document.getElementById("resetWeek").onclick=()=>{state.spentThisWeek=0;state.expenses=[];save();closeModal();render()};
 document.getElementById("resetAll").onclick=()=>{if(confirm("Reset all app data?")){state=structuredClone(initial);save();closeModal();render()}};
}
function showModal(html){document.getElementById("modalContent").innerHTML=html;document.getElementById("modal").classList.remove("hidden")}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
render();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
