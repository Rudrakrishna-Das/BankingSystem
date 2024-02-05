const form = document.getElementById("sign_in_form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const signIn = document.getElementById("sign_in_form_button");
const err = document.getElementById("erroe_message");

const users = [
  { id: 1, userName: "test", email: "test@test.com", password: "test123" },
];

signIn.addEventListener("click", (e) => {
  e.preventDefault();
  const userFound = users.find((user) => user.email === email.value);
  if (!userFound) {
    err.innerHTML = "Please check your Email";
    return;
  }
  if (userFound.password !== password.value) {
    err.innerHTML = "Please check your Password";
    return;
  }
  window.location.href = "http://127.0.0.1:5500/Frontend/user/index.html";
});
