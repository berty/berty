import * as Network from 'expo-network'
import pickBy from 'lodash/pickBy'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'

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
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	PersistentOptionsKeys,
	selectNoNetworkPopupSuggested,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'
import * as testIDs from '@berty/utils/testing/testIDs.json'

import { AddBot } from './components/AddBot'
import { Conversations } from './components/Conversations'
import { HomeHeader } from './components/Header'
import { NoNetwork } from './components/NoNetwork'
import { IncomingRequests } from './components/Requests'
import { SearchComponent } from './components/Search'

const T = beapi.messenger.StreamEvent.Notified.Type

export const Home: ScreenFC<'Chat.Home'> = () => {
	const { navigate } = useNavigation()
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

	const [searchResults, setSearchResults] = useState<{
		query: string
		items: beapi.messenger.IInteraction[]
	}>({ query: '', items: [] })
	const searchInteractions = searchResults.query === searchText ? searchResults.items : []
	const [earliestResult, setEarliestResult] = useState('')

	const dispatch = useAppDispatch()
	const [noNetwork, setNoNetwork] = useState<boolean>(false)
	const noNetworkPopupSuggested = useAppSelector(selectNoNetworkPopupSuggested)
	// effect handle network change, no network popup
	useEffect(() => {
		let canceled = false
		if (noNetworkPopupSuggested) {
			return
		}
		Network.getNetworkStateAsync()
			.then(data => {
				if (!canceled && (!data.isConnected || !data.isInternetReachable)) {
					setNoNetwork(true)
				}
			})
			.catch(err => console.error(err))
		return () => {
			canceled = true
		}
	}, [noNetwork, noNetworkPopupSuggested])

	useEffect(() => {
		let canceled = false

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

					setSearchResults(prev => ({
						query: searchText,
						items: prev.query === searchText ? prev.items.concat(results!.results) : results!.results,
					}))
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
	}, [messengerClient, searchText])

	const hasResults = [searchConversations, searchContacts, searchInteractions].some(
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
		<SafeAreaView style={[styleBackground, { flex: 1 }]}>
			<StatusBar style={requests.length && !isOnTop ? 'light' : 'dark'} />
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
										testID={testIDs['open-berty-link']}
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
							interactions={searchInteractions}
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
		</SafeAreaView>
	)
}
