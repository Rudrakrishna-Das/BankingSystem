//constants

const mainURL = "http://localhost:5000/";

const init = async () => {
  const res = await fetch(`${mainURL}user`, {
    credentials: "include",
  });
  const data = await res.json();
  console.log(data);
};

init();
