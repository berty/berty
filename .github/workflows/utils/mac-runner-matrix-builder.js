#!/usr/bin/env node
const statusGetter = require("./get-self-hosted-runner-status");

// Check parameters
const mode = process.argv[2] || "self-hosted";
const token = process.argv[3];

if (
	!["self-hosted", "github", "optimized"].includes(mode) ||
	(mode === "optimized" && process.argv.length !== 4) ||
	(mode !== "optimized" && process.argv.length !== 3 && process.argv[2])
) {
	console.error(
		`Usage: ${process.argv[1]} [self-hosted | github | optimized <github_token>]`
	);
	process.exit(1);
}

// Returns matrix according to parameters and self-hosted runner availability
async function getMatrix() {
	const runners = {
		selfhosted: {
			name: "self-hosted",
			runner: ["self-hosted", "self-hosted"],
			selfhosted: true,
		},
		github: {
			name: "github",
			runner: ["macos-12"],
			selfhosted: false,
		},
	};

	switch (mode) {
		case "self-hosted":
			return [runners.selfhosted];
		case "github":
			return [runners.github];
		case "optimized":
			return (await statusGetter.isSelfHostedRunnerAvailable(token))
				? [runners.selfhosted]
				: [runners.github];
	}
}

getMatrix().then((matrix) => {
	console.debug("matrix: " + JSON.stringify(matrix, undefined, 2));
	console.log(
		"::set-output name=matrix::" + JSON.stringify({ include: matrix })
	);
});
