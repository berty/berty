// this script is used in CI to ignore the Podfile.lock on some react-native internal libs due
// to https://github.com/facebook/react-native/issues/31121

const fs = require('fs')
const { Buffer } = require('buffer')

const podfileLockPath = 'ios/Podfile.lock'
const podsHashesPath = 'ios/pods-hashes.json'

const podfileLock = fs.readFileSync(podfileLockPath).toString('utf-8')
const makeRegExp = lib => new RegExp(`^  ${lib}: ([a-f0-9]+)$`)
const podsHashes = JSON.parse(fs.readFileSync(podsHashesPath).toString('utf-8'))
const podsNames = Object.keys(podsHashes)
let newPodfileLock = ''

const lines = podfileLock.split('\n')
for (const line of lines) {
	let found = false
	for (const lib of podsNames) {
		const regexp = makeRegExp(lib)
		const res = regexp.exec(line)
		if (res !== null && res.length >= 2) {
			console.log(`Replacing:\n${line}\nWith:\n${podsHashes[lib]}`)
			newPodfileLock += `${podsHashes[lib]}\n`
			found = true
			break
		}
	}
	if (!found) {
		newPodfileLock += `${line}\n`
	}
}

// remove trailing newline
if (newPodfileLock[newPodfileLock.length - 1] === '\n') {
	newPodfileLock = newPodfileLock.substr(0, newPodfileLock.length - 1)
}

fs.writeFileSync(podfileLockPath, Buffer.from(newPodfileLock, 'utf-8'))
