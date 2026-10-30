let income = 0, expenses = 0;
const budgets = { Food:500, Transport:200, Shopping:300, Bills:600 };
let spent = { Food:0, Transport:0, Shopping:0, Bills:0 };

const totalBal = document.getElementById('totalBal');
const incomeVal = document.getElementById('incomeVal');
const expVal = document.getElementById('expVal');
const transList = document.getElementById('transList');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const dateInput = document.getElementById('date');

function updateUI(){
  totalBal.textContent = `£${(income-expenses)}`;
  incomeVal.textContent = `+£${income}`;
  expVal.textContent = `-£${expenses}`;
  document.getElementById('bIncome').textContent = `£${income}`;
  document.getElementById('bExp').textContent = `£${expenses}`;
  document.getElementById('bSpent').textContent = `£${expenses}`;
  document.getElementById('bRem').textContent = `£${2000-expenses}`;
  document.getElementById('bProg').style.width = Math.min(100, expenses/2000*100)+'%';
  renderBudgets();
}
function renderBudgets(){
  const wrap = document.getElementById('budgetCats');
  wrap.innerHTML='';
  Object.keys(budgets).forEach(cat=>{
    const s = spent[cat]||0, b=budgets[cat], pct=Math.round(s/b*100);
    const over = s>b;
    wrap.innerHTML+=`<div class="cat ${cat==='Food'?'food':cat==='Transport'?'trans':cat==='Shopping'?'shop':'bills'}">
      <div class="cat-left"><div class="cat-icon">${cat==='Food'?'🍴':cat==='Transport'?'🚗':cat==='Shopping'?'🛍️':'🧾'}</div><div><b>${cat}</b><br><small>£${s} / £${b}</small></div></div>
      <div style="text-align:right"><div style="height:6px;width:100px;background:#eee;border-radius:10px;overflow:hidden;margin-bottom:4px;"><div style="width:${Math.min(100,pct)}%;height:100%;background:${over?'#c94c4c':pct>90?'#ff8a00':'#4a7fb5'}"></div></div><span class="pct" style="color:${over?'#c94c4c':'#4a7fb5'}">${pct}% ${over?'• Over':''}</span></div></div>`;
  });
}
document.getElementById('addBtn').onclick=()=>{
  const val=parseFloat(amount.value); const cat=category.value;
  if(!val||!cat){ alert('Enter amount and category'); return; }
  if(val>0){ income+=val; } // For demo treat all as expense? Change logic if you want
  // Actually expense tracker: amount is expense
  if(transList.textContent.includes('No transactions')) transList.innerHTML='';
  expenses+=val; spent[cat]=(spent[cat]||0)+val;
  transList.innerHTML+=`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;"><span>${cat} - ${dateInput.value}</span><b>-£${val}</b></div>`;
  amount.value=''; updateUI();
};
document.getElementById('resetBtn').onclick=()=>{ income=0; expenses=0; spent={Food:0,Transport:0,Shopping:0,Bills:0}; transList.innerHTML='No transactions yet'; updateUI(); };
document.querySelectorAll('.nav div[data-page]').forEach(d=>{
  d.onclick=()=>{
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById(d.dataset.page).classList.add('active');
    document.querySelectorAll('.nav div').forEach(x=>x.classList.remove('active'));
    d.classList.add('active');
  }
});
updateUI();
renderBudgets();