#!/usr/bin/env node
const inliner = require("inliner");
const fs = require("fs");
const gzip = require("gzip-js");

if (process.argv.length != 4) {
  console.error("Error: you must pass 2 parameters");
  console.error(
    `Usage: ${process.argv[1]} <input-html-file | input-http-url> <output-file>`
  );
  process.exit(1);
}

const input = process.argv[2];
const output = process.argv[3];

new inliner(input, (err, html) => {
  if (err) {
    console.error(`Error: ${err}`);
    process.exit(2);
  }

  const compressedHtml = Buffer.from(gzip.zip(html));

  try {
    fs.writeFileSync(output, compressedHtml, { encoding: "binary" });
  } catch (err) {
    console.error(`Error: ${err}`);
    process.exit(3);
  }
});
