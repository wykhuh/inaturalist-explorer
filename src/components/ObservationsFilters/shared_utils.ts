export function tabClickHandler(
  target: HTMLElement,
  componentCtx: HTMLElement,
) {
  let activeTab = target.id;

  // add active class to .nav-link
  componentCtx.querySelectorAll(".nav-link").forEach((el) => {
    if (el.id == activeTab) {
      el.classList.add("active");
      el.setAttribute("aria-selected", "true");
    } else {
      el.classList.remove("active");
      el.setAttribute("aria-selected", "false");
    }
  });

  // add active class to .tab-pane
  componentCtx.querySelectorAll(".tab-pane").forEach((el) => {
    let labelAttr = el.attributes.getNamedItem("aria-labelledby");
    if (!labelAttr) return;

    if (activeTab == labelAttr.value) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}
