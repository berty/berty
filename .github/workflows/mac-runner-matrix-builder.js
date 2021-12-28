// this script generates a matrix for iOS building

var templates = {
	"dc4": {
		name: "dc4",
		runner: ["self-hosted", "dc4"],
		selfhosted: true,
		golang: '1.17.x',
		xcode: '13.x',
		node: '16.x',
	},
	"github": {
		name: "github",
		runner: ["macos-11"],
		selfhosted: false,
		golang: '1.17.x',
		xcode: '13.x',
		node: '16.x',
	},
};

var mode = process.argv[2] || "random";

var matrix = [];
switch (mode) {
	case "optimized":
		// TODO: return a dc4 node if available, else, return a github node as a fallback
		throw { name: "NotImplementedError", message: "too lazy to implement" };
		break;
	case "random":
		matrix.push(templates.dc4);
		matrix.push(templates.github);
		matrix.sort((a, b) => 0.5 - Math.random());
		matrix = [matrix[0]];
		break;
	case "all": // (in parallel)
		matrix.push(templates.dc4);
		matrix.push(templates.github);
		break;
	case "dc4":
		matrix.push(templates.dc4);
		break;
	case "github":
		matrix.push(templates.github);
		break;
}

console.debug('matrix: ' + JSON.stringify(matrix, undefined, 2));
console.log('::set-output name=matrix::' + JSON.stringify({ include: matrix }));
