export function displayJson(json: any, el: HTMLElement | null) {
  if (el) {
    el.innerText = JSON.stringify(json, null, 2);
  }
}
