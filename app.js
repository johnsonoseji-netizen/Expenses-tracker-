// EXPENSE TRACKER v142 - FULL FIXED - IMAGES RESTORED
let transactions = [];
let salary = 0;
let donutChart, barChart;

(function(){
  let users=[]; try{ users=JSON.parse(localStorage.getItem('users')||'[]'); }catch(e){}
  if(users.length===0){
    users.push({name:'Prince Oseji', email:'princeoseji@gmail.com', pass:'123456', pic:'', since:2024});
    localStorage.setItem('users', JSON.stringify(users));
  }
})();

function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem('currentUser')||'null'); }catch(e){ return null; } }
function getUserKey(k){ const u=getCurrentUser(); return u?`${k}_${u.email.toLowerCase()}`:k; }

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
};

const resetBtn=document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick=()=>{ if(confirm('Reset all?')){ transactions=[]; saveData(); updateUI(); } };
const profileResetBtn=document.getElementById('profileResetBtn');
if(profileResetBtn) profileResetBtn.onclick=()=>{ if(confirm('Reset all data?')){ transactions=[]; salary=0; saveData(); updateUI(); } };

// ===== FIXED WITH IMAGES =====
function updateUI(){
  const totalExp=transactions.reduce((s,t)=>s+t.amount,0);
  const balance=salary-totalExp;
  const totalBal=document.getElementById('totalBal'); if(totalBal) totalBal.textContent='₦'+balance.toLocaleString();
  const incomeVal=document.getElementById('incomeVal'); if(incomeVal) incomeVal.textContent='+₦'+salary.toLocaleString();
  const expVal=document.getElementById('expVal'); if(expVal) expVal.textContent='-₦'+totalExp.toLocaleString();
  const bIncome=document.getElementById('bIncome'); if(bIncome) bIncome.textContent='₦'+salary.toLocaleString();
  const bExp=document.getElementById('bExp'); if(bExp) bExp.textContent='₦'+totalExp.toLocaleString();
  const bSpent=document.getElementById('bSpent'); if(bSpent) bSpent.textContent='₦'+totalExp.toLocaleString();
  const bRem=document.getElementById('bRem'); if(bRem) bRem.textContent='₦'+(2000-totalExp).toLocaleString();
  const pBal=document.getElementById('pBal'); if(pBal) pBal.textContent='₦'+balance.toLocaleString();
  const pIncome=document.getElementById('pIncome'); if(pIncome) pIncome.textContent='+₦'+salary.toLocaleString();
  const pExp=document.getElementById('pExp'); if(pExp) pExp.textContent='-₦'+totalExp.toLocaleString();
  const aTotal=document.getElementById('aTotal'); if(aTotal) aTotal.textContent='₦'+totalExp.toLocaleString();
  const aAvg=document.getElementById('aAvg'); if(aAvg) aAvg.textContent='₦'+(transactions.length?Math.round(totalExp/30):0).toLocaleString();
  
  // IMAGE RESTORED HERE - THIS WAS MISSING
  const list=document.getElementById('transList');
  const icons={Food:'🍔',Transport:'🚌',Shopping:'🛍️',Bills:'💡'};
  if(list){
    if(transactions.length===0) list.innerHTML='No transactions yet';
    else list.innerHTML=transactions.slice(0,5).map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #eee"><div style="display:flex;align-items:center;gap:10px"><span style="width:38px;height:38px;background:#f5f5f7;border-radius:10px;display:grid;place-items:center;font-size:18px">${icons[t.category]||'💰'}</span><div><b>${t.category}</b><br><small style="color:#888">${t.date}</small></div></div><b style="color:#c94c4c">-₦${t.amount}</b></div>`).join('');
  }
  const dot=document.querySelector('.dot'); if(dot){ if(transactions.length>0){ dot.style.display='grid'; dot.textContent=transactions.length; } else dot.style.display='none'; }
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
    return `<div class="budget-cat ${classes[k]}"><div class="budget-cat-top"><div class="budget-cat-left"><span class="cat-icon">${icons[k]}</span><div><b>${k}</b><small>₦${cats[k]} spent</small></div></div><div class="budget-cat-right">₦${cats[k]}</div></div><div class="progress"><div style="width:${pct}%"></div></div></div>`;
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
    donutChart=new Chart(ctx1,{ type:'doughnut', data:{ labels:Object.keys(cats), datasets:[{data:Object.values(cats), backgroundColor:['#ff7a00','#4a90e2','#e94e9a','#4caf50']}] }, options:{responsive:true, plugins:{legend:{display:false}}} });
  }
  const ctx2=document.getElementById('barChart');
  if(ctx2){
    if(barChart) barChart.destroy();
    const months={}; transactions.forEach(t=>{ const m=t.date.slice(0,7); months[m]=(months[m]||0)+t.amount; });
    barChart=new Chart(ctx2,{ type:'bar', data:{ labels:Object.keys(months), datasets:[{label:'Spending', data:Object.values(months), backgroundColor:'#4a90e2'}] }, options:{responsive:true, plugins:{legend:{display:false}}} });
  }
}

// IMAGE RESTORED IN HISTORY TOO
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