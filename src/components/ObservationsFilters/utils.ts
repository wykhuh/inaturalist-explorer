export function processFiltersForm(data: FormData) {
  let values = [];

  for (const [key, value] of data) {
    // ignore fields
    if (["on", "d1", "d2", "month", "iconic_taxa"].includes(key)) {
      // handle paras that have field, e.g. sounds
    } else if (value == "on") {
      values.push(key);
      // handle params that have field and value, e.g. verifiable=any
    } else if (value !== "") {
      values.push(`${key}=${value}`);
    }
  }

  // returns iconic_taxa=Aves,Amphibia
  if (data.getAll("iconic_taxa").length > 0) {
    values.push(`iconic_taxa=${data.getAll("iconic_taxa").join(",")}`);
  }

  // handle observed date
  if (data.get("on")) {
    values.push(`on=${data.get("on")}`);
  }
  if (data.get("d1")) {
    values.push(`d1=${data.get("d1")}`);
  }
  if (data.get("d2")) {
    values.push(`d2=${data.get("d2")}`);
  }
  if (data.getAll("month").filter((m) => m !== "").length > 0) {
    values.push(`month=${data.getAll("month").join(",")}`);
  }

  return values.join("&");
}
