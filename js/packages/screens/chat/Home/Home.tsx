import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View, StatusBar, TouchableOpacity, SafeAreaView } from 'react-native'
import pickBy from 'lodash/pickBy'
import { Icon } from '@ui-kitten/components'
import { useSelector } from 'react-redux'

import { ScreenFC } from '@berty/navigation'
import { useNotificationsInhibitor, useThemeColor } from '@berty/store'
import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import {
	useContactsDict,
	useConversationsDict,
	useIncomingContactRequests,
	useAllConversations,
} from '@berty/hooks'
import { useLayout } from '@berty/components/hooks'
import EmptyChat from '@berty/assets/logo/empty_chat.svg'
import { selectClient } from '@berty/redux/reducers/ui.reducer'
import { selectPersistentOptions } from '@berty/redux/reducers/persistentOptions.reducer'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { ButtonSettingV2 } from '@berty/components/shared-components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

import { IncomingRequests } from './components/Requests'
import { Conversations } from './components/Conversations'
import { SearchComponent } from './components/Search'
import { HomeHeader } from './components/Header'
import { MultiAccount } from './components/MultiAccount'
import { AddBot } from './components/AddBot'

const T = beapi.messenger.StreamEvent.Notified.Type

const FooterButton: React.FC<{
	name: string
	fill: string
	backgroundColor: string
	onPress: () => Promise<void> | void
}> = ({ name, fill, backgroundColor, onPress }) => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	return (
		<TouchableOpacity
			style={[
				{
					marginBottom: 20 * scaleSize,
					width: 60,
					height: 60,
					borderRadius: 60,
					shadowColor: colors.shadow,
					shadowOffset: {
						width: 0,
						height: 5,
					},
					shadowOpacity: 0.2,
					shadowRadius: 10,
					elevation: 5,
					backgroundColor,
					alignItems: 'center',
					justifyContent: 'center',
				},
			]}
			onPress={onPress}
		>
			<Icon name={name} fill={fill} width={30 * scaleSize} height={30 * scaleSize} />
		</TouchableOpacity>
	)
}

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
	const [isOnTop, setIsOnTop] = useState<boolean>(false)
	const [searchText, setSearchText] = useState<string>('')
	const [refresh, setRefresh] = useState<boolean>(false)
	const [isAddBot, setIsAddBot] = useState({
		link: '',
		displayName: '',
		isVisible: false,
	})

	const [isLongPress, setIsLongPress] = useState<boolean>(false)

	const client = useSelector(selectClient)

	const { text, opacity, flex, margin, border } = useStyles()
	const { scaleSize, scaleHeight } = useAppDimensions()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

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
		(i: any) => i.state === 'unread',
	)
	const configurations = Object.values(persistentOptions?.configurations).filter(
		(i: any) => i.state === 'unread',
	)
	const hasSuggestion: number = suggestions.length
	const hasConfigurations: number = configurations.length

	const conversationsDict = useConversationsDict()

	const searchConversations = React.useMemo(
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

	const searchContacts = React.useMemo(
		() => (searching ? pickBy(contacts, (val: any) => searchCheck(val.displayName)) : {}),
		[contacts, searchCheck, searching],
	)

	const searchInteractions = React.useRef<beapi.messenger.IInteraction[]>([])
	const [earliestResult, setEarliestResult] = React.useState('')

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
					const results = await client?.messageSearch({
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
	}, [client, searchInteractions, searchText])

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
					onLongPress={setIsLongPress}
					isMultiAccount={isLongPress}
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
						{!hasConversations && !hasSuggestion && !hasConfigurations ? (
							<View style={{ backgroundColor: colors['main-background'] }}>
								<View style={[flex.justify.center, flex.align.center, margin.top.scale(60)]}>
									<View>
										<EmptyChat width={350 * scaleSize} height={350 * scaleHeight} />
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
						) : null}
					</View>
				)}
			</ScrollView>
			<View
				style={{
					position: 'absolute',
					right: 20 * scaleSize,
					bottom: 20 * scaleSize,
				}}
			>
				<FooterButton
					name='plus'
					fill={colors['reverted-main-text']}
					backgroundColor={colors['background-header']}
					onPress={() => navigate('Chat.Share')}
				/>
			</View>
			{isLongPress ? (
				<MultiAccount
					onPress={() => {
						setIsLongPress(false)
					}}
				/>
			) : null}
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
