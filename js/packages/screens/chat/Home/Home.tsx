import * as Network from 'expo-network'
import pickBy from 'lodash/pickBy'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View, StatusBar, SafeAreaView } from 'react-native'
import { useSelector } from 'react-redux'

import beapi from '@berty/api'
import EmptyChat from '@berty/assets/logo/empty_chat.svg'
import { PrimaryFloatingButton } from '@berty/components'
import { useLayout } from '@berty/components/hooks'
import { ButtonSettingV2 } from '@berty/components/shared-components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import {
	useContactsDict,
	useConversationsDict,
	useIncomingContactRequests,
	useAllConversations,
	useThemeColor,
	useMessengerClient,
	useNotificationsInhibitor,
	useAppDispatch,
	useAppSelector,
} from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import {
	PersistentOptionsKeys,
	selectNoNetworkPopupSuggested,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'

import { AddBot } from './components/AddBot'
import { Conversations } from './components/Conversations'
import { HomeHeader } from './components/Header'
import { NoNetwork } from './components/NoNetwork'
import { IncomingRequests } from './components/Requests'
import { SearchComponent } from './components/Search'

const T = beapi.messenger.StreamEvent.Notified.Type

export const Home: ScreenFC<'Chat.Home'> = ({ navigation: { navigate } }) => {
	useNotificationsInhibitor(notif =>
		[
			T.TypeMessageReceived,
			T.TypeContactRequestReceived,
			T.TypeContactRequestSent,
			T.TypeGroupInvitation,
		].includes(notif.type || T.Unknown)
			? 'sound-only'
			: false,
	)
	// TODO: do something to animate the requests
	const requests = useIncomingContactRequests()
	const conversations = useAllConversations()
	const hasConversations = conversations.length > 0
	const [layoutRequests, onLayoutRequests] = useLayout()
	const [isOnTop, setIsOnTop] = useState(false)
	const [searchText, setSearchText] = useState('')
	const [refresh, setRefresh] = useState(false)
	const [isAddBot, setIsAddBot] = useState({
		link: '',
		displayName: '',
		isVisible: false,
	})

	const messengerClient = useMessengerClient()

	const { text, opacity, flex, margin, border } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()

	const scrollRef = useRef<ScrollView>(null)
	const searching = !!searchText
	const lowSearchText = searchText.toLowerCase()
	const searchCheck = React.useCallback(
		(searchIn?: string | null | false | 0) =>
			(searchIn || '').toLowerCase().includes(lowSearchText),
		[lowSearchText],
	)

	const persistentOptions = useSelector(selectPersistentOptions)
	const suggestions = Object.values(persistentOptions?.suggestions).filter(
		index => index.state === 'unread',
	)
	const configurations = Object.values(persistentOptions?.configurations).filter(
		index => index.state === 'unread',
	)
	const hasSuggestion: number = suggestions.length
	const hasConfigurations: number = configurations.length

	const conversationsDict = useConversationsDict()

	const searchConversations = useMemo(
		() =>
			searching
				? pickBy(
						conversationsDict,
						val =>
							val?.type === beapi.messenger.Conversation.Type.MultiMemberType &&
							searchCheck(val?.displayName),
				  )
				: {},
		[conversationsDict, searchCheck, searching],
	)

	const contacts = useContactsDict()

	const searchContacts = useMemo(
		() => (searching ? pickBy(contacts, val => searchCheck(val?.displayName)) : {}),
		[contacts, searchCheck, searching],
	)

	const searchInteractions = useRef<beapi.messenger.IInteraction[]>([])
	const [earliestResult, setEarliestResult] = useState('')

	const dispatch = useAppDispatch()
	const [noNetwork, setNoNetwork] = useState<boolean>(false)
	const noNetworkPopupSuggested = useAppSelector(selectNoNetworkPopupSuggested)
	const handleNetworkChange = React.useCallback(async () => {
		if (noNetworkPopupSuggested) {
			return
		}
		try {
			const data = await Network.getNetworkStateAsync()

			if (!data.isConnected || !data.isInternetReachable) {
				setNoNetwork(true)
			}
		} catch (err) {
			console.error(err)
		}
	}, [noNetworkPopupSuggested])

	// effect handle network change, no network popup
	useEffect(() => {
		handleNetworkChange()
	}, [handleNetworkChange, noNetwork, noNetworkPopupSuggested])

	useEffect(() => {
		let canceled = false
		searchInteractions.current = []

		if (searchText.trim() === '') {
			return
		}

		;(async () => {
			await new Promise(resolve => {
				setTimeout(() => resolve(true), 200)
			})
			if (canceled) {
				return
			}

			try {
				let earliestResult = ''
				setEarliestResult('')
				while (true) {
					const results = await messengerClient?.messageSearch({
						query: searchText,
						refCid: earliestResult,
						limit: 10,
					})

					if (!results || results.results.length === 0) {
						canceled = true
					}

					if (canceled) {
						return
					}

					searchInteractions.current = searchInteractions.current.concat(results!.results)
					setEarliestResult(results!.results[results!.results.length - 1].cid!)
					earliestResult = results!.results[results!.results.length - 1].cid!
					// TODO: remove this loop, add loading on scroll
				}
			} catch (e) {
				canceled = true
				console.warn(e)
			}
		})()

		return () => {
			canceled = true
		}
	}, [messengerClient, searchInteractions, searchText])

	const hasResults = [searchConversations, searchContacts, searchInteractions.current].some(
		c => Object.keys(c).length > 0,
	)
	const styleBackground = useMemo(
		() =>
			requests.length > 0 && !searchText?.length
				? { backgroundColor: colors['background-header'] }
				: { backgroundColor: colors['main-background'] },
		[requests.length, searchText, colors],
	)

	return (
		<View style={[styleBackground, { flex: 1 }]}>
			<SafeAreaView>
				<StatusBar
					backgroundColor={
						requests.length && !isOnTop ? colors['background-header'] : colors['main-background']
					}
					barStyle={requests.length && !isOnTop ? 'light-content' : 'dark-content'}
				/>
			</SafeAreaView>
			<ScrollView
				ref={scrollRef}
				stickyHeaderIndices={!searchText?.length && !hasResults ? [1] : [0]}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps={'handled'}
				onScrollEndDrag={e => {
					if (e.nativeEvent.contentOffset.y < 0) {
						setRefresh(true)
					}
				}}
				onScroll={e => {
					if (e.nativeEvent.contentOffset) {
						if (e.nativeEvent.contentOffset.y >= layoutRequests.height) {
							setIsOnTop(true)
						} else {
							setIsOnTop(false)
						}
					}
				}}
			>
				{!noNetworkPopupSuggested && noNetwork && (
					<NoNetwork
						onCancel={() => {
							setNoNetwork(false)
							dispatch(
								setPersistentOption({
									type: PersistentOptionsKeys.NoNetworkPopupSuggested,
									payload: true,
								}),
							)
						}}
					/>
				)}
				{!searchText?.length ? (
					<IncomingRequests items={requests} onLayout={onLayoutRequests} />
				) : null}
				<HomeHeader
					isOnTop={isOnTop}
					hasRequests={requests.length > 0}
					scrollRef={scrollRef}
					value={searchText}
					onChange={setSearchText}
					refresh={refresh}
					setRefresh={setRefresh}
				/>
				{searchText?.length ? (
					<>
						{(searchText.startsWith('https://berty.tech/id') ||
							searchText.startsWith('berty://')) && (
							<View style={[{ flexDirection: 'row', justifyContent: 'center' }]}>
								<View style={[border.shadow.large, border.radius.medium]}>
									<ButtonSettingV2
										text='Open Berty Link'
										icon='external-link-outline'
										accessibilityLabel='Open Berty Link'
										onPress={() =>
											navigate('Chat.ManageDeepLink', { type: 'link', value: searchText })
										}
									/>
								</View>
							</View>
						)}
						<SearchComponent
							insets={null}
							conversations={searchConversations}
							contacts={searchContacts}
							interactions={searchInteractions.current}
							value={searchText}
							hasResults={hasResults}
							earliestInteractionCID={earliestResult}
						/>
					</>
				) : (
					<View style={{ height: '100%' }}>
						<Conversations
							items={conversations}
							suggestions={suggestions}
							configurations={configurations}
							addBot={setIsAddBot}
						/>
						{!hasConversations && !hasSuggestion && !hasConfigurations && (
							<View style={{ backgroundColor: colors['main-background'] }}>
								<View style={[flex.justify.center, flex.align.center, margin.top.scale(60)]}>
									<View>
										<EmptyChat width={350} height={350} />
										<UnifiedText
											style={[
												text.align.center,
												text.color.grey,
												text.light,
												opacity(0.3),
												margin.top.big,
											]}
										>
											{t('main.home.no-contacts')}
										</UnifiedText>
									</View>
								</View>
							</View>
						)}
					</View>
				)}
			</ScrollView>
			<PrimaryFloatingButton onPress={() => navigate('Chat.Share')} />
			{isAddBot.isVisible ? (
				<AddBot
					link={isAddBot.link}
					displayName={isAddBot.displayName}
					closeModal={() => setIsAddBot({ ...isAddBot, isVisible: false })}
				/>
			) : null}
		</View>
	)
}
