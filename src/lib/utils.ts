let debug = false;

export function displayJson(json: any, el: HTMLElement | null) {
  if (!debug) return;
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#Examples
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  if (el) {
    el.innerText = JSON.stringify(json, getCircularReplacer(), 2);
  }
}

export function hexToRgb(hex: string, alpha = 1) {
  if (hex.length < 7) return;

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return;

  let rgb = {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
  let str = `${rgb.r},${rgb.g},${rgb.b},${alpha}`;

  return str;
}

export function pluralize(number: number, text: string, useComma = false) {
  let displayNumber = useComma ? number.toLocaleString() : number;
  if (number === 1) {
    return `${displayNumber} ${text}`;
  } else {
    return `${displayNumber} ${text}s`;
  }
}
