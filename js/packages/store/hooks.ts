import React, { EffectCallback, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

import beapi from '@berty/api'
import colors from '@berty/assets/themes/default-theme.json'
import darkTheme from '@berty/assets/themes/dark-theme.json'
import { useAllConversations, useAllContacts, useConversation, useAppDispatch } from '@berty/hooks'

import { NotificationsInhibitor } from './types'
import { fakeContacts, fakeMultiMemberConversations } from './faker'
import { ParsedInteraction } from './types.gen'
import { useSelector } from 'react-redux'
import {
	selectThemeCollection,
	selectThemeIsDark,
	selectThemeSelected,
	ThemeType,
} from '@berty/redux/reducers/theme.reducer'
import {
	addNotificationInhibitor,
	MESSENGER_APP_STATE,
	removeNotificationInhibitor,
	selectAppState,
	selectClient,
} from '@berty/redux/reducers/ui.reducer'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
	UpdatesProfileNotification,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export type Maybe<T> = T | null | undefined

export const useStylesBertyId = ({
	iconIdSize = 45,
	iconShareSize = 26,
	titleSize = 26,
	contentScaleFactor = 0.66,
	avatarSize = 90,
}: {
	iconIdSize?: number
	iconShareSize?: number
	titleSize?: number
	contentScaleFactor?: number
	avatarSize?: number
}) => {
	const _iconIdSize = iconIdSize
	const _iconShareSize = iconShareSize
	const _titleSize = titleSize
	const bertyIdContentScaleFactor = contentScaleFactor
	const requestAvatarSize = avatarSize

	const { fontScale, scaleSize, windowHeight, windowWidth, isGteIpadSize } = useAppDimensions()
	const _bertyIdButtonSize = 60 * scaleSize

	// Make sure we can always see the whole QR code on the screen, even if need to scroll

	const qrCodeSize = isGteIpadSize
		? Math.min(windowHeight, windowWidth) * 0.3
		: Math.min(windowHeight * bertyIdContentScaleFactor, windowWidth * bertyIdContentScaleFactor) -
		  1.25 * _titleSize

	return {
		qrCodeSize,
		bertyIdContentScaleFactor,
		iconShareSize: _iconShareSize * scaleSize,
		iconIdSize: _iconIdSize * scaleSize,
		titleSize: _titleSize * fontScale,
		requestAvatarSize,
		styleBertyIdButton: {
			width: _bertyIdButtonSize,
			height: _bertyIdButtonSize,
			borderRadius: _bertyIdButtonSize / 2,
			marginRight: _bertyIdButtonSize,
			bottom: _bertyIdButtonSize / 2,
		},
		styleBertyIdContent: { paddingBottom: _bertyIdButtonSize / 2 + 10 },
	}
}

export const useMessengerClient = () => {
	return useSelector(selectClient)
}

export const useThemeColor = (): ThemeType => {
	const appState = useSelector(selectAppState)
	const themeIsDark = useSelector(selectThemeIsDark)
	const themeSelected = useSelector(selectThemeSelected)
	const themeCollection = useSelector(selectThemeCollection)

	return React.useMemo(() => {
		if (!Object.entries(themeCollection).length || appState === MESSENGER_APP_STATE.GET_STARTED) {
			return colors
		}

		if (themeIsDark) {
			return darkTheme
		}

		let collectionColors = {}
		for (const value of Object.entries(themeCollection)) {
			if (value[0] === themeSelected) {
				collectionColors = (value[1] as any)?.colors
				break
			}
		}
		return collectionColors as ThemeType
	}, [appState, themeCollection, themeIsDark, themeSelected])
}

export const useProfileNotification = () => {
	const persistentOptions = useSelector(selectPersistentOptions)
	const profileNotifs = persistentOptions[PersistentOptionsKeys.ProfileNotification]
	return profileNotifs[UpdatesProfileNotification]
}

//
// Fake data generation
//

// Generate n fake conversations with n fake contacts, one UserMessage per conv
export const useGenerateFakeContacts = () => {
	//const ctx = useMessengerContext()
	const contacts = useAllContacts()
	const prevFakeCount: number = contacts.reduce((r, c) => ((c as any)?.fake ? r + 1 : r), 0)
	return (length = 10) => {
		/*const payload =*/ fakeContacts(length, prevFakeCount)
		/*ctx.dispatch({
			type: MessengerActions.AddFakeData,
			payload,
		})*/
	}
}

export const useGenerateFakeMultiMembers = () => {
	//const ctx = useMessengerContext()
	const prevFakeCount = useAllConversations().reduce(
		(r, c) =>
			(c as any).fake && c?.type === beapi.messenger.Conversation.Type.MultiMemberType ? r + 1 : r,
		0,
	)
	return (length = 10) => {
		/*const payload =*/ fakeMultiMemberConversations(length, prevFakeCount)
		/*ctx.dispatch({
			type: MessengerActions.AddFakeData,
			payload,
		})*/
	}
}

// Generate n fake messages for all fake conversations
// export const useGenerateFakeMessages = () => {
// 	return
// 	const ctx = useMessengerContext()
// 	const fakeConversationList = useAllConversations().filter(c => (c as any).fake === true)
// 	const fakeMembersListList = fakeConversationList.map(conv =>
// 		Object.values(ctx.members[conv.publicKey || ''] || {}).filter((member: any) => member.fake),
// 	)
// 	const prevFakeCount: number = fakeConversationList.reduce(
// 		(r, fakeConv) =>
// 			Object.values( || {}).reduce(
// 				(r2, inte) => ((inte as any).fake ? r2 + 1 : r2),
// 				r,
// 			),
// 		0,
// 	)
// 	return (length = 10) => {
// 		ctx.dispatch({
// 			type: MessengerActions.AddFakeData,
// 			payload: {
// 				interactions: fakeMessages(
// 					length,
// 					fakeConversationList,
// 					fakeMembersListList,
// 					prevFakeCount,
// 				),
// 			},
// 		})
// 	}
// }

// Delete all fake data
export const useDeleteFakeData = () => {
	/*const ctx = useMessengerContext()*/
	return () => {
		/*ctx.dispatch({
			type: MessengerActions.DeleteFakeData,
		})*/
	}
}

export const useNotificationsInhibitor = (inhibitor: Maybe<NotificationsInhibitor>) => {
	const dispatch = useAppDispatch()
	const navigation = useNavigation()
	useMountEffect(() => {
		if (!inhibitor) {
			return
		}

		const inhibit = () => dispatch(addNotificationInhibitor({ inhibitor }))
		const revert = () => dispatch(removeNotificationInhibitor({ inhibitor }))

		const unsubscribeBlur = navigation.addListener('blur', revert)
		const unsubscribeFocus = navigation.addListener('focus', inhibit)

		inhibit()

		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			revert()
		}
	})
}

export const useReadEffect = (publicKey: Maybe<string>, timeout: Maybe<number>) => {
	// timeout is the duration (in ms) that the user must stay on the page to set messages as read
	const navigation = useNavigation()

	const client = useMessengerClient()

	const conv = useConversation(publicKey)
	const fake = (conv && (conv as any).fake) || false

	useEffect(() => {
		if (fake) {
			return
		}
		let timeoutID: ReturnType<typeof setTimeout> | null = null
		const handleStart = () => {
			if (timeoutID === null) {
				let t = timeout
				if (typeof t !== 'number') {
					t = 1000
				}
				timeoutID = setTimeout(() => {
					timeoutID = null
					client?.conversationOpen({ groupPk: publicKey }).catch((err: unknown) => {
						console.warn('failed to open conversation,', err)
					})
				}, t)
			}
		}
		handleStart()
		const unsubscribeFocus = navigation.addListener('focus', handleStart)
		const handleStop = () => {
			if (timeoutID !== null) {
				clearTimeout(timeoutID)
				timeoutID = null
			}

			// Not marking a conversation as closed if still in the navigation stack
			const { routes } = navigation.getState()
			for (let route of routes) {
				if (
					(route.name === 'Chat.OneToOne' || route.name === 'Chat.MultiMember') &&
					(route.params as any)?.convId === publicKey
				) {
					return
				}
			}

			client?.conversationClose({ groupPk: publicKey }).catch((err: unknown) => {
				console.warn('failed to close conversation,', err)
			})
		}
		const unsubscribeBlur = navigation.addListener('blur', handleStop)
		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			handleStop()
		}
	}, [client, fake, navigation, publicKey, timeout])
}

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (effect: EffectCallback) => useEffect(effect, [])

export const fetchMore = async ({
	setFetchingFrom,
	setFetchedFirst,
	fetchingFrom,
	fetchedFirst,
	oldestMessage,
	client,
	convPk,
}: {
	setFetchingFrom: (value: string | null) => void
	setFetchedFirst: (value: boolean) => void
	fetchingFrom: string | null
	fetchedFirst: boolean
	oldestMessage?: ParsedInteraction
	client: any
	convPk: string
}) => {
	if (fetchingFrom !== null || fetchedFirst) {
		return
	}

	let refCid: string | undefined
	if (oldestMessage) {
		refCid = oldestMessage.cid!
	}

	setFetchingFrom(refCid || '')

	return client
		?.conversationLoad({
			options: {
				amount: 50,
				conversationPk: convPk,
				refCid: refCid,
			},
		})
		.catch(() => setFetchedFirst(true))
}
