const message = document.getElementById("main_message");
const formMessage = document.getElementById("form_message");
formMessage.style.display = "none";
const userDetails = document.getElementById("user_details_form");

const userName = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const accountNumber = document.getElementById("account_number");

const backButton = document.getElementById("back_button");
const homeButton = document.getElementById("home_button");
const updateButton = document.getElementById("update_button");

const maintURL = "http://localhost:5000/";
const init = async () => {
  const res = await fetch(`${maintURL}profile`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!data.status) {
    message.innerHTML = `${data.message}. Please goto home page`;
    backButton.style.display = "none";
    homeButton.style.display = "block";
    userDetails.style.display = "none";
  }
  if (data.status) {
    userName.value = data.userName;
    email.value = data.email;
    accountNumber.value = data.accountNo;
  }
};

init();

updateButton.addEventListener("click", async (e) => {
  e.preventDefault();
  formMessage.style.display = "none";
  if (password.value.trim() !== "" && password.value.trim().length < 8) {
    formMessage.style.display = "block";
    formMessage.innerHTML = "Password should be atleast 8 characters long";
    return;
  }
  const formData = {
    userName: userName.value.trim() || "",
    email: email.value.trim() || "",
    password: password.value.trim() || "",
  };

  const res = await fetch(`${maintURL}update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
    credentials: "include",
  });
  const data = await res.json();
  if (data[0]) {
    userName.value = data[0]?.userName;
    email.value = data[0]?.email;
  }

  formMessage.style.display = "block";
  formMessage.innerHTML = data[1]?.message || data.message;
});
