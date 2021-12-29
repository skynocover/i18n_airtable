#!/usr/bin/env node

import 'dotenv/config';

import axios from 'axios';
import fs from 'fs';
import fsPromises from 'fs/promises';

const folder = 'locales';

axios.defaults.baseURL = 'https://api.airtable.com';
axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.I18N_AIRTABLE_API_KEY}`;

(async () => {
  const { data } = await axios.get(
    `/v0/${process.env.I18N_AIRTABLE_WORKSPACE}/${process.env.I18N_AIRTABLE_TABLE}`,
  );

  let { records, offset } = data;

  let languages = [];
  let config = {};

  if (records.length > 0) {
    languages = Object.keys(records[0].fields).filter((item) => item !== 'key');
    for (const lng of languages) {
      config[lng] = { translation: {} };
    }
  }

  for (const record of records) {
    const fields = record.fields;
    for (const lng of languages) {
      config[lng]['translation'][fields.key] = fields[lng];
    }
  }

  while (!!offset) {
    const { data } = await axios.get(
      `/v0/${process.env.I18N_AIRTABLE_WORKSPACE}/${process.env.I18N_AIRTABLE_TABLE}?offset=${offset}`,
    );

    offset = data.offset;

    for (const record of data.records) {
      const fields = record.fields;
      for (const lng of languages) {
        config[lng]['translation'][fields.key] = fields[lng];
      }
    }
  }

  if (!fs.existsSync(folder)) {
    await fsPromises.mkdir(folder);
  }

  await fsPromises.writeFile(`locales/config.json`, JSON.stringify(config, undefined, 2));
})();
