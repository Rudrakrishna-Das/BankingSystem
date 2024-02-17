const mainURL = "http://localhost:5000/";

const id = localStorage.getItem("id");
const token = localStorage.getItem("token");
document.cookie = `token=${token}`;

const init = async () => {
  const res = await fetch(`${mainURL}user/${id}`);
  const data = await res.json();
};
init();
