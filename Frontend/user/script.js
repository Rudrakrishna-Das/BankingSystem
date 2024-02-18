const mainURL = "http://localhost:5000/";

const token = localStorage.getItem("token").replaceAll('"', "");

const init = async () => {
  const res = await fetch(`${mainURL}user/${token}`);
  const data = await res.json();
  console.log(data);
};

init();
