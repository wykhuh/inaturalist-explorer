export async function setupComponent(templatePath: string, context: any) {
  const parser = new DOMParser();
  let resp;
  try {
    resp = await fetch(templatePath);
  } catch (error) {
    console.error("componenr ERROR:", error);
  }

  if (!resp) return;

  const html = await resp.text();

  const template = parser
    .parseFromString(html, "text/html")
    .querySelector("template");

  if (!template) return;

  context.appendChild(template.content.cloneNode(true));
}
