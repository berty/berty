/* globals WebSocket */

import { grpc } from '@improbable-eng/grpc-web'

enum WebsocketSignal {
	FINISH_SEND = 1,
}

const finishSendFrame = new Uint8Array([1])

function constructWebSocketAddress(url: string): string {
	if (url.substr(0, 8) === 'https://') {
		return `wss://${url.substr(8)}`
	} else if (url.substr(0, 7) === 'http://') {
		return `ws://${url.substr(7)}`
	}
	throw new Error('Websocket transport constructed with non-https:// or http:// host.')
}

const isAllowedControlChars = (char: number) => char === 0x9 || char === 0xa || char === 0xd

function isValidHeaderAscii(val: number): boolean {
	return isAllowedControlChars(val) || (val >= 0x20 && val <= 0x7e)
}

function encodeASCII(input: string): Uint8Array {
	const encoded = new Uint8Array(input.length)
	for (let i = 0; i !== input.length; ++i) {
		const charCode = input.charCodeAt(i)
		if (!isValidHeaderAscii(charCode)) {
			throw new Error('Metadata contains invalid ASCII')
		}
		encoded[i] = charCode
	}
	return encoded
}

function headersToBytes(headers: grpc.Metadata): Uint8Array {
	let asString = ''
	headers.forEach((key: string, values: Array<string>) => {
		asString += `${key}: ${values.join(', ')}\r\n`
	})
	return encodeASCII(asString)
}

let awaitingExecution: Array<() => void> | null = null
function runCallbacks(): void {
	if (awaitingExecution) {
		// Use a new reference to the awaitingExecution array to allow callbacks to add to the "new" awaitingExecution array
		const thisCallbackSet = awaitingExecution
		awaitingExecution = null
		for (let i = 0; i < thisCallbackSet.length; i++) {
			try {
				thisCallbackSet[i]()
			} catch (e) {
				if (awaitingExecution === null) {
					awaitingExecution = []
					setTimeout(() => {
						runCallbacks()
					}, 0)
				}
				// Add the remaining callbacks to the array so that they can be invoked on the next pass
				for (let k = thisCallbackSet.length - 1; k > i; k--) {
					awaitingExecution.unshift(thisCallbackSet[k])
				}
				// rethrow the error
				throw e
			}
		}
	}
}

function detach(cb: () => void): void {
	if (awaitingExecution !== null) {
		// there is a timer running, add to the list and this function will be executed with that existing timer
		awaitingExecution.push(cb)
		return
	}
	awaitingExecution = [cb]
	setTimeout(() => {
		runCallbacks()
	}, 0)
}

function websocketRequest(options: grpc.TransportOptions): grpc.Transport {
	options.debug && console.debug('websocketRequest', options)

	const webSocketAddress = constructWebSocketAddress(options.url)

	const sendQueue: Array<Uint8Array | WebsocketSignal> = []
	let ws: WebSocket

	function sendToWebsocket(toSend: Uint8Array | WebsocketSignal): void {
		if (toSend === WebsocketSignal.FINISH_SEND) {
			ws.send(finishSendFrame)
		} else {
			const byteArray = toSend as Uint8Array
			const c = new Int8Array(byteArray.byteLength + 1)
			c.set(new Uint8Array([0]))

			c.set((byteArray as any) as ArrayLike<number>, 1)

			ws.send(c)
		}
	}

	return {
		sendMessage: (msgBytes: Uint8Array): void => {
			if (!ws || ws.readyState === ws.CONNECTING) {
				sendQueue.push(msgBytes)
			} else {
				sendToWebsocket(msgBytes)
			}
		},
		finishSend: (): void => {
			if (!ws || ws.readyState === ws.CONNECTING) {
				sendQueue.push(WebsocketSignal.FINISH_SEND)
			} else {
				sendToWebsocket(WebsocketSignal.FINISH_SEND)
			}
		},
		start: (metadata: grpc.Metadata): void => {
			ws = new WebSocket(webSocketAddress, ['grpc-websockets'])
			ws.binaryType = 'arraybuffer'
			ws.onopen = function() {
				options.debug && console.debug('websocketRequest.onopen')
				ws.send(headersToBytes(metadata))

				// send any messages that were passed to sendMessage before the connection was ready
				sendQueue.forEach((toSend): void => {
					sendToWebsocket(toSend)
				})
			}

			ws.onclose = function(closeEvent) {
				options.debug && console.debug('websocketRequest.onclose', closeEvent)
				detach((): void => {
					options.onEnd()
				})
			}

			ws.onerror = function(error) {
				options.debug && console.debug('websocketRequest.onerror', error)
			}

			ws.onmessage = function(e) {
				detach((): void => {
					options.onChunk(new Uint8Array(e.data))
				})
			}
		},
		cancel: (): void => {
			options.debug && console.debug('websocket.abort')
			detach(() => {
				ws.close()
			})
		},
	}
}

export function WebsocketTransport(): grpc.TransportFactory {
	return (opts: grpc.TransportOptions): grpc.Transport => {
		return websocketRequest(opts)
	}
}
