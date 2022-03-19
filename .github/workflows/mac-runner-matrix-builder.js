// This script generates a matrix for iOS building
const https = require("https");

// Check parameters
const mode = process.argv[2] || "random";
const token = process.argv[3];

if (
	!["random", "all", "dc4", "github", "optimized"].includes(mode) ||
	(mode === "optimized" && !token)
) {
	console.error(
		`Usage: ${process.argv[1]} [random | all | dc4 | github | optimized <github_token>]`
	);
	process.exit(1);
}

// Function that request Github API to get self-hosted runners status
async function getDC4RunnersStatus() {
	const options = {
		hostname: "api.github.com",
		path: "/orgs/berty/actions/runners",
		port: 443,
		method: "GET",
		timeout: 30000,
		headers: {
			"User-agent": "Mozilla/4.0 Custom User Agent",
			Authorization: `token ${token}`,
		},
	};

	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			const body = [];
			res.on("data", (chunk) => body.push(chunk));
			res.on("end", () => {
				const resString = Buffer.concat(body).toString();

				if (res.statusCode < 200 || res.statusCode > 299) {
					return reject(
						new Error(`HTTP status code ${res.statusCode}: ${resString}`)
					);
				}
				resolve(resString);
			});
		});

		req.on("error", (err) => {
			reject(err);
		});

		req.on("timeout", () => {
			req.destroy();
			reject(new Error("Request timed out"));
		});

		req.end();
	});
}

// Returns true if at least one self-hosted runner is available
async function isDC4RunnerAvailable() {
	try {
		const json = await getDC4RunnersStatus();
		const stat = JSON.parse(json);
		console.debug("status: " + JSON.stringify(stat, undefined, 2));

		for (const runner of stat.runners) {
			if (runner.status === "online" && runner.busy === false) return true;
		}
	} catch (err) {
		console.error("Github API request self-hosted status error:", err);
	}

	return false;
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
		case "optimized":
			return (await isDC4RunnerAvailable()) ? [runners.dc4] : [runners.github];
		case "random":
			return Math.random() < 0.5 ? [runners.dc4] : [runners.github];
		case "all": // (in parallel)
			return [runners.dc4, runners.github];
		case "dc4":
			return [runners.dc4];
		case "github":
			return [runners.github];
	}
}

getMatrix().then((matrix) => {
	console.debug("matrix: " + JSON.stringify(matrix, undefined, 2));
	console.log(
		"::set-output name=matrix::" + JSON.stringify({ include: matrix })
	);
});
