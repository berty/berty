#!/usr/bin/env node
const https = require("https");

// Function that request Github API to get self-hosted runners status
async function getDC4RunnersStatus(token) {
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

// Return hom many self-hosted runners are online
async function getDC4RunnersOnlineCount(token) {
	return new Promise((resolve, reject) => {
		getDC4RunnersStatus(token)
			.then((json) => {
				const stat = JSON.parse(json);
				const total = stat.runners.length;
				var count = 0;
				var desc = "None";

				for (const runner of stat.runners) {
					if (runner.status === "online") count++;
				}

				if (count === total && total > 0) desc = "All";
				else if (count > 0) desc = "Partially";

				resolve(`${desc} (${count}/${total})`);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

// Returns true if at least one self-hosted runner is available
async function isDC4RunnerAvailable(token) {
	try {
		const json = await getDC4RunnersStatus(token);
		const stat = JSON.parse(json);

		for (const runner of stat.runners) {
			if (runner.status === "online" && runner.busy === false) return true;
		}
	} catch (err) {
		console.error("Github API request self-hosted status error:", err);
	}

	return false;
}

// If executed as a script
if (require.main === module) {
	const token = process.argv[2];
	const onlineCheck = process.argv[3];

	if (!token || (onlineCheck && onlineCheck !== "online")) {
		console.error(`Usage: ${process.argv[1]} <github_token> [online]`);
		process.exit(1);
	}

	if (onlineCheck) {
		getDC4RunnersOnlineCount(token)
			.then((count) => console.log(count))
			.catch((err) => {
				console.error(err);
				process.exit(1);
			});
	} else {
		getDC4RunnersStatus(token)
			.then((json) => {
				console.log(JSON.stringify(JSON.parse(json), undefined, 2));
			})
			.catch((err) => {
				console.error(err);
				process.exit(1);
			});
	}
}

// Export module functions
module.exports = {
	getDC4RunnersStatus: getDC4RunnersStatus,
	isDC4RunnerAvailable: isDC4RunnerAvailable,
};
