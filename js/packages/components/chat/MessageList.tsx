import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ActivityIndicatorProps,
	FlatList,
	ListRenderItem,
	View,
	Platform,
} from 'react-native'
import moment from 'moment'

import { useStyles } from '@berty/contexts/styles'
import {
	fetchMore,
	pbDateToNum,
	ParsedInteraction,
	useMessengerClient,
	useThemeColor,
} from '@berty/store'
import beapi from '@berty/api'
import {
	useConversationInteractions,
	useConversationMembersDict,
	useConversation,
} from '@berty/hooks'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

import { InfosChat } from '../InfosChat'
import { Message } from './message'
import { ChatDate, updateStickyDate } from './common'
import { InfosMultiMember } from './InfosMultiMember'

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

export const MessageList: React.FC<{
	id: string
	scrollToMessage?: string
	setStickyDate: any
	setShowStickyDate: any
}> = React.memo(({ id, scrollToMessage: _scrollToMessage, setStickyDate, setShowStickyDate }) => {
	const { overflow, row, flex } = useStyles()
	const { scaleHeight } = useAppDimensions()
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
	const oldestMessage = useMemo(
		() =>
			messages.filter(msg => msg.type !== beapi.messenger.AppMessage.Type.TypeMonitorMetadata)[
				messages.length - 1
			],
		[messages],
	)

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
					replyOf={messages.find(message => message.cid === item.targetCid)}
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

	const handleScrollBeginDrag = useCallback(() => {
		setShowStickyDate(false) // TODO: tmp until hide if start of conversation is visible
	}, [setShowStickyDate])
	const handleScrollEndDrag = useCallback(() => {
		setTimeout(() => setShowStickyDate(false), 2000)
	}, [setShowStickyDate])

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
		() => ({ paddingBottom: 35 * scaleHeight, backgroundColor: colors['main-background'] }),
		[scaleHeight, colors],
	)

	useEffect(() => {
		return () => {
			if (fetchingFrom !== oldestMessage?.cid) {
				setFetchingFrom(null)
			}
		}
	}, [fetchingFrom, oldestMessage?.cid])

	return (
		<View style={{ flex: 1 }}>
			{!fetchedFirst && (
				<View
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						flexDirection: 'row',
					}}
				>
					<ActivityIndicator color={colors['background-header']} />
				</View>
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
				onScrollBeginDrag={handleScrollBeginDrag}
				onScrollEndDrag={handleScrollEndDrag}
				disableVirtualization={Platform.OS === 'web'}
			/>
		</View>
	)
})
