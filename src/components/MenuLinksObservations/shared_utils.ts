import { check, copy } from "../../assets/icons";

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function copyToClipboardHandler(button: HTMLButtonElement) {
  button.innerHTML = check;
  setTimeout(() => {
    button.innerHTML = copy;
  }, 3000);

  if (button.dataset.clipboardContent) {
    copyToClipboard(button.dataset.clipboardContent);
    let parent = button.parentNode?.parentNode;
    if (parent && parent.children[1]) {
      let tooltip = parent.children[1] as HTMLSpanElement;
      if (tooltip) {
        tooltip.classList.add("hide");
        setTimeout(() => {
          tooltip.classList.remove("hide");
        }, 3000);
      }
    }
  }
}
