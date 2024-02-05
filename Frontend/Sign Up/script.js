const signUpName = document.getElementById("name");
const signUpEmail = document.getElementById("email");
const signUpPassword = document.getElementById("password");
const signUpButton = document.getElementById("sign_up_button");
const form = document.getElementsByTagName("form");

const signUpUser = [];

signUpButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (
    signUpName.value.trim().length < 2 ||
    !signUpEmail.value.trim().includes("@") ||
    signUpPassword.value.trim().length < 8
  ) {
    const p = document.createElement("p");
    p.innerHTML =
      "Name should be atleast 2 character and Password should be atleast 8 characters long";
    p.style.fontSize = "18px";
    form[0].append(p);
  } else {
    const userDetails = {
      id: Math.random() * 44444444,
      userName: signUpName.value,
      email: signUpEmail.value,
      password: signUpPassword.value,
    };

    const findUser = signUpUser.find(
      (user) => user.email === signUpEmail.value
    );

    if (!findUser) {
      signUpUser.push(userDetails);
      window.location.href =
        "http://127.0.0.1:5500/Frontend/Sign%20In/index.html";
    } else {
      const p = document.createElement("p");
      p.innerHTML = "This email already exist";
      p.style.fontSize = "18px";
      form[0].append(p);
    }
  }
});
