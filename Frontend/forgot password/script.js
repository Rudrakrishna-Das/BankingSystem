// CONSTANTS

// FORGOT PASSWORD
const forgotPasswordForm = document.getElementById("forgot_password");
const email = document.getElementById("email");

// INPUT PIN
const inputPinForm = document.getElementById("input_pin");
const numbers = document.getElementsByClassName("input_number");

// UPDATE PASSWORD
const updatePasswordForm = document.getElementById("update_password");
const newPassword = document.getElementById("new_password");
// BUTTON
const submitButton = document.getElementById("submit_button");
// MESSAGE
const message = document.getElementById("message");

// BACKEND MAIN URL
const mainUrl = "http://127.0.0.1:5000/";

// FUNCTIONALITY

// FORGOT PASSWORD
submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  message.innerHTML = "";
  if (email.value.trim().length === 0) {
    message.innerHTML = "Email cannot be empty";
  }
  const emailData = {
    email: email.value,
  };
  const res = await fetch(`${mainUrl}forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });
  const data = await res.json();
  if (!data.success) {
    message.innerHTML = data.message;
  }

  if (data.success) {
    forgotPasswordForm.style.display = "none";
    inputPinForm.style.display = "block";
  }
});

// INPUT PIN
for (let i = 0; i < numbers.length; i++) {
  numbers[i].addEventListener("keyup", (e) => {
    e.preventDefault();
    if (
      ((e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 96 && e.keyCode <= 105)) &&
      i < numbers.length - 1
    ) {
      numbers[i + 1].focus();
    }
    if (e.keyCode === 8 && i > 0) {
      numbers[i - 1].focus();
    }
  });
}
