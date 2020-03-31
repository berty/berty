import React, { useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { Chat } from '@berty-tech/hooks'

const LinkHandler: React.FC<{}> = () => {
	const sendContactRequest = Chat.useAccountSendContactRequest()
	const [initialURLHandled, setInitialURLHandled] = useState(false)
	useEffect(() => {
		const handler = ({ url }: { url: string }) => {
			const [scheme, uriComponent] = url.split('://')
			if (scheme === 'berty') {
				const data = decodeURIComponent(uriComponent)
				sendContactRequest(data)
			}
		}
		if (!initialURLHandled) {
			Linking.getInitialURL().then((url) => {
				if (url) {
					handler({ url })
					setInitialURLHandled(true)
				}
			})
		}
		Linking.addEventListener('url', handler)
		return () => {
			Linking.removeEventListener('url', handler)
		}
	})
	return null
}

export default LinkHandler
