const signUpName = document.getElementById("name");
const signUpEmail = document.getElementById("email");
const signUpPassword = document.getElementById("password");
const form = document.getElementsByTagName("form");
const message = document.getElementById("erroe_message");

const openEyeButton = document.getElementById("open_eye");
const closeEyeButton = document.getElementById("close_eye");
const signUpButton = document.getElementById("sign_up_button");

const mainURL = "https://banking-system-backend-kmjs.onrender.com/";

signUpButton.addEventListener("click", async (e) => {
  e.preventDefault();
  message.innerHTML = "";
  if (
    signUpName.value.trim().length < 2 ||
    !signUpEmail.value.trim().includes("@") ||
    signUpPassword.value.trim().length < 8
  ) {
    message.innerHTML =
      "Name should be atleast 2 character and Password should be atleast 8 characters long";
  } else {
    const userDetails = {
      userName: signUpName.value,
      email: signUpEmail.value,
      password: signUpPassword.value,
    };
    try {
      const res = await fetch(`${mainURL}sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });
      const data = await res.json();
      if (!data.success) {
        message.innerHTML = data.message;
      }
      if (data.success) {
        message.innerHTML = data.message;
      }
    } catch (error) {
      console.log(error);
    }
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
