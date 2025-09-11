export function logger(...args: any) {
  const log = import.meta.env.VITE_LOGGER;
  if (!log || log === "false") return;

  console.log(...args);
}

export function loggerUrl(...args: any) {
  const log = import.meta.env.VITE_LOGGER_URL;
  if (!log || log === "false") return;

  console.log(...args);
}

export function loggerFilters(...args: any) {
  const log = import.meta.env.VITE_LOGGER_FILTERS;
  if (!log || log === "false") return;

  console.log(...args);
}

export function loggerTime(...args: any) {
  const log = import.meta.env.VITE_LOGGER_TIME;
  if (!log || log === "false") return;

  console.log(...args);
}
