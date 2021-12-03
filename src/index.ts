import "dotenv/config";

import axios from "axios";
const fs = require("fs");

const folder = "locales";

axios.defaults.baseURL = "https://api.airtable.com";
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.API_KEY}`;

const getRecords = async () => {
  const { data } = await axios.get(
    `/v0/${process.env.WORKSPACE}/${process.env.TABLE}`
  );

  const { records } = data;

  let languages: string[] = [];
  let config: any = {};

  if (records.length > 0) {
    languages = Object.keys(records[0].fields).filter((item) => item !== "key");
    for (const lng of languages) {
      config[lng] = {};
    }
  }

  for (const record of records) {
    const fields = record.fields;
    for (const lng of languages) {
      config[lng][fields.key] = fields[lng];
    }
  }
  //   console.log(config);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  for (const lng of languages) {
    fs.writeFile(`locales/${lng}.json`, JSON.stringify(config[lng]), () => {});
  }
};

getRecords();
