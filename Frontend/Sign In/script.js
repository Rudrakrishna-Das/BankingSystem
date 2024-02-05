const form = document.getElementById("sign_in_form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const signIn = document.getElementById("sign_in_form_button");

const users = [
  { id: 1, userName: "test", email: "test@test.com", password: "test123" },
];

signIn.addEventListener("click", (e) => {
  e.preventDefault();
  const userFound = users.find((user) => user.email === email.value);
  if (!userFound) {
    const p = document.createElement("p");
    p.innerHTML = "Please check your Email";
    p.style.fontSize = "18px";
    form.append(p);
    return;
  }
  if (userFound.password !== password.value) {
    const p = document.createElement("p");
    p.innerHTML = "Please check your Password";
    p.style.fontSize = "18px";
    form.append(p);
    return;
  }
});
