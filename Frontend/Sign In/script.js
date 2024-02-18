const form = document.getElementById("sign_in_form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const signIn = document.getElementById("sign_in_form_button");
const err = document.getElementById("erroe_message");

const mainURL = "http://localhost:5000/";

signIn.addEventListener("click", async (e) => {
  e.preventDefault();
  const formData = {
    email: email.value.trim(),
    password: password.value.trim(),
  };
  const res = await fetch(`${mainURL}/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  if (data.status) {
    localStorage.setItem("token", JSON.stringify(data.token));
    const dynamicURL = `http://127.0.0.1:5500/Frontend/user/index.html`;
    window.location.href = dynamicURL;
  }
});
