export const convertMAddr = (urls: String[]): string | null =>
	urls
		.map((maddr: String) => {
			if (maddr === '/mock') {
				return 'mock://'
			}

			const ip = maddr.match(/\/ip([46])\/([^/]+)\/tcp\/([0-9]+)\/grpcws/)
			if (ip !== null) {
				const preIP = ip[1] === '6' ? '[' : ''
				const postIP = ip[1] === '6' ? ']' : ''

				return `http://${preIP}${ip[2]}${postIP}:${ip[3]}`
			}

			const hostname = maddr.match(/\/dns[46]\/([a-z0-9-.]+)\/tcp\/([0-9]+)\/grpcws/)
			if (hostname !== null) {
				return `http://${hostname[1]}:${hostname[2]}`
			}

			// TODO: support TLS

			return null
		})
		.reduce((prev: string | null, curr: string | null) => (prev ? prev : curr), null)
