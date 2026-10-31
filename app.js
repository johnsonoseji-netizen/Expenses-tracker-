// EXPENSE TRACKER v144 - NOTIFICATION FIXED + ANIMATION
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

function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem('currentUser')||'null'); }catch(e){ return null; } }
function getUserKey(k){ const u=getCurrentUser(); return u?`${k}_${u.email.toLowerCase()}`:k; }

// ===== NOTIFICATION SYSTEM FIXED =====
function loadNotifs(){
  try{ notifications=JSON.parse(localStorage.getItem(getUserKey('notifications'))||'[]'); }catch(e){ notifications=[]; }
  updateNotifUI();
}
function saveNotifs(){
  localStorage.setItem(getUserKey('notifications'), JSON.stringify(notifications));
}
function addNotif(msg){
  const now = new Date().toLocaleString();
  notifications.unshift({id:Date.now(), msg, time: now});
  if(notifications.length>30) notifications=notifications.slice(0,30);
  saveNotifs();
  updateNotifUI();
  // Bell animation
  const bell=document.getElementById('notifBell');
  if(bell){ bell.style.animation='bellRing 0.5s'; setTimeout(()=>bell.style.animation='',600); }
}
function updateNotifUI(){
  const dot=document.querySelector('.dot');
  const count=notifications.length;
  if(dot){
    if(count>0){ 
      dot.style.display='grid'; 
      dot.textContent=count>9?'9+':count;
      dot.style.animation='popIn 0.3s';
    } else dot.style.display='none';
  }
  const list=document.getElementById('notifList');
  const countEl=document.getElementById('notifCountBadge');
  if(countEl) countEl.textContent=count;
  if(list){
    if(notifications.length===0) list.innerHTML='<p style="padding:30px;text-align:center;color:#888">No notifications yet<br><small>Add transaction to see here</small></p>';
    else list.innerHTML=notifications.map(n=>`<div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;animation: slideIn 0.3s"><div style="width:36px;height:36px;background:#f0f7ff;border-radius:10px;display:grid;place-items:center;flex-shrink:0">🔔</div><div style="flex:1"><div style="font-size:14px;font-weight:500;color:#222;line-height:1.4">${n.msg}</div><small style="color:#888;font-size:12px">${n.time}</small></div></div>`).join('');
  }
}
function initNotifPanel(){
  if(document.getElementById('notifPanel')) return;
  // Inject CSS animation
  const style=document.createElement('style');
  style.innerHTML=`
    @keyframes slideDown{ from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes slideIn{ from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes bellRing{ 0%,100%{transform:rotate(0)} 20%{transform:rotate(-15deg)} 40%{transform:rotate(15deg)} 60%{transform:rotate(-10deg)} 80%{transform:rotate(10deg)} }
    @keyframes popIn{ 0%{transform:scale(0)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
    #notifPanel{animation: slideDown 0.35s ease}
    #notifOverlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:9998;display:none}
  `;
  document.head.appendChild(style);
  
  const overlay=document.createElement('div');
  overlay.id='notifOverlay';
  overlay.onclick=()=>{ document.getElementById('notifPanel').style.display='none'; overlay.style.display='none'; };
  document.body.appendChild(overlay);

  const panel=document.createElement('div');
  panel.id='notifPanel';
  panel.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid #eee;background:#fafafa;border-radius:16px 16px 0 0">
      <div><b style="font-size:16px">Notifications</b> <span id="notifCountBadge" style="background:#0a53a5;color:white;padding:2px 8px;border-radius:10px;font-size:12px;margin-left:6px">0</span></div>
      <div style="display:flex;gap:8px"><button id="clearNotifs" style="border:none;background:#eee;padding:6px 12px;border-radius:20px;font-size:13px">Clear all</button><button id="closeNotif" style="border:none;background:#f0f0f0;width:32px;height:32px;border-radius:50%;font-size:16px">✕</button></div>
    </div>
    <div id="notifList" style="max-height:65vh;overflow:auto;background:white;border-radius:0 0 16px 16px"></div>
  `;
  panel.style.cssText='position:fixed;top:70px;right:12px;left:12px;max-width:360px;margin-left:auto;background:white;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.25);z-index:9999;display:none;';
  document.body.appendChild(panel);
  
  const bell=document.getElementById('notifBell');
  if(bell){
    bell.style.cursor='pointer';
    bell.style.transition='transform 0.2s';
    bell.onclick=()=>{
      const p=document.getElementById('notifPanel');
      const o=document.getElementById('notifOverlay');
      const isHidden=p.style.display==='none' || p.style.display==='';
      p.style.display=isHidden?'block':'none';
      o.style.display=isHidden?'block':'none';
      if(isHidden) updateNotifUI();
    };
  }
  document.getElementById('closeNotif').onclick=()=>{
    document.getElementById('notifPanel').style.display='none';
    document.getElementById('notifOverlay').style.display='none';
  };
  document.getElementById('clearNotifs').onclick=()=>{
    if(confirm('Clear all notifications?')){
      notifications=[]; saveNotifs(); updateNotifUI();
    }
  };
}

function checkAuth(){
  const user=getCurrentUser();
  const auth=document.getElementById('auth');
  const header=document.getElementById('mainHeader');
  const nav=document.getElementById('mainNav');
  const debug=document.getElementById('authDebug');
  if(debug){
    let users=[]; try{ users=JSON.parse(localStorage.getItem('users')||'[]'); }catch(e){}
    debug.textContent=users.length+' account(s). Demo: princeoseji@gmail.com / 123456';
  }
  if(user){
    if(auth){ auth.style.display='none'; auth.classList.remove('active'); }
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
    initNotifPanel();
    loadNotifs();
    loadUserData();
  } else {
    if(auth){ auth.style.display='block'; auth.classList.add('active'); }
    if(header) header.style.display='none';
    if(nav) nav.style.display='none';
    document.querySelectorAll('.page').forEach(p=>{ if(p.id!=='auth') p.classList.remove('active'); });
  }
}

const loginTab=document.getElementById('loginTab');
const registerTab=document.getElementById('registerTab');
const loginForm=document.getElementById('loginForm');
const registerForm=document.getElementById('registerForm');
if(loginTab){
  loginTab.onclick=()=>{
    loginTab.classList.add('active'); registerTab.classList.remove('active');
    if(loginForm) loginForm.style.display='block'; 
    if(registerForm) registerForm.style.display='none';
  };
}
if(registerTab){
  registerTab.onclick=()=>{
    registerTab.classList.add('active'); loginTab.classList.remove('active');
    if(loginForm) loginForm.style.display='none'; 
    if(registerForm) registerForm.style.display='block';
  };
}
const registerBtn=document.getElementById('registerBtn');
if(registerBtn){
  registerBtn.onclick=()=>{
    const name=document.getElementById('regName').value.trim();
    let email=document.getElementById('regEmail').value.trim().toLowerCase();
    const p1=document.getElementById('regPass').value;
    const p2=document.getElementById('regPass2').value;
    if(!name||!email||!p1) return alert('Fill all fields');
    if(p1!==p2) return alert('Passwords do not match');
    let users=JSON.parse(localStorage.getItem('users')||'[]');
    if(users.find(u=>u.email.toLowerCase()===email)) return alert('Email exists! Go to Login.');
    const newUser={name,email,pass:p1,pic:'',since:new Date().getFullYear()};
    users.push(newUser);
    localStorage.setItem('users',JSON.stringify(users));
    localStorage.setItem('currentUser',JSON.stringify(newUser));
    alert('Welcome '+name);
    checkAuth();
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
    if(!u) return alert('Wrong password! Use princeoseji@gmail.com / 123456');
    localStorage.setItem('currentUser',JSON.stringify(u));
    checkAuth();
  };
}
const logoutBtn=document.getElementById('logoutBtn');
if(logoutBtn) logoutBtn.onclick=()=>{ if(confirm('Logout?')){ localStorage.removeItem('currentUser'); location.reload(); } };

function loadUserData(){
  try{ transactions=JSON.parse(localStorage.getItem(getUserKey('transactions'))||'[]'); }catch(e){ transactions=[]; }
  salary=parseFloat(localStorage.getItem(getUserKey('salary'))||'0');
  const inp=document.getElementById('salaryInput'); if(inp) inp.value=salary||'';
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

const setSalaryBtn=document.getElementById('setSalary');
if(setSalaryBtn) setSalaryBtn.onclick=()=>{
  const v=parseFloat(document.getElementById('salaryInput').value);
  if(!v||v<=0) return alert('Enter valid salary');
  salary=v; saveData(); updateUI();
  addNotif(`💰 Salary set to <b>₦${v.toLocaleString()}</b>`);
};
const addBtn=document.getElementById('addBtn');
if(addBtn) addBtn.onclick=()=>{
  const amount=parseFloat(document.getElementById('amount').value);
  const category=document.getElementById('category').value;
  const date=document.getElementById('date').value||new Date().toISOString().split('T')[0];
  if(!amount||!category) return alert('Enter amount and category');
  transactions.unshift({id:Date.now(), amount, category, date});
  const amt=document.getElementById('amount'); if(amt) amt.value='';
  const cat=document.getElementById('category'); if(cat) cat.value='';
  saveData(); updateUI();
  addNotif(`💸 Spent <b>₦${amount}</b> on <b>${category}</b> • ${date}`);
};
const resetBtn=document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick=()=>{
  if(confirm('Reset all?')){
    transactions=[]; saveData(); updateUI();
    addNotif(`🗑️ All transactions were reset`);
  }
};
const profileResetBtn=document.getElementById('profileResetBtn');
if(profileResetBtn) profileResetBtn.onclick=()=>{
  if(confirm('Reset all data?')){
    transactions=[]; salary=0; saveData(); updateUI();
    addNotif(`⚠️ All data cleared - salary reset`);
  }
};

function updateUI(){
  const totalExp=transactions.reduce((s,t)=>s+t.amount,0);
  const balance=salary-totalExp;
  const set=(id,val)=>{ const e=document.getElementById(id); if(e) e.textContent=val; };
  set('totalBal','₦'+balance.toLocaleString());
  set('incomeVal','+₦'+salary.toLocaleString());
  set('expVal','-₦'+totalExp.toLocaleString());
  set('bIncome','₦'+salary.toLocaleString());
  set('bExp','₦'+totalExp.toLocaleString());
  set('bSpent','₦'+totalExp.toLocaleString());
  set('bRem','₦'+(2000-totalExp).toLocaleString());
  set('pBal','₦'+balance.toLocaleString());
  set('pIncome','+₦'+salary.toLocaleString());
  set('pExp','-₦'+totalExp.toLocaleString());
  set('aTotal','₦'+totalExp.toLocaleString());
  set('aAvg','₦'+(transactions.length?Math.round(totalExp/30):0).toLocaleString());
  const list=document.getElementById('transList');
  const icons={Food:'🍔',Transport:'🚌',Shopping:'🛍️',Bills:'💡'};
  if(list){
    if(transactions.length===0) list.innerHTML='No transactions yet';
    else list.innerHTML=transactions.slice(0,5).map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #eee;animation: slideIn 0.3s"><div style="display:flex;align-items:center;gap:10px"><span style="width:38px;height:38px;background:#f5f5f7;border-radius:10px;display:grid;place-items:center;font-size:18px">${icons[t.category]||'💰'}</span><div><b>${t.category}</b><br><small style="color:#888">${t.date}</small></div></div><b style="color:#c94c4c">-₦${t.amount}</b></div>`).join('');
  }
  updateBudget();
}
function updateBudget(){
  const cats={Food:0,Transport:0,Shopping:0,Bills:0};
  transactions.forEach(t=>{ if(cats[t.category]!==undefined) cats[t.category]+=t.amount; });
  const total=Object.values(cats).reduce((a,b)=>a+b,0);
  const container=document.getElementById('budgetCats'); if(!container) return;
  const icons={Food:'🍔',Transport:'🚌',Shopping:'🛍️',Bills:'💡'};
  const classes={Food:'food',Transport:'trans',Shopping:'shop',Bills:'bills'};
  container.innerHTML=Object.keys(cats).map(k=>{
    const pct=total?Math.min(100,Math.round((cats[k]/2000)*100)):0;
    return `<div class="budget-cat ${classes[k]}"><div class="budget-cat-top"><div class="budget-cat-left"><span class="cat-icon">${icons[k]}</span><div><b>${k}</b><small>₦${cats[k]} spent</small></div></div><div class="budget-cat-right">₦${cats[k]}</div></div><div class="progress"><div style="width:${pct}%;transition:width 0.8s ease"></div></div></div>`;
  }).join('');
  const bProg=document.getElementById('bProg'); if(bProg) bProg.style.width=Math.min(100,Math.round((total/2000)*100))+'%';
  const tip=document.getElementById('tipPct'); if(tip) tip.textContent=Math.min(100,Math.round((total/2000)*100))+'%';
}
function renderCharts(){
  const cats={Food:0,Transport:0,Shopping:0,Bills:0};
  transactions.forEach(t=>{ if(cats[t.category]!==undefined) cats[t.category]+=t.amount; });
  const ctx1=document.getElementById('donutChart');
  if(ctx1){
    if(donutChart) donutChart.destroy();
    donutChart=new Chart(ctx1,{ type:'doughnut', data:{ labels:Object.keys(cats), datasets:[{data:Object.values(cats), backgroundColor:['#ff7a00','#4a90e2','#e94e9a','#4caf50']}] }, options:{responsive:true, animation:{animateScale:true,duration:1000}, plugins:{legend:{display:false}}} });
  }
  const ctx2=document.getElementById('barChart');
  if(ctx2){
    if(barChart) barChart.destroy();
    const months={}; transactions.forEach(t=>{ const m=t.date.slice(0,7); months[m]=(months[m]||0)+t.amount; });
    barChart=new Chart(ctx2,{ type:'bar', data:{ labels:Object.keys(months), datasets:[{label:'Spending', data:Object.values(months), backgroundColor:'#4a90e2'}] }, options:{responsive:true, animation:{duration:1000}, plugins:{legend:{display:false}}} });
  }
}
const seeAllBtn=document.getElementById('seeAllBtn');
if(seeAllBtn) seeAllBtn.onclick=()=>{
  const modal=document.getElementById('historyModal'); if(modal) modal.classList.add('show');
  const list=document.getElementById('fullHistoryList');
  const icons2={Food:'🍔',Transport:'🚌',Shopping:'🛍️',Bills:'💡'};
  if(list) list.innerHTML=transactions.length?transactions.map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #eee"><div style="display:flex;align-items:center;gap:10px"><span style="width:36px;height:36px;background:#f5f5f7;border-radius:10px;display:grid;place-items:center">${icons2[t.category]||'💰'}</span><span><b>${t.category}</b><br><small>${t.date}</small></span></div><b>₦${t.amount}</b></div>`).join(''):'No history';
  const cnt=document.getElementById('historyCount'); if(cnt) cnt.textContent=transactions.length;
  const tot=document.getElementById('historyTotal'); if(tot) tot.textContent='₦'+transactions.reduce((s,t)=>s+t.amount,0);
};
const closeHistory=document.getElementById('closeHistory');
if(closeHistory) closeHistory.onclick=()=>{ const m=document.getElementById('historyModal'); if(m) m.classList.remove('show'); };
const exportBtn=document.getElementById('exportBtn');
if(exportBtn) exportBtn.onclick=()=>{
  const data={user:getCurrentUser(),salary,transactions};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='expense-data.json'; a.click();
  addNotif(`📄 Data exported as JSON`);
};
const darkToggle=document.getElementById('darkModeToggle');
if(darkToggle){
  darkToggle.onchange=(e)=>{
    document.body.classList.toggle('dark', e.target.checked);
    localStorage.setItem('darkMode', e.target.checked);
  };
  if(localStorage.getItem('darkMode')==='true'){ document.body.classList.add('dark'); darkToggle.checked=true; }
}
checkAuth();