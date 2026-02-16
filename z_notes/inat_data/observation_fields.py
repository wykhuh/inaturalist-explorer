# https://forum.inaturalist.org/t/how-can-i-download-the-complete-list-of-observation-fields/33345/2
import csv
import time

import pandas as pd
import requests


def create_observation_fields_csv():
    api_url = "https://www.inaturalist.org/observation_fields.json?page="
    fields = [
        "id",
        "name",
        "datatype",
        "user_id",
        "description",
        "created_at",
        "updated_at",
        "allowed_values",
        "values_count",
        "users_count",
        "uuid",
    ]

    fileout = open("observation_fields.csv", encoding="utf-8", mode="w+", newline="")
    csvwriter = csv.writer(
        fileout, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL
    )
    csvwriter.writerow(fields)

    looping = True
    page = 1
    while looping and page < 1000:
        time.sleep(1)
        try:
            print(page)

            r = requests.get(api_url + str(page))
            if r.text == "[]":
                looping = False

            for field in r.json():
                row = [field.get(f, "") for f in fields]
                csvwriter.writerow(row)

            page += 1
        except:
            print("error on page " + str(page))
            looping = False


def merge_inat_globi():
    inat_df = pd.read_csv("observation_fields.csv", dtype=str)
    globi_df = pd.read_csv("globi_inat.csv")

    print(inat_df.shape)
    merge_df = inat_df.merge(
        globi_df,
        how="left",
        left_on="name",
        right_on="provided_interaction_type_label",
    )
    print(merge_df.shape)
    merge_df.to_csv("observation_fields.csv", index=False)


merge_inat_globi()
