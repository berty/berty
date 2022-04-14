#!/usr/bin/env node
const inliner = require("inliner");
const fs = require("fs");
const path = require("path");
const gzip = require("gzip-js");
const filesize = require("filesize");
const styles = require("ansi-styles");

const prefixWarn = `${styles.yellow.open}[Warn]${styles.yellow.close}`;
const prefixInfo = `${styles.blue.open}[Info]${styles.blue.close}`;
const prefixFail = `${styles.red.open}[Fail]${styles.red.close}`;
const prefixDone = `${styles.green.open}[Done]${styles.green.close}`;

function printUsageAndExit(reason) {
	const scriptPath = path.basename(__filename);
	console.error(
		`${prefixFail} ${reason}\nUsage: ./${scriptPath} <input-html-file | input-http-url> [<output-dir>]`
	);
	process.exit(1);
}

if (process.argv.length < 3) {
	printUsageAndExit("You must at least pass an <input> parameter");
} else if (process.argv.length > 4) {
	printUsageAndExit("Too many parameters (max 2)");
}

const input = process.argv[2];
const outputDir = process.argv[3] || ".";

console.info(`${prefixInfo} Bundle creation started`);

new inliner(input, (err, html) => {
	if (err) {
		console.error(`${prefixFail} ${err}`);
		process.exit(2);
	}

	const compressedHtml = Buffer.from(gzip.zip(html));
	console.info(
		`${prefixInfo} Uncompressed bundle size: ${filesize(html.length, {
			round: 0,
		})}`
	);
	console.info(
		`${prefixInfo} Compressed bundle size: ${filesize(compressedHtml.length, {
			round: 0,
		})}`
	);

	try {
		const filepath = path.join(outputDir, "game.html.gz");
		fs.writeFileSync(filepath, compressedHtml);
		console.info(`${prefixDone} Bundle created successfully: ${filepath}`);
	} catch (err) {
		console.error(`${prefixFail} ${err}`);
		process.exit(3);
	}
}).on("warning", (warning) => {
	console.warn(`${prefixWarn} ${warning}`);
});
