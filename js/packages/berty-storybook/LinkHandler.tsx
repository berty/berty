import React, { useEffect, useState, useContext } from 'react'
import { Linking } from 'react-native'
import { ModalsContext } from '@berty-tech/berty-storybook'
import { InvalidScan } from './modals/InvalidScan'
import { AddThisContact } from './modals/AddThisContact'
import { useNavigation } from '@berty-tech/berty-navigation'

const LinkHandler: React.FC = () => {
	const [initialURLHandled, setInitialURLHandled] = useState(false)
	const modals = useContext(ModalsContext)
	//const navigation = useNavigation()
	useEffect(() => {
		const handler = ({ url }: { url: string }) => {
			const [scheme, uriComponent] = url.split('://')
			if (scheme === 'berty') {
				// navigation.reset('Main.List')
				try {
					const data = decodeURIComponent(uriComponent)
					const parts = data.split(' ')
					if (parts.length !== 2) {
						throw new Error('Corrupted content')
					}
					const [b64Name, ref] = parts
					const name = Buffer.from(b64Name, 'base64').toString('utf-8')
					console.log('add this contact')
					modals.setCurrent(<AddThisContact name={name} publicKey={'unknown'} reference={ref} />)
				} catch (e) {
					console.log('phail')
					modals.setCurrent(<InvalidScan title='This link is invalid!' error={`${e}`} />)
				}
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
