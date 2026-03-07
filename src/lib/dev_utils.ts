export function displayGraphStatus() {
  let header = document.querySelector(".navbar-brand");
  if (header) {
    header.innerHTML = "";

    let div = document.createElement("div");
    div.textContent = "";
    div.textContent = `${JSON.stringify(window.app.store.viewMetadata.observations_observations.graphs)}`;
    header.append(div);
  }
}
