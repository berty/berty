var fs = require("fs");

if (process.argv.length < 3) return;

var file = process.argv[2];

var content = fs.readFileSync(file);

console.log(
  `export default Buffer.from("${content.toString("base64")}", "base64")`
);
