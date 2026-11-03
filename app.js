// EXPENSE TRACKER v147 - FINAL - SALARY ADDS UP
let transactions = [];
let salary = 0;
let donutChart, barChart;
let notifications = [];

(function(){
  let users=[]; 
  try{ users=JSON.parse(localStorage.getItem('users')||'[]'); }catch(e){}
  if(users.length===0){
    users.push({name:'Prince Oseji', email:'princeoseji@gmail.com', pass:'123456', pic:'', since:2024});
    localStorage.setItem('users', JSON.stringify(users));
  }
})();

function getCurrentUser(){ 
  try{ return JSON.parse(localStorage.getItem('currentUser')||'null'); }catch(e){ return null; } 
}
function getUserKey(k){ 
  const u=getCurrentUser(); 
  return u?`${k}_${u.email.toLowerCase()}`:k; 
}

// DARK MODE CSS
(function injectDarkModeCSS(){
  if(document.getElementById('darkModeFix')) return;
  const s=document.createElement('style');
  s.id='darkModeFix';
  s.innerHTML=` body.dark{ background:#121212 !important; color:#e0e0e0 !important; } body.dark .top, body.dark .budget-top{ background:#0d4d2d !important; } body.dark .section, body.dark .box, body.dark .input-box, body.dark .salary-box, body.dark .history-container{ background:#1e1e1e !important; color:#e0e0e0 !important; border-color:#333 !important; } body.dark .nav div.active{ color:#159957 !important; } `;
  document.head.appendChild(s);
})();

// NOTIFICATIONS
function loadNotifs(){
  try{ notifications=JSON.parse(localStorage.getItem(getUserKey('notifications'))||'[]'); }catch(e){ notifications=[]; }
  updateNotifUI();
}
function saveNotifs(){ localStorage.setItem(getUserKey('notifications'), JSON.stringify(notifications)); }
function addNotif(msg){
  const now = new Date().toLocaleString();
  notifications.unshift({id:Date.now(), msg, time: now});
  if(notifications.length>30) notifications=notifications.slice(0,30);
  saveNotifs(); updateNotifUI();
}
function updateNotifUI(){
  const dot=document.querySelector('.dot');
  const count=notifications.length;
  if(dot){
    if(count>0){ dot.style.display='grid'; dot.textContent=count>9?'9+':count; }
    else dot.style.display='none';
  }
  const list=document.getElementById('notifList');
  const countEl=document.getElementById('notifCountBadge');
  if(countEl) countEl.textContent=count;
  if(list){
    if(notifications.length===0) list.innerHTML='<p style="padding:30px;text-align:center;color:#888">No notifications</p>';
    else list.innerHTML=notifications.map(n=>`<div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;"><div style="width:36px;height:36px;background:#e8f5e9;border-radius:10px;display:grid;place-items:center;">🔔</div><div style="flex:1"><div style="font-size:14px;">${n.msg}</div><small style="color:#888;">${n.time}</small></div></div>`).join('');
  }
}
function initNotifPanel(){
  if(document.getElementById('notifPanel')) return;
  const overlay=document.createElement('div'); overlay.id='notifOverlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:9998;display:none';
  overlay.onclick=()=>{ document.getElementById('notifPanel').style.display='none'; overlay.style.display='none'; };
  document.body.appendChild(overlay);
  const panel=document.createElement('div'); panel.id='notifPanel';
  panel.innerHTML=`<div style="display:flex;justify-content:space-between;padding:16px;border-bottom:1px solid #eee;background:#fafafa;border-radius:16px 16px 0 0"><div><b>Notifications</b> <span id="notifCountBadge" style="background:#159957;color:white;padding:2px 8px;border-radius:10px;font-size:12px;margin-left:6px">0</span></div><div style="display:flex;gap:8px"><button id="clearNotifs" style="border:none;background:#eee;padding:6px 12px;border-radius:20px;">Clear all</button><button id="closeNotif" style="border:none;background:#f0f0f0;width:32px;height:32px;border-radius:50%;">✕</button></div></div><div id="notifList" style="max-height:65vh;overflow:auto;background:white;border-radius:0 0 16px 16px"></div>`;
  panel.style.cssText='position:fixed;top:70px;right:12px;left:12px;max-width:360px;margin-left:auto;background:white;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.25);z-index:9999;display:none;';
  document.body.appendChild(panel);
  const bell=document.getElementById('notifBell');
  if(bell){ bell.style.cursor='pointer'; bell.onclick=()=>{ const p=document.getElementById('notifPanel'); const o=document.getElementById('notifOverlay'); const isHidden=p.style.display==='none'||p.style.display===''; p.style.display=isHidden?'block':'none'; o.style.display=isHidden?'block':'none'; if(isHidden) updateNotifUI(); }; }
  document.getElementById('closeNotif').onclick=()=>{ document.getElementById('notifPanel').style.display='none'; document.getElementById('notifOverlay').style.display='none'; };
  document.getElementById('clearNotifs').onclick=()=>{ if(confirm('Clear all?')){ notifications=[]; saveNotifs(); updateNotifUI(); } };
}

// AUTH
function checkAuth(){
  const user=getCurrentUser();
  const auth=document.getElementById('auth');
  const header=document.getElementById('mainHeader');
  const nav=document.getElementById('mainNav');
  if(user){
    if(auth) auth.style.display='none';
    if(header) header.style.display='flex';
    if(nav) nav.style.display='flex';
    document.querySelectorAll('.page').forEach(p=>{ if(p.id!=='auth') p.classList.remove('active'); });
    const home=document.getElementById('home'); if(home) home.classList.add('active');
    document.querySelectorAll('#mainNav div').forEach(d=>d.classList.remove('active'));
    const h=document.querySelector('#mainNav div[data-page="home"]'); if(h) h.classList.add('active');
    const nameEl=document.getElementById('ownerNameDisplay'); if(nameEl) nameEl.textContent=user.name;
    const emailEl=document.getElementById('ownerEmailDisplay'); if(emailEl) emailEl.textContent=user.email;
    const headerName=document.getElementById('headerName'); if(headerName) headerName.textContent=user.name;
    const sinceEl=document.getElementById('ownerSince'); if(sinceEl) sinceEl.textContent='Member since '+(user.since||2024);
    initNotifPanel(); loadNotifs(); loadUserData();
  } else {
    if(auth){ auth.style.display='block'; auth.classList.add('active'); }
    if(header) header.style.display='none';
    if(nav) nav.style.display='none';
  }
}

const loginTab=document.getElementById('loginTab');
const registerTab=document.getElementById('registerTab');
const loginForm=document.getElementById('loginForm');
const registerForm=document.getElementById('registerForm');
if(loginTab){ loginTab.onclick=()=>{ loginTab.classList.add('active'); registerTab.classList.remove('active'); loginForm.style.display='block'; registerForm.style.display='none'; }; }
if(registerTab){ registerTab.onclick=()=>{ registerTab.classList.add('active'); loginTab.classList.remove('active'); loginForm.style.display='none'; registerForm.style.display='block'; }; }

const registerBtn=document.getElementById('registerBtn');
if(registerBtn){
  registerBtn.onclick=()=>{
    const name=document.getElementById('regName').value.trim();
    let email=document.getElementById('regEmail').value.trim().toLowerCase();
    const p1=document.getElementById('regPass').value;
    const p2=document.getElementById('regPass2').value;
    if(!name||!email||!p1) return alert('Fill all fields');
    if(p1!==p2) return alert('Passwords no match');
    let users=JSON.parse(localStorage.getItem('users')||'[]');
    if(users.find(u=>u.email.toLowerCase()===email)) return alert('Email exists!');
    const newUser={name,email,pass:p1,pic:'',since:new Date().getFullYear()};
    users.push(newUser); localStorage.setItem('users',JSON.stringify(users));
    localStorage.setItem('currentUser',JSON.stringify(newUser));
    alert('Welcome '+name); checkAuth();
  };
}
const loginBtn=document.getElementById('loginBtn');
if(loginBtn){
  loginBtn.onclick=()=>{
    let email=document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass=document.getElementById('loginPass').value;
    if(!email||!pass) return alert('Enter email & password');
    let users=JSON.parse(localStorage.getItem('users')||'[]');
    const u=users.find(x=>x.email.toLowerCase()===email && x.pass===pass);
    if(!u) return alert('Wrong password!');
    localStorage.setItem('currentUser',JSON.stringify(u)); checkAuth();
  };
}
const logoutBtn=document.getElementById('logoutBtn');
if(logoutBtn) logoutBtn.onclick=()=>{ if(confirm('Logout?')){ localStorage.removeItem('currentUser'); location.reload(); } };

function loadUserData(){
  try{ transactions=JSON.parse(localStorage.getItem(getUserKey('transactions'))||'[]'); }catch(e){ transactions=[]; }
  salary=parseFloat(localStorage.getItem(getUserKey('salary'))||'0');
  const inp=document.getElementById('salaryInput'); if(inp) inp.value='';
  updateUI();
}
function saveData(){
  localStorage.setItem(getUserKey('transactions'), JSON.stringify(transactions));
  localStorage.setItem(getUserKey('salary'), salary);
}

document.querySelectorAll('#mainNav div').forEach(el=>{
  el.addEventListener('click',()=>{
    const page=el.dataset.page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const target=document.getElementById(page); if(target) target.classList.add('active');
    document.querySelectorAll('#mainNav div').forEach(d=>d.classList.remove('active'));
    el.classList.add('active');
    if(page==='analysis') renderCharts();
    if(page==='budget') updateBudget();
  });
});

// ===== FIXED: SALARY NOW ADDS UP =====
const setSalaryBtn=document.getElementById('setSalary');
if(setSalaryBtn){
  setSalaryBtn.onclick=()=>{
    const input=document.getElementById('salaryInput');
    const v=parseFloat(input.value);
    if(!v||v<=0) return alert('Enter valid amount');
    salary += v; // ADD, NOT REPLACE - 2000+1000=3000
    input.value='';
    saveData(); updateUI();
    addNotif(`💰 Added <b>₦${v.toLocaleString()}</b> to salary. Total: <b>₦${salary.toLocaleString()}</b>`);
  };
}

const addBtn=document.getElementById('addBtn');
if(addBtn){
  addBtn.onclick=()=>{
    const amount=parseFloat(document.getElementById('amount').value);
    const category=document.getElementById('category').value;
    const date=document.getElementById('date').value||new Date().toISOString().split('T')[0];
    if(!amount||!category) return alert('Enter amount and category');
    let type='expense';
    const low=category.toLowerCase();
    if(low.includes('salary')||low.includes('income')) type='income';
    transactions.unshift({id:Date.now(), amount, category, date, type});
    document.getElementById('amount').value='';
    document.getElementById('category').value='';
    saveData(); updateUI();
    if(type==='income') addNotif(`💰 Income <b>₦${amount.toLocaleString()}</b> from <b>${category}</b>`);
    else addNotif(`💸 Spent <b>₦${amount.toLocaleString()}</b> on <b>${category}</b>`);
  };
}

const resetBtn=document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick=()=>{ if(confirm('Reset transactions?')){ transactions=[]; saveData(); updateUI(); addNotif(`🗑️ Transactions reset`); } };
const profileResetBtn=document.getElementById('profileResetBtn');
if(profileResetBtn) profileResetBtn.onclick=()=>{ if(confirm('Reset all data?')){ transactions=[]; salary=0; saveData(); updateUI(); addNotif(`⚠️ All data cleared`); } };

function updateUI(){
  let totalExp=0; let extraIncome=0;
  transactions.forEach(t=>{ if(t.type==='income') extraIncome+=t.amount; else totalExp+=t.amount; });
  const totalIncome = salary + extraIncome;
  const balance = totalIncome - totalExp;
  const budgetLimit = salary>0?salary:2000;
  const set=(id,val)=>{ const e=document.getElementById(id); if(e) e.textContent=val; };
  set('totalBal','₦'+balance.toLocaleString());
  set('incomeVal','+₦'+totalIncome.toLocaleString());
  set('expVal','-₦'+totalExp.toLocaleString());
  set('bIncome','₦'+totalIncome.toLocaleString());
  set('bExp','₦'+totalExp.toLocaleString());
  set('bSpent','₦'+totalExp.toLocaleString());
  set('bRem','₦'+(budgetLimit-totalExp).toLocaleString());
  set('pBal','₦'+balance.toLocaleString());
  set('pIncome','+₦'+totalIncome.toLocaleString());
  set('pExp','-₦'+totalExp.toLocaleString());
  set('aTotal','₦'+totalExp.toLocaleString());
  set('aAvg','₦'+(transactions.length?Math.round(totalExp/30):0).toLocaleString());
  const list=document.getElementById('transList');
  const icons={Food:'🍔',Transport:'🚌',Shopping:'🛍️',Bills:'💡',Salary:'💰',Income:'💰'};
  if(list){
    if(transactions.length===0) list.innerHTML='No transactions yet';
    else list.innerHTML=transactions.slice(0,5).map(t=>{ const isInc=t.type==='income'; return `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee"><div style="display:flex;gap:10px"><span style="width:38px;height:38px;background:${isInc?'#e8f5e9':'#f5f5f7'};border-radius:10px;display:grid;place-items:center">${icons[t.category]||'💰'}</span><div><b>${t.category}</b><br><small style="color:#888">${t.date}</small></div></div><b style="color:${isInc?'#159957':'#c94c4c'}">${isInc?'+':'-'}₦${t.amount.toLocaleString()}</b></div>`; }).join('');
  }
  updateBudget();
}
function updateBudget(){
  const cats={Food:0,Transport:0,Shopping:0,Bills:0};
  transactions.forEach(t=>{ if(t.type!=='income' && cats[t.category]!==undefined) cats[t.category]+=t.amount; });
  const total=Object.values(cats).reduce((a,b)=>a+b,0);
  const container=document.getElementById('budgetCats'); if(!container) return;
  const icons={Food:'🍔',Transport:'🚌',Shopping:'🛍️',Bills:'💡'};
  const budgetLimit = salary>0?salary:2000;
  container.innerHTML=Object.keys(cats).map(k=>{ const pct=budgetLimit?Math.min(100,Math.round((cats[k]/budgetLimit)*100)):0; return `<div class="budget-cat"><div class="budget-cat-top"><div class="budget-cat-left"><span class="cat-icon">${icons[k]}</span><div><b>${k}</b><small>₦${cats[k].toLocaleString()}</small></div></div><div>₦${cats[k].toLocaleString()}</div></div><div class="progress"><div style="width:${pct}%"></div></div></div>`; }).join('');
  const bProg=document.getElementById('bProg'); if(bProg) bProg.style.width=Math.min(100,Math.round((total/budgetLimit)*100))+'%';
}
function renderCharts(){
  const cats={Food:0,Transport:0,Shopping:0,Bills:0};
  transactions.forEach(t=>{ if(t.type!=='income' && cats[t.category]!==undefined) cats[t.category]+=t.amount; });
  const ctx1=document.getElementById('donutChart');
  if(ctx1){ if(donutChart) donutChart.destroy(); donutChart=new Chart(ctx1,{ type:'doughnut', data:{ labels:Object.keys(cats), datasets:[{data:Object.values(cats), backgroundColor:['#ff7a00','#159957','#e94e9a','#4caf50']}] }, options:{responsive:true, plugins:{legend:{display:false}}} }); }
  const ctx2=document.getElementById('barChart');
  if(ctx2){ if(barChart) barChart.destroy(); const months={}; transactions.forEach(t=>{ if(t.type!=='income'){ const m=t.date.slice(0,7); months[m]=(months[m]||0)+t.amount; } }); barChart=new Chart(ctx2,{ type:'bar', data:{ labels:Object.keys(months), datasets:[{label:'Spending', data:Object.values(months), backgroundColor:'#159957'}] }, options:{responsive:true, plugins:{legend:{display:false}}} }); }
}
const seeAllBtn=document.getElementById('seeAllBtn');
if(seeAllBtn) seeAllBtn.onclick=()=>{
  const modal=document.getElementById('historyModal'); if(modal) modal.classList.add('show');
  const list=document.getElementById('fullHistoryList');
  if(list) list.innerHTML=transactions.length?transactions.map(t=>{ const isInc=t.type==='income'; return `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee"><div><b>${t.category}</b> <small>${t.date}</small></div><b>${isInc?'+':'-'}₦${t.amount.toLocaleString()}</b></div>`; }).join(''):'No history';
};
const closeHistory=document.getElementById('closeHistory'); if(closeHistory) closeHistory.onclick=()=>{ document.getElementById('historyModal').classList.remove('show'); };
const exportBtn=document.getElementById('exportBtn'); if(exportBtn) exportBtn.onclick=()=>{ const data={user:getCurrentUser(),salary,transactions}; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='expense-data.json'; a.click(); };
const darkToggle=document.getElementById('darkModeToggle');
if(darkToggle){ darkToggle.onchange=(e)=>{ document.body.classList.toggle('dark', e.target.checked); localStorage.setItem('darkMode', e.target.checked); }; if(localStorage.getItem('darkMode')==='true'){ document.body.classList.add('dark'); darkToggle.checked=true; } }
checkAuth();