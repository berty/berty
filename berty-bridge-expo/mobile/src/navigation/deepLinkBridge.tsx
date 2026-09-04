import { usePathname, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Linking, Platform } from 'react-native'
import { useSelector } from 'react-redux'

import { useAppDispatch } from '@berty/hooks'
import { selectHandledLink, setHandledLink } from '@berty/redux/reducers/ui.reducer'

import { encodeParams } from './params'
import { ROUTE_PATHS } from './routes'

// Expo dev-client launch URLs (Metro connection), not Berty deep links: ignore them.
const isExpoDevClientUrl = (url: string) =>
	url.includes('expo-development-client') || url.startsWith('exp://')

// Process the persisted launch URL once.
let initialUrlHandled = false

const DeepLinkListener: React.FC = React.memo(function DeepLinkListener() {
	const router = useRouter()
	const dispatch = useAppDispatch()
	const handledLink = useSelector(selectHandledLink)

	useEffect(() => {
		if (!initialUrlHandled) {
			initialUrlHandled = true
			Linking.getInitialURL()
				.then(linkingUrl => {
					if (linkingUrl && !isExpoDevClientUrl(linkingUrl)) {
						dispatch(setHandledLink(linkingUrl))
					}
				})
				.catch(err => console.warn('failed to get initial URL', err))
		}

		const handleOpenUrl = (event: { url: string }) => {
			if (isExpoDevClientUrl(event.url)) {
				return
			}
			dispatch(setHandledLink(event.url))
		}

		const sub = Linking.addEventListener('url', handleOpenUrl)
		return () => sub.remove()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (handledLink) {
			dispatch(setHandledLink(null))
			router.push({
				pathname: ROUTE_PATHS['Chat.ManageDeepLink'] as never,
				params: encodeParams('Chat.ManageDeepLink', {
					type: 'link',
					value: handledLink,
				}) as never,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [handledLink])

	return null
})

// Previously this was injected around every screen by stacks.tsx, which skipped
// the whole Account namespace (the `'OpeningAccount' in SubComponents` check) and
// web. Mounted once at the root layout now, with the same exclusions.
export const DeepLinkBridge: React.FC = React.memo(function DeepLinkBridge() {
	const pathname = usePathname()

	if (Platform.OS === 'web' || pathname.startsWith('/account')) {
		return null
	}

	return <DeepLinkListener />
})
