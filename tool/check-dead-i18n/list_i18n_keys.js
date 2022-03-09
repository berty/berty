#!/usr/bin/env node

// Check parameter
if (process.argv.length !== 3) {
	console.error(
		`Error: this script needs exactly 1 parameter\nUsage: ${process.argv[1]} <json-file>`,
	)
	process.exit(1)
}

// Read file
fs = require('fs')
fs.readFile(process.argv[2], 'utf8', (err, data) => {
	if (err) {
		console.log(err)
		process.exit(2)
	}

	// Parse JSON
	const json = JSON.parse(data)

	// List keys
	const recSearch = (upKey, upValue) => {
		for (const [key, value] of Object.entries(upValue)) {
			const path = upKey ? `${upKey}.${key}` : key
			if (!!value && value.constructor === Object) {
				recSearch(path, value)
			} else {
				console.log(path)
			}
		}
	}

	recSearch('', json)
})
