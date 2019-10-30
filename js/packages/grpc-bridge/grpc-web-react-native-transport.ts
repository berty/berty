import { grpc } from '@improbable-eng/grpc-web'

let awaitingExecution: Array<() => void> | null = null

function runCallbacks(): void {
	if (awaitingExecution) {
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
				for (let k = thisCallbackSet.length - 1; k > i; k--) {
					awaitingExecution.unshift(thisCallbackSet[k])
				}
				throw e
			}
		}
	}
}

function debug(...args: any[]): void {
	if (console.debug) {
		console.debug(...args)
	} else {
		console.log(...args)
	}
}

function detach(cb: () => void): void {
	if (awaitingExecution !== null) {
		awaitingExecution.push(cb)
		return
	}
	awaitingExecution = [cb]
	setTimeout(() => {
		runCallbacks()
	}, 0)
}

function codePointAtPolyfill(str: string, index: number): number {
	let code = str.charCodeAt(index)
	if (code >= 0xd800 && code <= 0xdbff) {
		const surr = str.charCodeAt(index + 1)
		if (surr >= 0xdc00 && surr <= 0xdfff) {
			code = 0x10000 + ((code - 0xd800) << 10) + (surr - 0xdc00)
		}
	}
	return code
}

function stringToArrayBuffer(str: string): Uint8Array {
	const asArray = new Uint8Array(str.length)
	let arrayIndex = 0
	for (let i = 0; i < str.length; i++) {
		const codePoint = (String.prototype as { codePointAt: (i: number) => number }).codePointAt
			? (str as { codePointAt: (i: number) => number }).codePointAt(i)
			: codePointAtPolyfill(str, i)
		asArray[arrayIndex++] = codePoint & 0xff
	}
	return asArray
}

class XHR implements grpc.Transport {
	options: grpc.TransportOptions
	init: grpc.XhrTransportInit
	xhr: XMLHttpRequest = new XMLHttpRequest()
	metadata: grpc.Metadata = new grpc.Metadata()
	index = 0

	constructor(transportOptions: grpc.TransportOptions, init: grpc.XhrTransportInit) {
		this.options = transportOptions
		this.init = init
	}

	protected onProgressEvent(): void {
		this.options.debug && debug('XHR.onProgressEvent.length: ', this.xhr.response.length)
		const rawText = this.xhr.response.substr(this.index)
		this.index = this.xhr.response.length
		const asArrayBuffer = stringToArrayBuffer(rawText)
		detach(() => {
			this.options.onChunk(asArrayBuffer)
		})
	}

	onLoadEvent(): void {
		detach(() => {
			this.options.onEnd()
		})
	}

	onStateChange(): void {
		if (this.xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
			detach(() => {
				this.options.onHeaders(new grpc.Metadata(this.xhr.getAllResponseHeaders()), this.xhr.status)
			})
		}
	}

	sendMessage(msgBytes: Uint8Array): void {
		this.xhr.send(msgBytes)
	}

	finishSend(): void {
		return
	}

	start(metadata: grpc.Metadata): void {
		this.metadata = metadata

		const xhr = new XMLHttpRequest()
		this.xhr = xhr
		xhr.open('POST', this.options.url)

		this.configureXhr()

		this.metadata.forEach((key, values) => {
			xhr.setRequestHeader(key, values.join(', '))
		})

		xhr.withCredentials = Boolean(this.init.withCredentials)

		xhr.addEventListener('readystatechange', this.onStateChange.bind(this))
		xhr.addEventListener('progress', this.onProgressEvent.bind(this))
		xhr.addEventListener('loadend', this.onLoadEvent.bind(this))
		xhr.addEventListener('error', (err: ProgressEvent) => {
			detach(() => {
				this.options.onEnd(new Error(`XHR Error: ${err}`))
			})
		})
	}

	protected configureXhr(): void {
		this.xhr.responseType = 'text'
		this.xhr.overrideMimeType('text/plain; charset=x-user-defined')
	}

	cancel(): void {
		this.xhr.abort()
	}
}

class ArrayBufferXHR extends XHR {
	configureXhr(): void {
		if (this.options.debug) {
			debug("ArrayBufferXHR.configureXhr: setting responseType to 'arraybuffer'")
		}
		this.xhr.responseType = 'arraybuffer'
	}

	onProgressEvent(): void {
		return
	}

	onLoadEvent(): void {
		const resp = this.xhr.response
		this.options.debug && debug('ArrayBufferXHR.onLoadEvent: ', new Uint8Array(resp))
		detach(() => {
			this.options.onChunk(new Uint8Array(resp), /* flush */ true)
		})
		detach(() => {
			this.options.onEnd()
		})
	}
}
export function ReactNativeTransport(init: grpc.XhrTransportInit): grpc.TransportFactory {
	return (opts: grpc.TransportOptions): XHR => {
		return new ArrayBufferXHR(opts, init)
	}
}
