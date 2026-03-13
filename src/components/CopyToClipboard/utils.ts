import { check, copy } from "../../assets/icons";

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function copyToClipboardHandler(content: string, componentContext: any) {
  componentContext.buttonEl.innerHTML = check;
  setTimeout(() => {
    componentContext.buttonEl.innerHTML = copy;
  }, 3000);

  copyToClipboard(content);

  let tooltip = componentContext.querySelector('[role="tooltip"]');
  if (tooltip) {
    tooltip.classList.add("hide");
    setTimeout(() => {
      tooltip.classList.remove("hide");
    }, 3000);
  }
}
