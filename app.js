// ===== EXPENSE TRACKER WITH NOTIFICATIONS =====
let income = parseFloat(localStorage.getItem('income')) || 0;
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

const totalBalEl = document.getElementById('totalBal');
const incomeValEl = document.getElementById('incomeVal');
const expValEl = document.getElementById('expVal');
const transListEl = document.getElementById('transList');
const salaryInput = document.getElementById('salaryInput');
const dateInput = document.getElementById('date');
if(dateInput) dateInput.valueAsDate = new Date();

// ===== NOTIFICATIONS SYSTEM =====
function requestNotifPermission(){
  if('Notification' in window && Notification.permission !== 'granted'){
    Notification.requestPermission();
  }
}
// Ask permission on first load
requestNotifPermission();

function showNotif(title, body){
  // 1. In-app toast (always works)
  const toast = document.createElement('div');
  toast.textContent = `${title}: ${body}`;
  toast.style.cssText = `position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#111;color:white;padding:12px 18px;border-radius:30px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.2);`;
  document.body.appendChild(toast);
  setTimeout(()=> toast.remove(), 4000);

  // 2. System notification (if allowed)
  if('Notification' in window && Notification.permission === 'granted'){
    new Notification(title, {body, icon:'https://cdn-icons-png.flaticon.com/512/2331/2331941.png'});
  }

  // 3. Vibrate + Sound effect
  if(navigator.vibrate) navigator.vibrate([100,50,100]);
}

function save(){
  localStorage.setItem('income', income.toString());
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateUI(){
  const totalExpenses = transactions.reduce((s,t)=> s+t.amount, 0);
  const totalBalance = income - totalExpenses;
  const pct = 2000 > 0 ? Math.min(100, Math.round((totalExpenses/2000)*100)) : 0;

  if(totalBalEl) totalBalEl.textContent = `£${totalBalance.toLocaleString()}`;
  if(incomeValEl) incomeValEl.textContent = `+£${income.toLocaleString()}`;
  if(expValEl) expValEl.textContent = `-£${totalExpenses.toLocaleString()}`;

  const bSpent = document.getElementById('bSpent');
  const bRem = document.getElementById('bRem');
  const bProg = document.getElementById('bProg');
  if(bSpent) bSpent.textContent = `£${totalExpenses.toLocaleString()}`;
  if(bRem) {
    const remaining = 2000 - totalExpenses;
    bRem.textContent = `£${remaining.toLocaleString()}`;
    bRem.style.color = remaining < 0 ? 'red' : '#0a6b2e';
  }
  if(bProg) bProg.style.width = `${pct}%`;
  const bIncome = document.getElementById('bIncome');
  const bExp = document.getElementById('bExp');
  if(bIncome) bIncome.textContent = `£${income.toLocaleString()}`;
  if(bExp) bExp.textContent = `£${totalExpenses.toLocaleString()}`;

  // Low balance warning - LESS THAN 50
  if(totalBalance > 0 && totalBalance < 50){
    showNotif('⚠️ Low Balance Alert!', `Your balance is only £${totalBalance}. Salary getting low!`);
    if(totalBalEl) totalBalEl.style.color = '#e53935';
  } else {
    if(totalBalEl) totalBalEl.style.color = '#0a6b2e';
  }

  if(transactions.length === 0){
    transListEl.innerHTML = `No transactions yet`;
  } else {
    transListEl.innerHTML = transactions.map(t=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <div style="display:flex;gap:10px;align-items:center;">
          <span style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;display:grid;place-items:center;">${t.category==='Food'?'🍔':t.category==='Transport'?'🚗':t.category==='Shopping'?'🛍️':'💡'}</span>
          <div><b style="font-size:14px;">${t.category}</b><br><small style="color:#888;">${t.date}</small></div>
        </div>
        <b style="color:#c94c4c;">-£${t.amount}</b>
      </div>
    `).join('');
  }

  renderBudgetCats(totalExpenses);
  save();
}

function renderBudgetCats(totalExpenses){
  const container = document.getElementById('budgetCats');
  if(!container) return;
  const cats = [
    {name:'Food', icon:'🍔', color:'food', budget:500},
    {name:'Transport', icon:'🚗', color:'trans', budget:400},
    {name:'Shopping', icon:'🛍️', color:'shop', budget:600},
    {name:'Bills', icon:'💡', color:'bills', budget:500},
  ];
  container.innerHTML = cats.map(c=>{
    const spent = transactions.filter(t=> t.category===c.name).reduce((s,t)=>s+t.amount,0);
    const pct = Math.min(100, Math.round((spent/c.budget)*100));
    return `
      <div class="budget-cat ${c.color}">
        <div class="budget-cat-top">
          <div class="budget-cat-left">
            <div class="cat-icon">${c.icon}</div>
            <div><b>${c.name}</b><small>£${spent} of £${c.budget}</small></div>
          </div>
          <div class="budget-cat-right"><strong>${pct}%</strong></div>
        </div>
        <div class="progress"><div style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

// SET SALARY - WITH NOTIFICATION + COMPOUND
document.getElementById('setSalary')?.addEventListener('click', ()=>{
  const val = parseFloat(salaryInput.value);
  if(!val || val <=0){ alert('Enter valid salary'); return; }
  income += val;
  salaryInput.value = '';
  updateUI();
  showNotif('💰 Salary Received!', `£${val.toLocaleString()} added. Total income is now £${income.toLocaleString()}`);
});

// ADD TRANSACTION - WITH NOTIFICATION
document.getElementById('addBtn')?.addEventListener('click', ()=>{
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  if(!amount || amount<=0){ alert('Enter valid amount'); return; }
  if(!category){ alert('Choose category'); return; }
  if(!date){ alert('Choose date'); return; }
  
  transactions.unshift({amount, category, date});
  document.getElementById('amount').value = '';
  document.getElementById('category').value = '';
  updateUI();
  showNotif('🛒 Purchase Recorded', `You spent £${amount} on ${category}`);
});

// RESET
document.getElementById('resetBtn')?.addEventListener('click', ()=>{
  if(confirm('Reset all?')){
    income=0; transactions=[]; localStorage.clear(); updateUI();
    showNotif('🔄 Reset Done', 'All data cleared');
  }
});

// BELL ICON - CLICK TO ENABLE NOTIFICATIONS
document.querySelector('.icon-btn')?.addEventListener('click', ()=>{
  requestNotifPermission();
  showNotif('🔔 Notifications ON', 'You will get alerts for salary, purchases & low balance');
});

// NAV
document.querySelectorAll('.nav div[data-page]').forEach(el=>{
  el.addEventListener('click', ()=>{
    document.querySelectorAll('.nav div').forEach(n=> n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.page').forEach(p=> p.classList.remove('active'));
    document.getElementById(el.dataset.page)?.classList.add('active');
  });
});

updateUI();