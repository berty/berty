// this script is used in CI to ignore the Podfile.lock on some react-native internal libs due
// to https://github.com/facebook/react-native/issues/31121

const fs = require('fs')

const podfileLockPath = 'ios/Podfile.lock'
const podsHashesPath = 'ios/pods-hashes.json'
const podsNames = ['DoubleConversion', 'FBReactNativeSpec', 'glog']

const podfileLock = fs.readFileSync(podfileLockPath).toString('utf-8')
const makeRegExp = lib => new RegExp(`^  ${lib}: ([a-f0-9]+)$`)
const libsHashes = {}
for (const lib of podsNames) {
	const regexp = makeRegExp(lib)
	const lines = podfileLock.split('\n')
	for (const line of lines) {
		const res = regexp.exec(line)
		if (res !== null && res.length >= 2) {
			libsHashes[lib] = res.input
		}
	}
}
fs.writeFileSync(podsHashesPath, JSON.stringify(libsHashes))
