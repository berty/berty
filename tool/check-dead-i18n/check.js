#!/usr/bin/env node

// Imports
const fs = require("fs");
const path = require("path");

// Global const
const scriptDir = __dirname;
const packagesDir = path.join(scriptDir, "../../js/packages");
const i18nDir = path.join(packagesDir, "i18n/locale");
const i18nJSON = path.join(i18nDir, "en-US/messages.json");
const assetsDir = path.join(packagesDir, "assets");
const dirsToIgnore = [i18nDir, assetsDir];
const filesToIgnore = [
	".png",
	".svg",
	".ico",
	"yarn.lock",
	"README.md",
	".gitignore",
];

// Read i18n JSON
const json = JSON.parse(fs.readFileSync(i18nJSON, "utf8"));

// List i18n keys
var keys = [];
const recListKeys = (upKey, upValue) => {
	for (const [key, value] of Object.entries(upValue)) {
		const path = upKey ? `${upKey}.${key}` : key;
		if (!!value && value.constructor === Object) {
			recListKeys(path, value);
		} else {
			keys.push(path);
		}
	}
};
recListKeys("", json);

// List files in packages folder
var files = [];
const recListFiles = (upPath) => {
	const currDirFiles = fs.readdirSync(upPath);

	currDirFiles.forEach((file) => {
		const path = upPath + "/" + file;
		if (fs.statSync(path).isDirectory()) {
			for (const dirToIgnore of dirsToIgnore) {
				if (path === dirToIgnore) return;
			}
			recListFiles(path);
		} else {
			for (const fileToIgnore of filesToIgnore) {
				if (path.endsWith(fileToIgnore)) return;
			}
			files.push(path);
		}
	});
};
recListFiles(packagesDir);

// Cat file content
var content = "";
for (const file of files) {
	content += fs.readFileSync(file);
}

// List unused keys
var unusedKeys = [];
for (const key of keys) {
	if (!content.includes(key)) unusedKeys.push(key);
}

// Error and display if unused key found
if (unusedKeys.length !== 0) {
	console.log(`Unused i18n key${unusedKeys.length === 1 ? "" : "s"}:`);
	for (const unusedKey of unusedKeys) console.log(`\t${unusedKey}`);
	process.exit(1);
}
