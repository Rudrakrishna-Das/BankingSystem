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
  const res = await fetch(`${mainURL}sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  if (!data.success) {
    err.innerHTML = data.message;
  }
  if (data.status) {
    const dynamicURL = `/Frontend/user/index.html`;
    window.location.href = dynamicURL;
  }
});
