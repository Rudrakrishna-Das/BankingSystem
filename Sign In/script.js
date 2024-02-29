const form = document.getElementById("sign_in_form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const err = document.getElementById("erroe_message");

const signIn = document.getElementById("sign_in_form_button");
const openEyeButton = document.getElementById("open_eye");
const closeEyeButton = document.getElementById("close_eye");

const mainURL = "http://localhost:5000/";

signIn.addEventListener("click", async (e) => {
  e.preventDefault();
  err.innerHTML = "";
  const formData = {
    email: email.value.trim(),
    password: password.value.trim(),
  };
  const res = await fetch(`${mainURL}sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  console.log(data);
  if (!data.success) {
    err.innerHTML = data.message;
  }
  if (data.success) {
    const dynamicURL = `/user/index.html`;
    window.location.href = dynamicURL;
  }
});

closeEyeButton.addEventListener("click", (e) => {
  password.type = "text";
  closeEyeButton.style.display = "none";
  openEyeButton.style.display = "block";
  password.focus();
});

openEyeButton.addEventListener("click", (e) => {
  password.type = "password";
  openEyeButton.style.display = "none";
  closeEyeButton.style.display = "block";
  password.focus();
});
