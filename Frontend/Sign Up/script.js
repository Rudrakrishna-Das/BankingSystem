const signUpName = document.getElementById("name");
const signUpEmail = document.getElementById("email");
const signUpPassword = document.getElementById("password");
const signUpButton = document.getElementById("sign_up_button");
const form = document.getElementsByTagName("form");
const err = document.getElementById("erroe_message");

const mainURL = "http://localhost:5000/";

signUpButton.addEventListener("click", async (e) => {
  e.preventDefault();
  if (
    signUpName.value.trim().length < 2 ||
    !signUpEmail.value.trim().includes("@") ||
    signUpPassword.value.trim().length < 8
  ) {
    err.innerHTML =
      "Name should be atleast 2 character and Password should be atleast 8 characters long";
  } else {
    const userDetails = {
      userName: signUpName.value,
      email: signUpEmail.value,
      password: signUpPassword.value,
    };

    const res = await fetch(`${mainURL}sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    });
  }
});
