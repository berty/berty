'use strict'

const { CLIError, logger } = require('@react-native-community/cli-tools')
const child_process = require('child_process')
const chalk = require('chalk')

function getProductName(buildOutput) {
	const productNameMatch = /export FULL_PRODUCT_NAME="?(.+).app"?$/m.exec(buildOutput)
	return productNameMatch ? productNameMatch[1] : null
}

function getProcessOptions({ packager, terminal, port }) {
	if (packager) {
		return {
			env: {
				...process.env,
				RCT_TERMINAL: terminal,
				RCT_METRO_PORT: port.toString(),
			},
		}
	}

	return {
		env: {
			...process.env,
			RCT_TERMINAL: terminal,
			RCT_NO_LAUNCH_PACKAGER: 'true',
		},
	}
}

function xcprettyAvailable() {
	try {
		child_process.execSync('xcpretty --version', {
			stdio: [0, 'pipe', 'ignore'],
		})
	} catch (error) {
		return false
	}
	return true
}

function buildProject(xcodeProject, udid, scheme, args) {
	return new Promise((resolve, reject) => {
		const xcodebuildArgs = [
			xcodeProject.isWorkspace ? '-workspace' : '-project',
			xcodeProject.name,
			'-configuration',
			args.configuration,
			'-scheme',
			scheme,
			'-destination',
			`id=${udid}`,
			'-derivedDataPath',
			`build/${scheme}`,
		]
		logger.info(`Building ${chalk.dim(`(using "xcodebuild ${xcodebuildArgs.join(' ')}")`)}`)
		let xcpretty
		if (!args.verbose) {
			xcpretty =
				xcprettyAvailable() &&
				child_process.spawn('xcpretty', [], {
					stdio: ['pipe', process.stdout, process.stderr],
				})
		}
		const buildProcess = child_process.spawn('xcodebuild', xcodebuildArgs, getProcessOptions(args))
		let buildOutput = ''
		let errorOutput = ''
		buildProcess.stdout.on('data', (data) => {
			const stringData = data.toString()
			buildOutput += stringData
			if (xcpretty) {
				xcpretty.stdin.write(data)
			} else {
				if (logger.isVerbose()) {
					logger.debug(stringData)
				} else {
					process.stdout.write('.')
				}
			}
		})
		buildProcess.stderr.on('data', (data) => {
			errorOutput += data
		})
		buildProcess.on('close', (code) => {
			if (xcpretty) {
				xcpretty.stdin.end()
			} else {
				process.stdout.write('\n')
			}
			if (code !== 0) {
				reject(
					new CLIError(
						`
            Failed to build iOS project.
            We ran "xcodebuild" command but it exited with error code ${code}. To debug build
            logs further, consider building your app with Xcode.app, by opening
            ${xcodeProject.name}.
          `,
						buildOutput + '\n' + errorOutput,
					),
				)
				return
			}
			resolve(getProductName(buildOutput) || scheme)
		})
	})
}

module.exports = buildProject
