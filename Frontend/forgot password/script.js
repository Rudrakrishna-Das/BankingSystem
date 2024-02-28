// CONSTANTS

// FORGOT PASSWORD
const forgotPasswordForm = document.getElementById("forgot_password");
const email = document.getElementById("email");
const emailSubmitButton = document.getElementById("email_submit_button");

// INPUT PIN
const inputPinForm = document.getElementById("input_pin");
const numbers = document.getElementsByClassName("input_number");
const pinSubmitButton = document.getElementById('pin_submit_button')

// UPDATE PASSWORD
const updatePasswordForm = document.getElementById("update_password");
const newPassword = document.getElementById("new_password");
const updatePasswordButton = document.getElementById('updated_password_submit_button')

// MESSAGE
const message = document.getElementById("message");

// BACKEND MAIN URL
const mainUrl = "http://127.0.0.1:5000/";

// FUNCTIONALITY

// FORGOT PASSWORD
emailSubmitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  message.innerHTML = "";
  if (email.value.trim().length === 0) {
    message.innerHTML = "Email cannot be empty";
  }
  const emailData = {
    email: email.value.trim(),
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
    numbers[0].focus()
    message.innerHTML = 'If you have a valid email you will recive a pin'
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

pinSubmitButton.addEventListener('click',async(e)=>{
  e.preventDefault()
  message.innerHTML = ''
  const nums = []
  for(let i = 0; i < numbers.length; i++){
    if(numbers[i].value.trim() != ''){
      nums.push(numbers[i].value)
    }
  }
  if(nums.length === 0){
    message.innerHTML = 'You didnot enter the pin'
    return
  }
    const res = await fetch(`${mainUrl}pin-match`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({userPin:nums.join('')})
    })
    const data = await res.json()
    if(!data.success){
      message.innerHTML = data.message
    }
    if(data.success){
      inputPinForm.style.display = 'none'
      updatePasswordForm.style.display = 'block'
    }

  } 
  
)

// UPDATE PASSWORD

updatePasswordButton.addEventListener('click',async(e)=>{
  e.preventDefault()
  message.innerHTML = ''
  if(newPassword.value.trim().length === 0 || newPassword.value.trim().length < 8){
    message.innerHTML = 'Password should be 8 characters long'
    return
  }
  const res = await fetch(`${mainUrl}update-password`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({newPassword:newPassword.value.trim()})
  })
  const data  = await res.json()
  if(data.success){
    window.location.href = '/Frontend/Sign In/index.html'
  }
})