#!/usr/bin/env node
const statusGetter = require("./get-self-hosted-runner-status");

// Check parameters
const mode = process.argv[2] || "self-hosted";

if (
	!["self-hosted", "github", "optimized"].includes(mode) ||
	process.argv.length > 3
) {
	console.error(`Usage: ${process.argv[1]} [self-hosted | github | optimized]`);
	process.exit(1);
}

// Returns matrix according to parameters and self-hosted runner availability
async function getMatrix() {
	const runners = {
		selfhosted: {
			name: "self-hosted",
			runner: ["self-hosted", "macOS", "public"],
			selfhosted: true,
		},
		github: {
			name: "github",
			runner: ["macos-15"],
			selfhosted: false,
		},
	};

	switch (mode) {
		case "self-hosted":
			return [runners.selfhosted];
		case "github":
			return [runners.github];
		case "optimized":
			return (await statusGetter.isSelfHostedRunnerAvailable())
				? [runners.selfhosted]
				: [runners.github];
	}
}

getMatrix().then((matrix) => {
	console.debug("matrix: " + JSON.stringify(matrix, undefined, 2));
	console.log(
		"::set-output name=matrix::" + JSON.stringify({ include: matrix }),
	);
});
