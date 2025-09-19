export async function setupComponent(templatePath: string, context: any) {
  console.log("123", templatePath);
  const parser = new DOMParser();
  let resp;
  try {
    let path = `${import.meta.env.VITE_BASE}${templatePath}`;
    console.log("456", path);
    resp = await fetch(path);
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
