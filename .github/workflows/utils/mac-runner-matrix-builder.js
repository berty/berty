#!/usr/bin/env node
const statusGetter = require("./get-selfhosted-runner-status");

// Check parameters
const mode = process.argv[2] || "random";
const token = process.argv[3];

if (
	!["random", "all", "dc4", "github", "optimized"].includes(mode) ||
	(mode === "optimized" && process.argv.length !== 4) ||
	(mode !== "optimized" && process.argv.length !== 3 && process.argv[2])
) {
	console.error(
		`Usage: ${process.argv[1]} [random | all | dc4 | github | optimized <github_token>]`
	);
	process.exit(1);
}

// Returns matrix according to parameters and self-hosted runner availability
async function getMatrix() {
	const matrixBase = {
		golang: "1.17.x",
		xcode: "13.x",
		node: "16.x",
	};
	const runners = {
		dc4: {
			name: "dc4",
			runner: ["self-hosted", "dc4"],
			selfhosted: true,
			...matrixBase,
		},
		github: {
			name: "github",
			runner: ["macos-11"],
			selfhosted: false,
			...matrixBase,
		},
	};

	switch (mode) {
		case "random":
			return Math.random() < 0.5 ? [runners.dc4] : [runners.github];
		case "all": // (in parallel)
			return [runners.dc4, runners.github];
		case "dc4":
			return [runners.dc4];
		case "github":
			return [runners.github];
		case "optimized":
			return (await statusGetter.isDC4RunnerAvailable(token))
				? [runners.dc4]
				: [runners.github];
	}
}

getMatrix().then((matrix) => {
	console.debug("matrix: " + JSON.stringify(matrix, undefined, 2));
	console.log(
		"::set-output name=matrix::" + JSON.stringify({ include: matrix })
	);
});
