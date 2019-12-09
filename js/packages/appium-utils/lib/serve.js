const finalhandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')

serveStatic.mime.define({ 'application/javascript': ['js', 'bundle'] })

// Serve up served folder
const serve = serveStatic('served')

// Create server
const server = http.createServer(function onRequest(req, res) {
	console.log('REQ:', req.url)
	if (req.url === '/status') {
		res.end('packager-status:running')
		return
	}
	serve(req, res, finalhandler(req, res))
})

// Listen
server.listen(8081, '127.0.0.1')
