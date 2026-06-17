import { FlashList } from '@shopify/flash-list'
import Long from 'long'
import moment from 'moment'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	ActivityIndicatorProps,
	View,
	ViewToken,
	StyleSheet,
	Animated,
	NativeSyntheticEvent,
	NativeScrollEvent,
} from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { GRPCError } from '@berty/grpc-bridge'
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

	try {
		await client?.conversationLoad({
			options: {
				amount: 50,
				conversationPk: convPk,
				refCid: refCid,
			},
		})
	} catch (err) {
		// ErrNotFound means we reached the start of the conversation; any other error
		// is a real failure, so keep paging enabled and surface it for retry.
		if ((err as GRPCError).Code === beapi.errcode.ErrCode.ErrNotFound) {
			setFetchedFirst(true)
		} else {
			console.warn('failed to load older interactions:', err)
		}
	} finally {
		// Always clear the in-flight marker so the spinner stops once the load settles.
		setFetchingFrom(null)
	}
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
		const messages = useConversationInteractions(id)
		const oldestMessage = useMemo(() => messages[messages.length - 1], [messages])

		const [fetchingFrom, setFetchingFrom] = useState<string | null>(null)
		const [fetchedFirst, setFetchedFirst] = useState(messages.length === 0)
		const BeginningOfTimeComponent =
			conversation?.type === beapi.messenger.Conversation.Type.ContactType
				? InfosChat
				: conversation?.type === beapi.messenger.Conversation.Type.MultiMemberType
				? InfosMultiMember
				: NoopComponent

		const flashListRef = React.useRef<FlashList<ParsedInteraction> | null>(null)

		const handleScrollToCid = useCallback(
			cid => {
				flashListRef.current?.scrollToIndex({
					index: messages.findIndex(message => message.cid === cid),
				})
			},
			[messages],
		)

		const renderItem = useCallback(
			({ item, index }) => (
				// Flipped back upright; see styles.invertedList.
				<View style={styles.invertedCell}>
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
				</View>
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

		return (
			<View style={styles.container}>
				{isLoadingMore && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator color={colors['background-header']} />
					</View>
				)}
				{isGroup ? (
					<View style={[styles.memberBar]}>
						<MemberBar convId={id} />
					</View>
				) : null}
				{/* Flipped to emulate inversion; cells flip back (styles.invertedList). */}
				<View style={[flex.tiny, styles.invertedList]}>
				<FlashList
					overScrollMode='never'
					style={style}
					contentContainerStyle={contentContainerStyle}
					ref={flashListRef}
					keyboardDismissMode='on-drag'
					data={messages}
					// Follow new messages (data index 0) without needing a touch.
					maintainVisibleContentPosition={{ autoscrollToTopThreshold: 100 }}
					onEndReached={!isLoadingMore ? fetchMoreCB : null}
					onEndReachedThreshold={3}
					keyExtractor={keyExtractor}
					refreshing={fetchingFrom !== null}
					ListFooterComponent={listFooterComponent}
					ListFooterComponentStyle={styles.invertedCell}
					renderItem={renderItem}
					onViewableItemsChanged={__DEV__ ? undefined : updateStickyDateCB}
					onScrollEndDrag={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
				/>
				</View>
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
	// Emulates FlashList v2's removed `inverted` prop: flip the list, flip cells back.
	invertedList: {
		transform: [{ scaleY: -1 }],
	},
	invertedCell: {
		transform: [{ scaleY: -1 }],
	},
})
