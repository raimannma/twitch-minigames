const channel_name_input = document.getElementById(
  "channel_name"
) as HTMLInputElement;
const buttons = document.querySelectorAll("button");

if (localStorage.getItem("channel_name")) {
  channel_name_input.value = localStorage.getItem("channel_name");
}

buttons.forEach((button) => {
  let btn = button as HTMLButtonElement;
  btn.onclick = function () {
    if (!btn.disabled) {
      localStorage.setItem("channel_name", channel_name_input.value);
      location.href =
        "games/" +
        btn.getAttribute("name") +
        "/index.html?channel_name=" +
        channel_name_input.value;
    }
  };
});

let enableButtons = function () {
  let text = channel_name_input.value;
  buttons.forEach((button) => {
    let btn = button as HTMLButtonElement;
    btn.disabled = text.length === 0;
  });
};
enableButtons();
channel_name_input.oninput = enableButtons;
