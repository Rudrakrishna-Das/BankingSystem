//constants
const account_details = document.getElementById("acc_details");
const account_balance = document.getElementById("acc_balance");
const account_user_name = document.getElementById("account_user_name");

const depositValue = document.getElementById("deposit_value");
const withdrawValue = document.getElementById("withdraw_value");
const transferValue = document.getElementById("transfer_value");
const transferAccount = document.getElementById("account_number");

const depositButton = document.getElementById("deposit_button");
const withdrawButton = document.getElementById("withdraw_button");
const transferButton = document.getElementById("transfer_button");
const logoutButton = document.getElementById("logout_button");
const homeButton = document.getElementById("home_button");

const homeMessage = document.getElementById("home_message");
const depositMessage = document.getElementById("deposit_message");
const withdrawMessage = document.getElementById("withdraw_message");
const transferMessage = document.getElementById("transfer_message");

const mainURL = "http://localhost:5000/";

const sendData = async (type, value) => {
  const res = await fetch(`${mainURL}/user/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
    credentials: "include",
  });
  const data = await res.json();
  return data;
};
const update_ui = (data) => {
  account_balance.innerHTML = data.account_balance;
  account_user_name.innerHTML = data.userName;
};

const init = async () => {
  const res = await fetch(`${mainURL}user`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!data.success) {
    logoutButton.style.display = "none";
    account_details.style.display = "none";
    homeButton.style.display = "block";
    homeMessage.innerHTML = `${data.message}! Please go to HOME page`;
  }
  if (data.success) {
    update_ui(data);
  }
};

init();

//DEPOSITE
depositButton.addEventListener("click", async (e) => {
  e.preventDefault();
  depositMessage.innerHTML = "";
  withdrawMessage.innerHTML = "";
  transferMessage.innerHTML = "";
  if (depositValue.value.trim().length == 0) {
    depositMessage.innerHTML = "Cannot leave blank!";
  } else {
    const data = await sendData("deposit", { value: depositValue.value });
    depositValue.value = "";
    if (data.success) {
      init();
      depositMessage.innerHTML = data.message;
    }
  }
});

//WITHDRAW
withdrawButton.addEventListener("click", async (e) => {
  e.preventDefault();
  depositMessage.innerHTML = "";
  withdrawMessage.innerHTML = "";
  transferMessage.innerHTML = "";
  if (withdrawValue.value.trim().length == 0) {
    withdrawMessage.innerHTML = "Cannot leave blank!";
  } else {
    const data = await sendData("withdraw", { value: withdrawValue.value });
    withdrawValue.value = "";
    if (!data.success) {
      withdrawMessage.innerHTML = data.message;
    }
    if (data.success) {
      init();
      withdrawMessage.innerHTML = data.message;
    }
  }
});

//Transfer
transferButton.addEventListener("click", async (e) => {
  e.preventDefault();
  depositMessage.innerHTML = "";
  withdrawMessage.innerHTML = "";
  transferMessage.innerHTML = "";
  if (
    transferValue.value.trim().length == 0 ||
    transferAccount.value.trim().length == 0
  ) {
    transferMessage.innerHTML = "Cannot leave blank!";
  } else {
    const data = await sendData("transfer", {
      value: transferValue.value,
      accountNo: transferAccount.value,
    });
    transferValue.value = "";
    transferAccount.value = "";
    if (!data.success) {
      transferMessage.innerHTML = data.message;
    }
    if (data.success) {
      init();
      transferMessage.innerHTML = data.message;
    }
  }
});

// logoutButton.addEventListener("click", async () => {
//   const res = await fetch(`${mainURL}logout`, {
//     credentials: "include",
//   });
//   const data = await res.json();
//   if (data.success) {
//     const dynamicURL = `http://127.0.0.1:5500/Frontend/index.html`;
//     window.location.href = dynamicURL;
//   }
// });
