import React, { EffectCallback, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

import beapi from '@berty-tech/api'
import colors from '@berty-tech/styles/colors.json'
import darkTheme from '@berty-tech/styles/darktheme-default.json'
import {
	useAllConversations,
	useAppSelector,
	useConversationInteractions,
	useAllContacts,
} from '@berty-tech/react-redux'
import { selectChecklistSeen } from '@berty-tech/redux/reducers/checklist.reducer'
import { useStyles } from '@berty-tech/styles'
import {
	selectAllConversations,
	selectConversation,
	selectMember,
} from '@berty-tech/redux/reducers/messenger.reducer'

import { useMessengerContext } from './context'
import {
	MessengerActions,
	MessengerAppState,
	NotificationsInhibitor,
	PersistentOptionsKeys,
	UpdatesProfileNotification,
} from './types'
import { fakeContacts, fakeMultiMemberConversations } from './faker'
import { ParsedInteraction } from './types.gen'

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

	const [, { fontScale, scaleSize, windowHeight, windowWidth, isGteIpadSize }] = useStyles()
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
	const ctx = useMessengerContext()
	return ctx.client
}

export const useAccountContactSearchResults = (searchText: Maybe<string>) => {
	const contacts = useAllContacts()
	if (!searchText) {
		return []
	}
	return contacts.filter(contact =>
		contact.displayName?.toLowerCase().includes(searchText.toLowerCase()),
	)
}

export const useConversationList = () => {
	return useAppSelector(state => selectAllConversations(state))
}

export const useSortedConversationList = () => {
	return useConversationList()
}

export const useConversation = (
	publicKey: Maybe<string>,
): (beapi.messenger.IConversation & { fake?: Maybe<boolean> }) | undefined => {
	return useAppSelector(state => selectConversation(state, publicKey || ''))
}

const emptyObject = {}

export const useConversationsCount = () => {
	return useConversationList().length
}

export const useMember = <
	T extends { publicKey: Maybe<string>; conversationPublicKey: Maybe<string> },
>(
	props: T,
) => {
	return useAppSelector(state =>
		selectMember(state, props.conversationPublicKey || '', props.publicKey || ''),
	)
}

export const usePersistentOptions = () => {
	const ctx = useMessengerContext()
	return ctx.persistentOptions || {}
}

export const useThemeColor = () => {
	const ctx = useMessengerContext()
	return React.useMemo(() => {
		if (ctx.persistentOptions?.themeColor.isDark) {
			return darkTheme
		}

		if (
			!Object.entries(ctx.persistentOptions?.themeColor.collection).length ||
			ctx.appState === MessengerAppState.GetStarted
		) {
			return colors
		}

		let collectionColors = emptyObject
		for (const value of Object.entries(ctx.persistentOptions?.themeColor.collection)) {
			if (value[0] === ctx.persistentOptions?.themeColor.selected) {
				collectionColors = (value[1] as any)?.colors
				break
			}
		}
		return collectionColors
	}, [
		ctx.appState,
		ctx.persistentOptions?.themeColor.collection,
		ctx.persistentOptions?.themeColor.isDark,
		ctx.persistentOptions?.themeColor.selected,
	])
}

export const useProfileNotification = () => {
	const ctx = useMessengerContext()
	const profileNotifs = ctx.persistentOptions[PersistentOptionsKeys.ProfileNotification]
	const checklistSeen = useAppSelector(selectChecklistSeen)
	const checklistNotifs = checklistSeen ? 0 : 1
	return profileNotifs[UpdatesProfileNotification] + checklistNotifs
}

//
// Fake data generation
//

// Generate n fake conversations with n fake contacts, one UserMessage per conv
export const useGenerateFakeContacts = () => {
	const ctx = useMessengerContext()
	const contacts = useAllContacts()
	const prevFakeCount: number = contacts.reduce((r, c) => ((c as any)?.fake ? r + 1 : r), 0)
	return (length = 10) => {
		const payload = fakeContacts(length, prevFakeCount)
		ctx.dispatch({
			type: MessengerActions.AddFakeData,
			payload,
		})
	}
}

export const useGenerateFakeMultiMembers = () => {
	const ctx = useMessengerContext()
	const prevFakeCount = useAllConversations().reduce(
		(r, c) =>
			(c as any).fake && c?.type === beapi.messenger.Conversation.Type.MultiMemberType ? r + 1 : r,
		0,
	)
	return (length = 10) => {
		const payload = fakeMultiMemberConversations(length, prevFakeCount)
		ctx.dispatch({
			type: MessengerActions.AddFakeData,
			payload,
		})
	}
}

// Generate n fake messages for all fake conversations
export const useGenerateFakeMessages = () => {
	return
	/*const ctx = useMessengerContext()
	const fakeConversationList = useConversationList().filter(c => (c as any).fake === true)
	const fakeMembersListList = fakeConversationList.map(conv =>
		Object.values(ctx.members[conv.publicKey || ''] || {}).filter((member: any) => member.fake),
	)
	const prevFakeCount: number = fakeConversationList.reduce(
		(r, fakeConv) =>
			Object.values( || {}).reduce(
				(r2, inte) => ((inte as any).fake ? r2 + 1 : r2),
				r,
			),
		0,
	)
	return (length = 10) => {
		ctx.dispatch({
			type: MessengerActions.AddFakeData,
			payload: {
				interactions: fakeMessages(
					length,
					fakeConversationList,
					fakeMembersListList,
					prevFakeCount,
				),
			},
		})
	}*/
}

// Delete all fake data
export const useDeleteFakeData = () => {
	const ctx = useMessengerContext()
	return () =>
		ctx.dispatch({
			type: MessengerActions.DeleteFakeData,
		})
}

export type SortedConvsFilter = Parameters<
	ReturnType<typeof useConversationInteractions>['filter']
>[0]

export const useLastConvInteraction = (
	convPublicKey: Maybe<string>,
	filterFunc?: Maybe<SortedConvsFilter>,
) => {
	let intes = useConversationInteractions(convPublicKey || '')

	if (intes.length <= 0) {
		return null
	}

	if (!filterFunc) {
		return intes[0]
	}

	return intes.find(filterFunc) || null
}

const useDispatch = () => {
	const ctx = useMessengerContext()
	return ctx.dispatch
}

export const useNotificationsInhibitor = (inhibitor: Maybe<NotificationsInhibitor>) => {
	const dispatch = useDispatch()
	const navigation = useNavigation()
	useMountEffect(() => {
		if (!inhibitor) {
			return
		}

		const inhibit = () =>
			dispatch({ type: MessengerActions.AddNotificationInhibitor, payload: { inhibitor } })
		const revert = () =>
			dispatch({ type: MessengerActions.RemoveNotificationInhibitor, payload: { inhibitor } })

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

	const ctx = useMessengerContext()

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
					ctx.client?.conversationOpen({ groupPk: publicKey }).catch((err: unknown) => {
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

			ctx.client?.conversationClose({ groupPk: publicKey }).catch((err: unknown) => {
				console.warn('failed to close conversation,', err)
			})
		}
		const unsubscribeBlur = navigation.addListener('blur', handleStop)
		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			handleStop()
		}
	}, [ctx.client, fake, navigation, publicKey, timeout])
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
				amount: 30,
				conversationPk: convPk,
				refCid: refCid,
			},
		})
		.catch(() => setFetchedFirst(true))
}
