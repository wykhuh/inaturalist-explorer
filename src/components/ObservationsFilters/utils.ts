export function processFiltersForm(data: FormData) {
  let values: { [key: string]: string | boolean | number } = {};

  for (const [key, value] of data) {
    console.log(key, value);
    // ignore fields
    if (["on", "d1", "d2", "month", "iconic_taxa"].includes(key)) {
      // ignore params with value "on"
    } else if (value === "on") {
      // handle params that have field and value, e.g. verifiable=any
    } else if (value === "true") {
      values[key] = true;
    } else if (value === "false") {
      values[key] = false;
    } else if (value !== "") {
      values[key] = value as string;
    }
  }

  // returns iconic_taxa=Aves,Amphibia
  if (data.getAll("iconic_taxa").length > 0) {
    values.iconic_taxa = data.getAll("iconic_taxa").join(",");
  }

  // handle observed date
  if (data.get("on")) {
    values.on = `${data.get("on")}`;
  }
  if (data.get("d1")) {
    values.d1 = `${data.get("d1")}`;
  }
  if (data.get("d2")) {
    values.d2 = `${data.get("d2")}`;
  }
  if (data.getAll("month").filter((m) => m !== "").length > 0) {
    values.month = data.getAll("month").join(",");
  }

  return {
    params: values,
    string: new URLSearchParams(values).toString().replaceAll("%2C", ","),
  };
}
