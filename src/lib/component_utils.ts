export function setupComponent(htmlString: string, context: any) {
  const template = document.createElement("template");
  template.innerHTML = htmlString;

  context.appendChild(template.content.cloneNode(true));
}

export const html = (strings: any, ...values: any[]) =>
  String.raw({ raw: strings }, ...values);
