import type { iNatApiParams, iNatApiParamsKeys } from "../../types/app";

export function processFiltersForm(data: FormData): {
  params: iNatApiParams;
  string: string;
} {
  let values: iNatApiParams = {};

  for (const [key, value] of data) {
    // console.log(key, value);

    // ignore fields
    if (["on", "d1", "d2", "month", "iconic_taxa"].includes(key)) {
      // ignore params with value "on"
    } else if (value === "on") {
      // handle params that have field and value, e.g. verifiable=any
    } else if (value === "true") {
      (values[key as iNatApiParamsKeys] as boolean) = true;
    } else if (value === "false") {
      (values[key as iNatApiParamsKeys] as boolean) = false;
    } else if (value !== "") {
      (values[key as iNatApiParamsKeys] as string) = value as string;
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

  return {
    params: values,
    string: new URLSearchParams(values as any)
      .toString()
      .replaceAll("%2C", ","),
  };
}
