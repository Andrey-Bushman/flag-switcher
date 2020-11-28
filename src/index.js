// index.js
import {FlagSwitcher} from "./flag-switcher";

const fs2 = document.createElement(FlagSwitcher.tagName);
fs2.id = "fs2";
fs2.value = "dumbbell"; // подсветить иконку "преимущество"
fs2.disabled = false; // значение по умолчанию, но показано для наглядности

// Вместо этого можно использовать функцию обновления state в приложениях, использующих Redux.
const handler = (event => console.log(event.detail));

fs2.addEventListener("change", handler);
fs2.addEventListener("disabling-change", handler);

const fs2parent = document.getElementById("fs2-container");
fs2parent.appendChild(fs2);

// Блокировка/разблокировка компонента. Блокированный компонент выделяется серой рамкой
const btn = document.getElementById("fs2-switcher");

btn.textContent = fs2.disabled ? "Разблокировать" : "Блокировать";

btn.onclick = () => {
    fs2.disabled = !fs2.disabled;
    btn.textContent = fs2.disabled ? "Разблокировать" : "Блокировать";
}