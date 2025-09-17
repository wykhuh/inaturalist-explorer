import fs from "fs";
import path from "path";

const histogram_year_api = `https://api.inaturalist.org/v1/observations/histogram?date_field=observed&interval=year&ttl=${60 * 60 * 24 * 30}`;

export async function getObservationsYears() {
  try {
    let resp = await fetch(histogram_year_api);
    let data = await resp.json();
    return data.results;
  } catch (error) {
    console.error("getObservationsYears ERROR:", error);
  }
}

let data = await getObservationsYears();

if (data) {
  let years = [];
  for (let [date, _count] of Object.entries(data.year)) {
    years.push(Number(date.split("-")[0]));
  }

  fs.writeFile(
    path.resolve("dev", "years.json"),
    JSON.stringify(years.reverse()),
    (err) => {
      if (err) {
        console.error(err);
      }
    },
  );
}
