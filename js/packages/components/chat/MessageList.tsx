import Long from 'long'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	ActivityIndicatorProps,
	FlatList,
	ListRenderItem,
	View,
	Platform,
	ViewToken,
	StyleSheet,
	Animated,
} from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import {
	useConversationInteractions,
	useConversationMembersDict,
	useConversation,
	useThemeColor,
	useMessengerClient,
} from '@berty/hooks'
import { ParsedInteraction } from '@berty/utils/api'
import { pbDateToNum } from '@berty/utils/convert/time'

import { InfosChat } from '../InfosChat'
import { ChatDate } from './ChatDate'
import { InfosMultiMember } from './InfosMultiMember'
import { MemberBar } from './member-bar/MemberBar'
import { Message } from './message'

const CenteredActivityIndicator: React.FC<ActivityIndicatorProps> = React.memo(props => {
	const { ...propsToPass } = props
	return (
		<View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator {...propsToPass} />
		</View>
	)
})

const DateSeparator: React.FC<{
	current: ParsedInteraction
	next?: ParsedInteraction
}> = React.memo(({ current, next }) => {
	const { margin } = useStyles()

	if (!next) {
		return null
	}

	if (
		moment(pbDateToNum(current.sentDate)).format('DDMMYYYY') ===
		moment(pbDateToNum(next.sentDate)).format('DDMMYYYY')
	) {
		return null
	}

	return (
		<View style={[margin.bottom.tiny]}>
			<ChatDate date={pbDateToNum(next.sentDate)} />
		</View>
	)
})

const NoopComponent: React.FC = () => null

const keyExtractor = (item: ParsedInteraction, index: number) => item.cid || `${index}`

const updateStickyDate: (
	setStickyDate: (date: Long.Long) => void,
) => (info: { viewableItems: ViewToken[] }) => void =
	(setStickyDate: (date: Long.Long) => void) =>
	({ viewableItems }) => {
		if (viewableItems && viewableItems.length) {
			const minDate = viewableItems[viewableItems.length - 1]?.section?.title
			if (minDate) {
				setStickyDate(Long.fromInt(moment(minDate, 'DD/MM/YYYY').unix() * 1000))
			}
		}
	}

const fetchMore = async ({
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
	client: WelshMessengerServiceClient | null
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

export const MessageList: React.FC<{
	id: string
	scrollToMessage?: string
	setStickyDate: (date: Long.Long) => void
	setShowStickyDate: (value: boolean) => void
	isGroup?: boolean
}> = React.memo(
	({ id, scrollToMessage: _scrollToMessage, setStickyDate, setShowStickyDate, isGroup }) => {
		const { overflow, row, flex } = useStyles()
		const colors = useThemeColor()
		const conversation = useConversation(id)
		const messengerClient = useMessengerClient()
		const members = useConversationMembersDict(id)
		const rawMessages = useConversationInteractions(id)
		const messages = useMemo(
			() =>
				rawMessages.filter(
					message => message.type !== beapi.messenger.AppMessage.Type.TypeReplyOptions,
				),
			[rawMessages],
		)
		const oldestMessage = useMemo(() => messages[messages.length - 1], [messages])

		const [fetchingFrom, setFetchingFrom] = useState<string | null>(null)
		const [fetchedFirst, setFetchedFirst] = useState(rawMessages.length === 0)
		const BeginningOfTimeComponent =
			conversation?.type === beapi.messenger.Conversation.Type.ContactType
				? InfosChat
				: conversation?.type === beapi.messenger.Conversation.Type.MultiMemberType
				? InfosMultiMember
				: NoopComponent

		const initialScrollIndex = undefined
		const flatListRef = React.useRef<FlatList>(null)

		const handleScrollToIndexFailed = useCallback(() => {
			flatListRef.current?.scrollToIndex({ index: 0 })
		}, [])

		const handleScrollToCid = useCallback(
			cid => {
				flatListRef.current?.scrollToIndex({
					index: messages.findIndex(message => message.cid === cid),
				})
			},
			[messages],
		)

		const renderItem: ListRenderItem<ParsedInteraction> = useCallback(
			({ item, index }) => (
				<>
					{index > 0 && <DateSeparator current={item} next={messages[index - 1]} />}
					<Message
						inte={item}
						convKind={conversation?.type || beapi.messenger.Conversation.Type.Undefined}
						convPK={id || ''}
						members={members}
						previousMessage={index < messages.length - 1 ? messages[index + 1] : undefined}
						nextMessage={index > 0 ? messages[index - 1] : undefined}
						scrollToCid={handleScrollToCid}
					/>
				</>
			),
			[id, conversation?.type, members, messages, handleScrollToCid],
		)

		const [isLoadingMore, setIsLoadingMore] = useState(false)
		const fetchMoreCB = useCallback<() => void>(() => {
			setIsLoadingMore(true)
			fetchMore({
				setFetchingFrom,
				setFetchedFirst,
				fetchingFrom,
				fetchedFirst,
				oldestMessage,
				client: messengerClient,
				convPk: id,
			}).then(() => setIsLoadingMore(false))
		}, [fetchingFrom, fetchedFirst, oldestMessage, messengerClient, id])
		const updateStickyDateCB = useCallback(() => updateStickyDate(setStickyDate), [setStickyDate])

		const fadeAnim = useRef(new Animated.Value(0)).current

		const handleScrollBeginDrag = useCallback(() => {
			if (isGroup) {
				Animated.timing(fadeAnim, {
					toValue: -1,
					duration: 500,
					useNativeDriver: true,
				}).start()
			}

			setShowStickyDate(false) // TODO: tmp until hide if start of conversation is visible
		}, [isGroup, fadeAnim, setShowStickyDate])
		const handleScrollEndDrag = useCallback(() => {
			if (isGroup) {
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 250,
					useNativeDriver: true,
				}).start()
			}

			setTimeout(() => setShowStickyDate(false), 2000)
		}, [isGroup, fadeAnim, setShowStickyDate])

		const listFooterComponent = React.useMemo(
			() =>
				!conversation || fetchingFrom !== null ? (
					<CenteredActivityIndicator />
				) : fetchedFirst ? (
					<BeginningOfTimeComponent {...conversation} />
				) : null,
			[BeginningOfTimeComponent, conversation, fetchingFrom, fetchedFirst],
		)

		const style = React.useMemo(
			() => [overflow, row.item.fill, flex.tiny],
			[flex.tiny, overflow, row.item.fill],
		)
		const contentContainerStyle = React.useMemo(
			() => ({ paddingBottom: 35, backgroundColor: colors['main-background'] }),
			[colors],
		)

		useEffect(() => {
			return () => {
				if (fetchingFrom !== oldestMessage?.cid) {
					setFetchingFrom(null)
				}
			}
		}, [fetchingFrom, oldestMessage?.cid])

		const xVal = fadeAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 250],
		})

		return (
			<View style={styles.container}>
				{!fetchedFirst && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator color={colors['background-header']} />
					</View>
				)}
				{!!isGroup && (
					<Animated.View style={[{ transform: [{ translateY: xVal }] }, styles.memberBar]}>
						<MemberBar convId={id} />
					</Animated.View>
				)}
				<FlatList
					overScrollMode='never'
					initialScrollIndex={initialScrollIndex}
					onScrollToIndexFailed={handleScrollToIndexFailed}
					style={style}
					contentContainerStyle={contentContainerStyle}
					ref={flatListRef}
					keyboardDismissMode='on-drag'
					data={messages}
					inverted
					onEndReached={!isLoadingMore ? fetchMoreCB : null}
					onEndReachedThreshold={3}
					keyExtractor={keyExtractor}
					refreshing={fetchingFrom !== null}
					ListFooterComponent={listFooterComponent}
					renderItem={renderItem}
					onViewableItemsChanged={__DEV__ ? undefined : updateStickyDateCB}
					initialNumToRender={20}
					onScrollEndDrag={event => {
						if (isGroup) {
							if (event.nativeEvent.velocity?.y === 0) {
								handleScrollEndDrag()
							}
						} else {
							handleScrollEndDrag()
						}
					}}
					onScrollBeginDrag={handleScrollBeginDrag}
					onMomentumScrollEnd={isGroup ? handleScrollEndDrag : undefined}
					disableVirtualization={Platform.OS === 'web'}
				/>
			</View>
		)
	},
)

const styles = StyleSheet.create({
	header: {
		position: 'absolute',
		backgroundColor: '#1c1c1c',
		left: 0,
		right: 0,
		width: '100%',
		zIndex: 1,
	},
	memberBar: {
		left: 20,
		right: 20,
		zIndex: 10,
		position: 'absolute',
	},
	loadingContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	container: {
		flex: 1,
	},
})
