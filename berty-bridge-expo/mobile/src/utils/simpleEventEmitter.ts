type Listener = (...args: any[]) => void

export class SimpleEventEmitter {
	private listeners: Record<string, Listener[]> = {}

	on(event: string, listener: Listener) {
		if (!this.listeners[event]) {
			this.listeners[event] = []
		}
		this.listeners[event].push(listener)
	}

	emit(event: string, ...args: any[]) {
		const listeners = this.listeners[event]
		if (!listeners) {
			return
		}
		for (const listener of listeners) {
			listener(...args)
		}
	}
}
