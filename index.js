// "use strict";

const account1 = {
  owner: "Jonas Kangethe",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2022-02-18T21:31:17.178Z",
    "2022-03-23T07:42:02.383Z",
    "2022-04-28T09:15:04.904Z",
    "2022-05-01T10:17:24.185Z",
    "2022-06-08T14:11:59.604Z",
    "2022-07-27T17:01:17.194Z",
    "2022-08-25T23:36:17.929Z",
    "2022-08-28T10:51:36.790Z",
  ],
  currency:"USD",
  locale: "en-US", // de-DE
};

const account2 = {
  owner: "Matayo Simiyu",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2022-07-01T13:15:33.035Z",
    "2022-07-25T09:48:16.867Z",
    "2022-07-30T06:04:23.907Z",
    "2022-08-15T14:18:46.235Z",
    "2022-08-17T16:33:06.386Z",
    "2022-08-20T14:43:26.374Z",
    "2022-08-25T18:49:59.371Z",
    "2022-08-26T12:01:20.894Z",
  ],
  currency: "KES",
  locale: "sw-KE",
};

const accounts = [account1,account2]
// const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");
const dets = document.querySelector('.btn-large');
const dets2 = document.querySelector(".btn-larger");

dets2.style.opacity = 0;
const formartMovementDate = (date,locale) => {
  const calsDaysPassed = (date1, date2) => Math.round(
    Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  
  const daysPassed = calsDaysPassed(new Date(), date);
  
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return "Today";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  
  return new Intl.DateTimeFormat(locale).format(date);
}
  
const formatCur = function (value, locale, currency) { 
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

  const displayMovements = (ac, sort = false) => {
  containerMovements.innerHTML = '';
  const movs = sort ? ac.movements.slice().sort((a, b) => a - b) : ac.movements;
  movs.forEach((mov, i) => {
    const typ = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(ac.movementsDates[i]);
    const displayDate = formartMovementDate(date, ac.locale);
    
    const formattedMovement =formatCur(mov,ac.locale,ac.currency)

    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${typ}">${i + 1} ${typ}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMovement}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin',html)
  })
}

const createUserName = function (accs) {
  accs.forEach(function (acc) { 
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map((word) => word[0])
      .join('');
  });
}
createUserName(accounts);

const updateUI = (ac) => {
  displayMovements(ac)
  calcDisplaySummary(ac)
  calcPrintBalance(ac)
}
const startLogoutTimer = () => {
  const tick = () => {
    const min = String(Math.floor(lougout / 60)).padStart(2, 0);
    const sec = String(lougout % 60).padStart(2, 0);
    // print time to ui every call
    labelTimer.textContent = `${min}:${sec}`;

    //when time runs out stop timer and logout user
    if (lougout === 0) {
      clearInterval(LogTime);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    // decrease time by 1 second
    lougout--;
  }
  // set time to 5 minutes
  let lougout = 60*2;
  // call the timer every second
  tick()
  const LogTime = setInterval(tick, 1000);
  return LogTime;
}
const calcPrintBalance = function (ac){
  ac.balance = ac.movements.reduce((acc, cur) => acc + cur, 0)
  labelBalance.textContent = formatCur(ac.balance,ac.locale,ac.currency);
}

const calcDisplaySummary = (ac) => {
  const incomes = ac.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, ac.locale, ac.currency);

  const outcome = ac.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = formatCur(Math.abs(outcome), ac.locale, ac.currency);

  const interest = ac.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * ac.interestRate / 100)
    .filter(int=>int >=1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = formatCur(interest, ac.locale, ac.currency);
}

let currentAccount,LogTime;

let sorted = false;


btnLogin.addEventListener('click', function (e) {
  e.preventDefault()
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  //  console.log(currentAccount);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back , ${currentAccount.owner.split(' ')[0]}🙃`
    dets.style.opacity = 0;
    dets2.style.opacity = 1;
  };
  containerApp.style.opacity = 100;
  // create current date 
  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  };

  labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

  // clear input fields 
  inputLoginPin.value = inputLoginUsername.value = '';
  inputLoginPin.blur();
  // clear timer from previous user
  if (LogTime) clearInterval(LogTime);
  LogTime = startLogoutTimer(); // logout timer 

  updateUI(currentAccount);
})

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(acc => acc?.username === inputTransferTo.value);
  // console.log(amount, receiverAcc);
  if (amount > 0 && receiverAcc &&currentAccount.balance >= amount && receiverAcc?.username !== currentAccount.username) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    swal({
      icon: "success",
      text: `Amount Transfered`,
    });

    // add transfer date 
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    // clear timer
    clearInterval(LogTime);
    LogTime = startLogoutTimer();

    inputTransferAmount.value = inputTransferTo.value = '';
  }
})

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const reqamount = Math.floor(inputLoanAmount.value);
  if (reqamount > 0 && currentAccount.movements.some(deposit => deposit >= 0.1*reqamount)) {
    setTimeout(function () {
      currentAccount.movements.push(reqamount);
      // add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
      // reset timer
      clearInterval(LogTime);
      LogTime = startLogoutTimer();
      swal({
        icon: "success",
        text: `Loan Approved`,
      });
    }, 3000);
    
  }
   inputLoanAmount.value = "";
})

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (currentAccount.pin === +inputClosePin.value && currentAccount.username === inputCloseUsername.value) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    inputClosePin.value = inputCloseUsername.value = '';
    // delete acc
    accounts.splice(index, 1);
    // hide ui
    containerApp.style.opacity = 0;
  } 
})

sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});


dets.addEventListener('click', function () {  
  swal({
    text: `Use this data to login: 😉
    User : jk Pin : 1111
    User : ms Pin : 2222
    See you on the other side!🙃`,
  });
})
dets2.addEventListener("click", function () {
  swal({
    text: `🤪
    User : jk Pin : 1111
    User : ms Pin : 2222 .
    Money transfers:
    Use jk / ms followed by amount `,
  });
});

