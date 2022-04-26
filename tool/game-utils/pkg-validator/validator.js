#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const semver = require("semver");
const url = require("valid-url");
const gzip = require("gzip-js");
const open = require("open");
const styles = require("ansi-styles");
const imgsize = require("image-size");
const readChunk = require("read-chunk");
const imageType = require("image-type");
const filesize = require("filesize");
const yesno = require("yesno");
const os = require("os");

const prefixWarn = `${styles.yellow.open}[Warn]${styles.yellow.close}`;
const prefixInfo = `${styles.blue.open}[Info]${styles.blue.close}`;
const prefixFail = `${styles.red.open}[Fail]${styles.red.close}`;
const prefixDone = `${styles.green.open}[Done]${styles.green.close}`;

if (process.argv.length > 3) {
	console.error(`${prefixFail} Too many parameters (max 1)`);
	console.error(`Usage: ./${path.basename(__filename)} [<pkg-dir>]`);
	process.exit(1);
}

const iconName = "icon.png";
const bundleName = "game.html.gz";
const manifestName = "manifest.json";

var filesFound = [];
const filesRequired = [iconName, bundleName, manifestName];

const manifestSpecs = [
	{
		key: "manifest_version",
		type: "number",
		required: true,
		validator: (value) => {
			return value === 1;
		},
		err: "must be equal to 1",
	},
	{
		key: "name",
		type: "string",
		required: true,
		validator: (value) => {
			return value.length > 0;
		},
		err: "must not be empty",
	},
	{
		key: "author",
		type: "string",
		required: true,
		validator: (value) => {
			return value.length > 0;
		},
		err: "must not be empty",
	},
	{
		key: "description",
		type: "string",
		required: true,
		validator: (value) => {
			return value.length > 0;
		},
		err: "must not be empty",
	},
	{
		key: "exit_info",
		type: "string",
		required: false,
		validator: (value) => {
			return value.length > 0;
		},
		err: "must not be empty",
	},
	{
		key: "version",
		type: "string",
		required: true,
		validator: (value) => {
			return semver.valid(value);
		},
		err: "must be a valid semantic version",
	},
	{
		key: "orientation",
		type: "string",
		required: true,
		validator: (value) => {
			return ["landscape", "portrait", "both"].includes(value);
		},
		err: "must either be 'landscape', 'portrait' or 'both'",
	},
	{
		key: "sources",
		type: "string",
		required: true,
		validator: (value) => {
			return url.isWebUri(value);
		},
		err: "must be a valid web URL (http[s])",
	},
];

const iconSpecs = {
	width: 256,
	height: 256,
	type: "image/png",
};

const pkgDir = process.argv[2] || ".";
const iconPath = path.join(pkgDir, iconName);
const bundlePath = path.join(pkgDir, bundleName);
const manifestPath = path.join(pkgDir, manifestName);

console.info(`${prefixInfo} Validating Package Content`);
try {
	var files = fs.readdirSync(pkgDir);

	for (const file of filesRequired) {
		const indexFound = files.indexOf(file);

		if (indexFound === -1) {
			console.info(`${prefixFail} required file is missing: ${file}`);
		} else {
			filesFound.push(file);
			files.splice(indexFound, 1);
			console.info(`${prefixDone} required file found: ${file}`);
		}
	}

	for (const unexpected of files) {
		console.warn(`${prefixWarn} unexpected file found: ${unexpected}`);
	}
} catch (err) {
	console.error(`${prefixFail} ${err}`);
}

if (filesFound.includes(manifestName)) {
	console.info(`\n${prefixInfo} Validating Manifest`);
	try {
		const manifestJson = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

		for (const manifestSpec of manifestSpecs) {
			const value = manifestJson[manifestSpec.key];

			if (value === undefined) {
				if (manifestSpec.required) {
					console.error(
						`${prefixFail} required key "${manifestSpec.key}" is missing`
					);
				}
			} else if (value === null) {
				console.error(`${prefixFail} key "${manifestSpec.key}" value is null`);
			} else if (typeof value !== manifestSpec.type) {
				console.error(
					`${prefixFail} key "${
						manifestSpec.key
					}" value type is wrong: required(${
						manifestSpec.type
					}) / current(${typeof value})`
				);
			} else if (!manifestSpec.validator(value)) {
				console.error(
					`${prefixFail} key "${manifestSpec.key}" ${manifestSpec.err}`
				);
			} else {
				console.info(`${prefixDone} key "${manifestSpec.key}" is valid`);
			}
		}
	} catch (err) {
		console.error(`${prefixFail} ${err}`);
	}
}

if (filesFound.includes(iconName)) {
	console.info(`\n${prefixInfo} Validating Icon`);
	try {
		const header = readChunk.sync(iconPath, 0, 12);
		const type = imageType(header);
		if (type.mime !== iconSpecs.type) {
			throw `Wrong image type: required(${iconSpecs.type}) / current(${type.mime})`;
		}
		console.info(`${prefixDone} Icon type is valid`);

		const dimensions = imgsize(iconPath);
		if (
			dimensions.width !== iconSpecs.width ||
			dimensions.height !== iconSpecs.height
		) {
			throw `Wrong image size: required(${iconSpecs.width}x${iconSpecs.height}) / current(${dimensions.width}x${dimensions.height})`;
		}

		console.info(`${prefixDone} Icon size is valid`);
	} catch (err) {
		console.error(`${prefixFail} ${err}`);
	}
}

if (filesFound.includes(bundleName)) {
	console.info(`\n${prefixInfo} Validating Game Bundle`);
	try {
		const bundleCompressed = fs.readFileSync(bundlePath);
		const bundleUncompressed = Buffer.from(gzip.unzip(bundleCompressed));
		console.info(
			`${prefixInfo} Compressed bundle size: ${filesize(
				bundleCompressed.length,
				{
					round: 0,
				}
			)}`
		);
		console.info(
			`${prefixInfo} Uncompressed bundle size: ${filesize(
				bundleUncompressed.length,
				{
					round: 0,
				}
			)}`
		);
		console.info(`${prefixDone} Bundle is a valid gzip archive`);

		yesno({
			question: "Do you want to open game bundle in a browser?",
		}).then((confirmation) => {
			if (confirmation) {
				const tmpBundlePath = path.join(os.tmpdir(), "game.html");
				fs.writeFileSync(tmpBundlePath, bundleUncompressed, {
					encoding: "utf8",
				});
				open(tmpBundlePath);
				console.info(`${prefixDone} Bundle opened in browser`);
			}
		});
	} catch (err) {
		console.error(`${prefixFail} ${err}`);
	}
}
