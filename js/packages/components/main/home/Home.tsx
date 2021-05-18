import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import { BlurView } from '@react-native-community/blur'
import { Translation } from 'react-i18next'
import { ScrollView, Text as TextNative, View, StatusBar } from 'react-native'
import { EdgeInsets, SafeAreaConsumer } from 'react-native-safe-area-context'
import pickBy from 'lodash/pickBy'

import { ScreenProps } from '@berty-tech/navigation'
import {
	useConversationsCount,
	useIncomingContactRequests,
	useMsgrContext,
	useNotificationsInhibitor,
	useSortedConversationList,
} from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { AddBot } from '@berty-tech/components/modals'
import { WelcomeConfiguration } from '@berty-tech/components/modals'

import { useLayout } from '../../hooks'
import { SwipeNavRecognizer } from '../../shared-components/SwipeNavRecognizer'
import EmptyChat from '../empty_chat.svg'
import { HomeModal } from './HomeModal'
import { Footer } from './Footer'
import { IncomingRequests } from './Requests'
import { Conversations } from './Conversations'
import { SearchComponent } from './Search'
import { HomeHeader } from './Header'
import { MultiAccount } from './MultiAccount'
import { PersistentOptionsKeys } from '@berty-tech/store/context'

const T = beapi.messenger.StreamEvent.Notified.Type

export const Home: React.FC<ScreenProps.Main.Home> = () => {
	useNotificationsInhibitor((_ctx, notif) =>
		[T.TypeMessageReceived, T.TypeContactRequestReceived, T.TypeContactRequestSent].includes(
			notif.type as any,
		)
			? 'sound-only'
			: false,
	)
	// TODO: do something to animate the requests
	const requests: any[] = useIncomingContactRequests()
	const conversations: any[] = useSortedConversationList()
	const isConversation: number = useConversationsCount()
	const [layoutRequests, onLayoutRequests] = useLayout()
	const [, onLayoutHeader] = useLayout()
	const [, onLayoutConvs] = useLayout()
	const [isOnTop, setIsOnTop] = useState<boolean>(false)
	const [searchText, setSearchText] = useState<string>('')
	const [refresh, setRefresh] = useState<boolean>(false)
	const [isModalVisible, setModalVisibility] = useState<boolean>(false)
	const [isAddBot, setIsAddBot] = useState({
		link: '',
		displayName: '',
		isVisible: false,
	})

	const [isLongPress, setIsLongPress] = useState<boolean>(false)

	const { navigate } = useNativeNavigation()
	const { client } = useMsgrContext()

	const [
		{ text, opacity, flex, margin, background },
		{ windowHeight, scaleSize, scaleHeight },
	] = useStyles()
	const scrollRef = useRef<ScrollView>(null)

	const searching = !!searchText
	const lowSearchText = searchText.toLowerCase()
	const searchCheck = React.useCallback(
		(searchIn?: string | null | false | 0) =>
			(searchIn || '').toLowerCase().includes(lowSearchText),
		[lowSearchText],
	)

	const ctx = useMsgrContext()
	const suggestions = Object.values(ctx.persistentOptions?.suggestions).filter(
		(i: any) => i.state === 'unread',
	)
	const configurations = Object.values(ctx.persistentOptions?.configurations).filter(
		(i: any) => i.state === 'unread',
	)
	const hasSuggestion: number = suggestions.length
	const hasConfigurations: number = configurations.length

	const searchConversations = React.useMemo(
		() =>
			searching
				? pickBy(
						ctx.conversations,
						(val: any) =>
							val.type === beapi.messenger.Conversation.Type.MultiMemberType &&
							searchCheck(val.displayName),
				  )
				: {},
		[ctx.conversations, searchCheck, searching],
	)

	const searchContacts = React.useMemo(
		() => (searching ? pickBy(ctx.contacts, (val: any) => searchCheck(val.displayName)) : {}),
		[ctx.contacts, searchCheck, searching],
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
			await new Promise((resolve) => {
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

	const hasResults = [searchConversations, searchContacts, searchInteractions].some(
		(c) => Object.keys(c).length > 0,
	)
	const styleBackground = useMemo(
		() => (requests.length > 0 && !searchText?.length ? background.blue : background.white),
		[background.blue, background.white, requests.length, searchText],
	)

	return (
		<>
			<Translation>
				{(t: any): React.ReactNode => (
					<View style={[flex.tiny, styleBackground]}>
						<StatusBar backgroundColor='white' barStyle='dark-content' />
						<SwipeNavRecognizer onSwipeLeft={() => !isModalVisible && navigate('Settings.Home')}>
							<SafeAreaConsumer>
								{(insets: EdgeInsets | null) => (
									<>
										<ScrollView
											ref={scrollRef}
											stickyHeaderIndices={!searchText?.length && !hasResults ? [1] : [0]}
											showsVerticalScrollIndicator={false}
											scrollEventThrottle={16}
											keyboardShouldPersistTaps={'handled'}
											onScrollEndDrag={(e) => {
												if (e.nativeEvent.contentOffset.y < 0) {
													setRefresh(true)
												}
											}}
											onScroll={(e) => {
												if (e.nativeEvent.contentOffset) {
													if (e.nativeEvent.contentOffset.y >= layoutRequests.height) {
														setIsOnTop(true)
													} else {
														setIsOnTop(false)
													}
												}
											}}
										>
											{!searchText?.length && (
												<IncomingRequests items={requests} onLayout={onLayoutRequests} />
											)}
											<HomeHeader
												isOnTop={isOnTop}
												hasRequests={requests.length > 0}
												scrollRef={scrollRef}
												onLayout={onLayoutHeader}
												value={searchText}
												onChange={setSearchText}
												refresh={refresh}
												setRefresh={setRefresh}
												onLongPress={setIsLongPress}
												isMultiAccount={isLongPress}
											/>
											{searchText?.length ? (
												<SearchComponent
													insets={insets}
													conversations={searchConversations}
													contacts={searchContacts}
													interactions={searchInteractions.current}
													value={searchText}
													hasResults={hasResults}
													earliestInteractionCID={earliestResult}
												/>
											) : (
												<>
													<Conversations
														items={conversations}
														suggestions={suggestions}
														configurations={configurations}
														onLayout={onLayoutConvs}
														addBot={setIsAddBot}
													/>
													{!isConversation && !hasSuggestion && !hasConfigurations && (
														<View style={[background.white]}>
															<View
																style={[
																	flex.justify.center,
																	flex.align.center,
																	margin.top.scale(60),
																]}
															>
																<View>
																	<EmptyChat width={350 * scaleSize} height={350 * scaleHeight} />
																	<TextNative
																		style={[
																			text.align.center,
																			text.color.grey,
																			text.bold.small,
																			opacity(0.3),
																			margin.top.big,
																		]}
																	>
																		{t('main.home.no-contacts')}
																	</TextNative>
																</View>
															</View>
														</View>
													)}
													{requests.length > 0 && (
														<View
															style={[
																{
																	backgroundColor: 'white',
																	position: 'absolute',
																	bottom: windowHeight * -1,
																	height: windowHeight,
																	width: '100%',
																},
															]}
														/>
													)}
												</>
											)}
										</ScrollView>
										{isModalVisible && (
											<>
												<BlurView
													blurType='light'
													style={{
														position: 'absolute',
														left: 0,
														right: 0,
														top: 0,
														bottom: 0,
														height: windowHeight,
													}}
												/>
												<HomeModal closeModal={() => setModalVisibility(false)} />
											</>
										)}

										{!searchText?.length && (
											<Footer
												openModal={() => setModalVisibility(true)}
												isModalVisible={isModalVisible}
											/>
										)}
										{isAddBot.isVisible && (
											<AddBot
												link={isAddBot.link}
												displayName={isAddBot.displayName}
												closeModal={() => setIsAddBot({ ...isAddBot, isVisible: false })}
											/>
										)}

										{ctx.persistentOptions.welcomeModal.enable && (
											<WelcomeConfiguration
												closeModal={async () => {
													await ctx.setPersistentOption({
														type: PersistentOptionsKeys.WelcomeModal,
														payload: { enable: false },
													})
												}}
											/>
										)}
										{isLongPress && (
											<MultiAccount
												onPress={() => {
													setIsLongPress(false)
												}}
											/>
										)}
									</>
								)}
							</SafeAreaConsumer>
						</SwipeNavRecognizer>
					</View>
				)}
			</Translation>
		</>
	)
}

export default Home
