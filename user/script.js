//constants
const personalDetails = document.getElementById("personal");
const passbookDetails = document.getElementById("passbook");

const dataDetails = document.getElementById("data_details");
const acc_number = document.getElementById("acc_number");
const sortDirection = document.getElementById("direction");

const account_details = document.getElementById("acc_details");
const acc_balance = document.getElementById("acc_balance");
const account_user_name = document.getElementById("account_user_name");

const depositValue = document.getElementById("deposit_value");
const withdrawValue = document.getElementById("withdraw_value");
const transferValue = document.getElementById("transfer_value");
const transferAccount = document.getElementById("account_number");
const profileButton = document.getElementById("account_user_name");

const depositButton = document.getElementById("deposit_button");
const withdrawButton = document.getElementById("withdraw_button");
const transferButton = document.getElementById("transfer_button");
const logoutButton = document.getElementById("logout_button");
const homeButton = document.getElementById("home_button");
const sortButton = document.getElementById("sort_button");

const homeMessage = document.getElementById("home_message");
const depositMessage = document.getElementById("deposit_message");
const withdrawMessage = document.getElementById("withdraw_message");
const transferMessage = document.getElementById("transfer_message");

const mainURL = "https://banking-system-backend-kmjs.onrender.com/";

let allData = "";

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

const createTable = (date, description, value) => {
  const tableData = document.createElement("tr");
  const tableDate = document.createElement("td");
  const tableDescription = document.createElement("td");
  const tableDebit = document.createElement("td");
  const tableCredit = document.createElement("td");

  tableDate.textContent = date;
  tableDescription.textContent = description;
  tableDebit.textContent = description === "Deposit" ? value : "-";
  tableCredit.textContent =
    description === "Withdraw" || description.includes("Transfer")
      ? value
      : "-";

  tableData.appendChild(tableDate);
  tableData.appendChild(tableDescription);
  tableData.appendChild(tableDebit);
  tableData.appendChild(tableCredit);

  return tableData;
};
const update_ui = ({ accountNo, account_balance, transaction, userName }) => {
  acc_balance.textContent = account_balance;
  account_user_name.textContent = userName.toUpperCase();
  acc_number.innerHTML = accountNo;
  dataDetails.innerHTML = "";

  if (sortDirection.textContent === "⬆") {
    for (let i = transaction.length - 1; i >= 0; i--) {
      const data = createTable(
        transaction[i].date,
        transaction[i].description,
        transaction[i].value
      );
      dataDetails.appendChild(data);
    }
  } else if (sortDirection.textContent === "⬇") {
    for (let i = 0; i < transaction.length; i++) {
      const data = createTable(
        transaction[i].date,
        transaction[i].description,
        transaction[i].value
      );
      dataDetails.appendChild(data);
    }
  }
};

let initOnceCalled = false;

const init = async () => {
  if (!initOnceCalled) {
    logoutButton.style.display = "none";
    homeButton.style.display = "none";
    account_details.style.display = "none";
    homeMessage.innerHTML = '<div id="loader"></div>';
  }

  const res = await fetch(`${mainURL}user`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!data.success) {
    logoutButton.style.display = "none";
    homeButton.style.display = "block";
    account_details.style.display = "none";
    homeMessage.innerHTML = `${data.message}! Please go to HOME page`;
    initOnceCalled = true;
  }
  if (data.success) {
    allData = data;
    if (!initOnceCalled) {
      logoutButton.style.display = "inline";
      account_details.style.display = "block";
      homeButton.style.display = "none";
      homeMessage.innerHTML = "";
    }

    initOnceCalled = true;
    update_ui(data);
  }
};

init();

//SORT
sortButton.addEventListener("click", (e) => {
  if (sortDirection.textContent === "⬇") {
    sortDirection.textContent = "⬆";
  } else if (sortDirection.textContent === "⬆") {
    sortDirection.textContent = "⬇";
  }
  update_ui(allData);
});

//DEPOSITE
depositButton.addEventListener("click", async (e) => {
  e.preventDefault();
  depositMessage.innerHTML = "";
  withdrawMessage.innerHTML = "";
  transferMessage.innerHTML = "";

  if (
    depositValue.value.includes("+") ||
    depositValue.value.includes("-") ||
    +depositValue.value < 1
  ) {
    depositMessage.innerHTML = "Value should be minimum 1";
    return;
  }

  if (depositValue.value.trim().length == 0) {
    depositMessage.innerHTML = "Cannot leave blank!";
  } else {
    depositValue.disabled = true;
    depositButton.innerHTML = '<div id="loader"></div>';
    depositButton.disabled = true;
    const data = await sendData("deposit", { value: depositValue.value });
    depositValue.value = "";
    if (data.success) {
      init();
      depositMessage.style.color = "yellow";
      depositMessage.innerHTML = data.message;
    }
    depositValue.disabled = false;
    depositButton.innerHTML = "Deposit";
    depositButton.disabled = false;
  }
});

//WITHDRAW
withdrawButton.addEventListener("click", async (e) => {
  e.preventDefault();
  depositMessage.innerHTML = "";
  withdrawMessage.innerHTML = "";
  transferMessage.innerHTML = "";

  if (
    withdrawValue.value.includes("+") ||
    withdrawValue.value.includes("-") ||
    +withdrawValue.value < 1
  ) {
    withdrawMessage.innerHTML = "Value should be minimum 1";
    return;
  }

  if (withdrawValue.value.trim().length == 0) {
    withdrawMessage.innerHTML = "Cannot leave blank!";
  } else {
    withdrawButton.disabled = true;
    withdrawButton.innerHTML = '<div id="loader"></div>';
    withdrawValue.disabled = true;
    const data = await sendData("withdraw", { value: withdrawValue.value });
    withdrawValue.value = "";
    if (!data.success) {
      withdrawMessage.innerHTML = data.message;
      withdrawMessage.style.color = "yellow";
    }
    if (data.success) {
      init();
      withdrawMessage.innerHTML = data.message;
      withdrawMessage.style.color = "yellow";
    }
    withdrawButton.disabled = false;
    withdrawButton.innerHTML = "Withdraw";
    withdrawValue.disabled = false;
  }
});

//Transfer
transferButton.addEventListener("click", async (e) => {
  e.preventDefault();
  depositMessage.innerHTML = "";
  withdrawMessage.innerHTML = "";
  transferMessage.innerHTML = "";

  if (
    transferValue.value.includes("+") ||
    transferValue.value.includes("-") ||
    +transferValue.value < 1
  ) {
    transferMessage.innerHTML = "Value should be minimum 1";
    return;
  }

  if (
    transferValue.value.trim().length == 0 ||
    transferAccount.value.trim().length == 0
  ) {
    transferMessage.innerHTML = "Cannot leave blank!";
  } else {
    transferAccount.disabled = true;
    transferValue.disabled = true;
    transferButton.innerHTML = '<div id="loader"></div>';
    transferButton.disabled = true;
    const data = await sendData("transfer", {
      value: transferValue.value,
      accountNo: transferAccount.value,
    });
    transferValue.value = "";
    transferAccount.value = "";
    if (!data.success) {
      transferMessage.innerHTML = data.message;
      transferMessage.style.color = "yellow";
    }
    if (data.success) {
      init();
      transferMessage.innerHTML = data.message;
      transferMessage.style.color = "yellow";
    }
  }
  transferValue.disabled = false;
  transferButton.disabled = false;
  transferAccount.disabled = false;
  transferButton.innerHTML = "Transfer";
});

// LOGOUT
logoutButton.addEventListener("click", async () => {
  logoutButton.style.display = "none";
  homeButton.style.display = "none";
  account_details.style.display = "none";
  homeMessage.innerHTML = '<div id="loader"></div>';
  const res = await fetch(`${mainURL}logout`, {
    credentials: "include",
  });
  const data = await res.json();
  if (data.success) {
    const dynamicURL = `/index.html`;
    window.location.href = dynamicURL;
  }
});

// PROFILE
profileButton.addEventListener("click", () => {
  const url = "/profile/index.html";
  window.location.href = url;
});
