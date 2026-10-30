// ===== EXPENSE TRACKER - FINAL JS - NO MISTAKES =====
let income = parseFloat(localStorage.getItem('income')) || 0;
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

// Elements
const totalBalEl = document.getElementById('totalBal');
const incomeValEl = document.getElementById('incomeVal');
const expValEl = document.getElementById('expVal');
const transListEl = document.getElementById('transList');
const salaryInput = document.getElementById('salaryInput');

// Set today's date by default
const dateInput = document.getElementById('date');
if(dateInput) dateInput.valueAsDate = new Date();

// SAVE TO STORAGE
function save(){
  localStorage.setItem('income', income.toString());
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// UPDATE ALL UI
function updateUI(){
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = income - totalExpenses;
  const pct = income > 0 ? Math.min(100, Math.round((totalExpenses / 2000) * 100)) : 0;

  // Home
  if(totalBalEl) totalBalEl.textContent = `£${totalBalance.toLocaleString()}`;
  if(incomeValEl) incomeValEl.textContent = `+£${income.toLocaleString()}`;
  if(expValEl) expValEl.textContent = `-£${totalExpenses.toLocaleString()}`;

  // Budget page
  const bSpent = document.getElementById('bSpent');
  const bRem = document.getElementById('bRem');
  const bProg = document.getElementById('bProg');
  const bIncome = document.getElementById('bIncome');
  const bExp = document.getElementById('bExp');
  const tipPct = document.getElementById('tipPct');

  if(bSpent) bSpent.textContent = `£${totalExpenses.toLocaleString()}`;
  if(bRem) {
    const remaining = 2000 - totalExpenses;
    bRem.textContent = `£${remaining.toLocaleString()}`;
    bRem.style.color = remaining < 0 ? 'red' : '#0a6b2e';
  }
  if(bProg) bProg.style.width = `${pct}%`;
  if(bIncome) bIncome.textContent = `£${income.toLocaleString()}`;
  if(bExp) bExp.textContent = `£${totalExpenses.toLocaleString()}`;
  if(tipPct) tipPct.textContent = `${pct}%`;

  // Transactions list
  if(transactions.length === 0){
    transListEl.innerHTML = `No transactions yet`;
    transListEl.style.color = '#888';
  } else {
    transListEl.style.color = '#111';
    transListEl.innerHTML = transactions.map((t,i) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <div style="display:flex;gap:10px;align-items:center;">
          <span style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;display:grid;place-items:center;">${t.category==='Food'?'🍔':t.category==='Transport'?'🚗':t.category==='Shopping'?'🛍️':'💡'}</span>
          <div><b style="font-size:14px;">${t.category}</b><br><small style="color:#888;">${t.date}</small></div>
        </div>
        <b style="color:#c94c4c;">-£${t.amount}</b>
      </div>
    `).join('');
  }

  // Budget categories
  renderBudgetCats(totalExpenses);
  save();
}

// BUDGET CATEGORIES
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
          <div class="budget-cat-right"><strong>${pct}%</strong><small>${pct>80?'High':'OK'}</small></div>
        </div>
        <div class="progress"><div style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

// SET SALARY - COMPOUNDS AND STAYS PERMANENT
document.getElementById('setSalary')?.addEventListener('click', ()=>{
  const val = parseFloat(salaryInput.value);
  if(!val || val <= 0){ alert('Please enter valid salary'); return; }
  
  income += val; // COMPOUND - adds to existing income
  salaryInput.value = '';
  updateUI();
  
  // Show feedback
  const btn = document.getElementById('setSalary');
  const oldText = btn.textContent;
  btn.textContent = 'Added!';
  setTimeout(()=> btn.textContent = oldText, 1000);
});

// ADD TRANSACTION
document.getElementById('addBtn')?.addEventListener('click', ()=>{
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if(!amount || amount <=0){ alert('Enter valid amount'); return; }
  if(!category){ alert('Choose category'); return; }
  if(!date){ alert('Choose date'); return; }

  transactions.unshift({amount, category, date});
  document.getElementById('amount').value = '';
  document.getElementById('category').value = '';
  updateUI();
});

// RESET ALL - CLEARS EVERYTHING
document.getElementById('resetBtn')?.addEventListener('click', ()=>{
  if(confirm('Reset all? This will delete income and transactions permanently.')){
    income = 0;
    transactions = [];
    localStorage.clear();
    updateUI();
  }
});

// NAVIGATION
document.querySelectorAll('.nav div[data-page]').forEach(el=>{
  el.addEventListener('click', ()=>{
    document.querySelectorAll('.nav div').forEach(n=> n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.page').forEach(p=> p.classList.remove('active'));
    document.getElementById(el.dataset.page)?.classList.add('active');
  });
});

// INIT
updateUI();