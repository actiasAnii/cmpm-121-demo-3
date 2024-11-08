import "./style.css";
const APP_NAME = "Geocoin Demo";
document.title = APP_NAME;

// first tiny change
const button = document.createElement("button");
button.textContent = "click!";
button.style.display = "block";
button.style.margin = "auto";

button.addEventListener("click", () => {
  alert("you clicked the button!");
});
document.body.appendChild(button);
