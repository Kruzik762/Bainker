'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Dustin Vidrine',
  movements: [543,200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-10-24T09:15:33.044Z',
    '2022-09-18T21:31:17.178Z',
    '2022-10-20T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [4545,5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2022-10-23T09:15:33.044Z',
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatCurrency = (value, locale, currency)=> new Intl.NumberFormat(locale, {style: 'currency', currency: currency}).format(value)

const displayMovements = function (acct, sort = false) {
  containerMovements.innerHTML = ''; 
  const calcDaysPassed = (date1,date2) =>Math.floor(Math.abs(date2 - date1) /( 1000 * 60 * 60 * 24));
  const [movs, dates] = sort ? sortDates(acct.movements, acct.movementsDates) : [acct.movements, acct.movementsDates];


  movs.forEach(function (mov, i) { 
  const type = mov < 0 ? "withdrawal" : "deposit"
    const daysAgo = calcDaysPassed(new Date(), new Date(dates[i]))
    
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">
        ${daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' :  daysAgo <= 7 ?  `${daysAgo} days ago` : formatMovementDates(new Date(dates[i]), acct.locale)}
        </div>
        <div class="movements__value">${formatCurrency(mov, acct.locale, acct.currency)}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
  console.log(account1)
};

function formatMovementDates(date, locale){


  return new Intl.DateTimeFormat(locale).format(date);
}

function sortDates(moves,dates) {
  const combined = [];
  const sortedMoves = [];
  const sortedDates = [];

  moves.forEach((_, i) => combined.push([moves[i],dates[i]]));
    combined.sort((a,b) => a[0] - b[0]);
    combined.forEach(mov => {
    sortedMoves.push(mov[0]);
    sortedDates.push(mov[1]);
    })
  

  return [sortedMoves, sortedDates];
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurrency(acc.balance, acc.locale, acc.currency);
};


const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};
const resetTimer = function() {
  clearInterval(timer);
  timer = startLogoutTimer();
}
///////////////////////////////////////
// Event handlers
let currentAccount;
let timer;

const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: "long"
}



btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();
  
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
    );
    
    
    if (currentAccount?.pin === Number(inputLoginPin.value)) {
      // Display UI and message
      labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(new Date())
      labelWelcome.textContent = `Welcome back, ${
        currentAccount.owner.split(' ')[0]
      }`;
      containerApp.style.opacity = 100;
      containerApp.style.visibility = "visible";
      // Clear input fields
      inputLoginUsername.value = inputLoginPin.value = '';
      inputLoginPin.blur();
      if(timer) clearInterval(timer);
      timer = startLogoutTimer();
      // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add Transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
    // Reset Timer
    resetTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.trunc(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {

    setTimeout( () => {
    // Add movement
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString())
      // Update UI
      updateUI(currentAccount);
      
    },2500)
    resetTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
  
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

// month/day/year

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// setInterval( () => console.log(new Date()), 1200);

// const clock = setInterval(() => {
// const date = new Date();
//   console.clear();
//   console.log(`Current Time - ${date.getHours() > 12 ? date.getHours() - 12 : date.getHours() === 0 ? date.getHours() + 12 : date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
// },1000)


function startLogoutTimer() {
  //set timer to 5 mins
  function tick() {
    const min = `${Math.trunc(time / 60)}`.padStart(2,'0');
    const seconds = min === '00' ? `${time % 60}`.padStart(2, '0') : `${time % 60}`.padEnd(2, '0');
    

  //in each call, print the remaining time to the UI
  labelTimer.textContent = `${min}:${seconds}`.padStart(4,0);
  // at end of timer, stop timer and log user out
    if(time === 0) {
    clearInterval(timer);
    // Log user out
    containerApp.style.opacity = 0;
    containerApp.style.visibility = "hidden";
    labelWelcome.textContent = 'Log in to get started';
    currentAccount = null;

    }
    // decrease 1 second
    time--;
  }
  let time = 300;
  // call the timer every second
  tick()
  const timer = setInterval(tick, 1000);
  return timer; 
}

function createRandomInt(min, max) {
 return Math.trunc(Math.random() * (max - min)+ 1) + min
}
