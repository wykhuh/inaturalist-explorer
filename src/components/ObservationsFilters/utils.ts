import type { iNatApiParams, iNatApiParamsKeys } from "../../types/app";

export function processFiltersForm(data: FormData): {
  params: iNatApiParams;
  string: string;
} {
  // convert form data into object that can be use with URLSearchParams
  let values: iNatApiParams = {};
  // console.log("----------- processFiltersForm");

  for (const [k, value] of data) {
    // HACK: get rid of typescript errors for values[key]
    let key = k as iNatApiParamsKeys;
    // console.log(key, value);

    // ignore fields
    if (["on", "d1", "d2", "month", "year", "iconic_taxa"].includes(key)) {
      // ignore value "on"
    } else if (value === "on") {
      // convert boolean strings to boolean
    } else if (value === "true") {
      values[key] = true;
      // convert boolean strings to boolean
    } else if (value === "false") {
      values[key] = false;
    } else if (value !== "") {
      values[key] = value as string;
    } else if (value === "") {
      delete values[key];
    }
  }

  // returns iconic_taxa=Aves,Amphibia
  if (data.getAll("iconic_taxa").length > 0) {
    values.iconic_taxa = data.getAll("iconic_taxa").join(",");
  }

  // handle observed date
  if (data.get("on")) {
    values.on = data.get("on") as string;
  }
  if (data.get("d1")) {
    values.d1 = data.get("d1") as string;
  }
  if (data.get("d2") && data.get("d2")) {
    values.d2 = data.get("d2") as string;
  }
  if (data.getAll("month").filter((m) => m !== "").length > 0) {
    values.month = data.getAll("month").join(",");
  }
  if (data.getAll("year").filter((y) => y !== "").length > 0) {
    values.year = data.getAll("year").join(",");
  }

  return {
    params: values,
    string: new URLSearchParams(values as any)
      .toString()
      .replaceAll("%2C", ","),
  };
}
