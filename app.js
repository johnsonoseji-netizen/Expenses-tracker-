const btn = document.querySelector('#btn');
const resetBtn = document.querySelector('#resetBtn');
const seeAllBtn = document.querySelector('#seeAllBtn');
const mainBal = document.querySelector('.mainbalance');
const incomeCard = document.querySelector('#constantnumberbalance');
const expenseCard = document.querySelector('#expenseBalance');
const input = document.querySelector('#input');
const catSelect = document.querySelector('#category');
const transactionContainer = document.querySelector('#transactioncontainer');

const bellBtn = document.querySelector('#bellBtn');
const notifBox = document.querySelector('#notifBox');
const notifList = document.querySelector('#notifList');
const bellDot = document.querySelector('#bellDot');
const closeNotif = document.querySelector('#closeNotif');

let incomeTotal = Number(localStorage.getItem('income')) || 0;
let coffeeTotal = Number(localStorage.getItem('coffee')) || 0;
let ubarTotal = Number(localStorage.getItem('ubar')) || 0;
let groceryTotal = Number(localStorage.getItem('grocery')) || 0;
let haircutTotal = Number(localStorage.getItem('haircut')) || 0;

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let showAll = false;

function addNotification(category, amount){
  const now = new Date().toLocaleString(); // time + date
  const msg = `${category} ${amount > 0 ? '+' : '-'}£${Math.abs(amount)} at ${now}`;
  notifications.unshift({ msg: msg });
  localStorage.setItem('notifications', JSON.stringify(notifications));
  if(bellDot) bellDot.classList.add('show');
  renderNotifs();
}

function renderNotifs(){
  if(!notifList) return;
  if(notifications.length === 0){
    notifList.innerHTML = '<p style="padding:15px; font-size:13px; opacity:0.6;">No notifications</p>';
    return;
  }
  notifList.innerHTML = notifications.map(n => `<div class="notif-item">${n.msg}</div>`).join('');
}

function render() {
  const expenseTotal = coffeeTotal + ubarTotal + groceryTotal + haircutTotal;
  const balance = incomeTotal - expenseTotal;
  mainBal.textContent = '£' + balance;
  mainBal.style.color = balance < 0 ? 'red' : 'green';
  incomeCard.textContent = '+£' + incomeTotal;
  expenseCard.textContent = '-£' + expenseTotal;

  transactionContainer.querySelectorAll('.grosriescontainer').forEach(el => el.remove());

  if (transactions.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'grosriescontainer';
    empty.innerHTML = '<p style="opacity:0.5;">No transactions yet</p>';
    transactionContainer.appendChild(empty);
  } else {
    transactions.forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 'grosriescontainer';
      if (i >= 4 && !showAll) row.style.display = 'none';
      row.innerHTML = `
        <div class="gosereitem">
          <span>${t.icon}</span>
          <div><h4>${t.name}</h4><h6 class="timedate">${t.date}</h6></div>
        </div>
        <h4 class="amount" style="color:${t.amount > 0 ? 'green' : 'red'}">${t.amount > 0 ? '+£' + t.amount : '-£' + Math.abs(t.amount)}</h4>
      `;
      transactionContainer.appendChild(row);
    });
  }

  if (transactions.length > 4) {
    seeAllBtn.textContent = showAll ? 'show less' : `see all (${transactions.length - 4} more)`;
  } else {
    seeAllBtn.textContent = 'see all';
  }

  localStorage.setItem('income', incomeTotal);
  localStorage.setItem('coffee', coffeeTotal);
  localStorage.setItem('ubar', ubarTotal);
  localStorage.setItem('grocery', groceryTotal);
  localStorage.setItem('haircut', haircutTotal);
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

render();
renderNotifs();

btn.addEventListener('click', () => {
  const val = Number(input.value);
  const cat = catSelect.value;
  if (!val || !cat) { alert('Enter amount and category'); return; }

  let icon = '🛒';
  if (cat === 'salary') { incomeTotal += val; icon = '💰'; }
  else if (cat === 'coffee') { coffeeTotal += val; icon = '☕️'; }
  else if (cat === 'car') { ubarTotal += val; icon = '🚘'; }
  else if (cat === 'haircut') { haircutTotal += val; icon = '💇'; }
  else { groceryTotal += val; icon = '🛒'; }

  const now = new Date().toLocaleString();

  transactions.unshift({
    name: cat === 'car' ? 'ubar car' : cat,
    amount: cat === 'salary' ? val : -val,
    date: now,
    icon: icon
  });

  // BELL: category + amount + time
  addNotification(cat, cat === 'salary' ? val : -val);

  render();
  input.value = '';
  catSelect.value = '';
});

seeAllBtn.addEventListener('click', () => { showAll = !showAll; render(); });

resetBtn.addEventListener('click', () => {
  if (confirm('Reset all?')) {
    localStorage.clear();
    incomeTotal = coffeeTotal = ubarTotal = groceryTotal = haircutTotal = 0;
    transactions = []; notifications = [];
    render(); renderNotifs();
  }
});

if(bellBtn){
  bellBtn.addEventListener('click', () => {
    notifBox.classList.toggle('active');
    if(bellDot) bellDot.classList.remove('show');
  });
}
if(closeNotif){
  closeNotif.addEventListener('click', () => { notifBox.classList.remove('active'); });
}