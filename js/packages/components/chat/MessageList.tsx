import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, ListRenderItem, View } from 'react-native'
import moment from 'moment'

import { useStyles } from '@berty-tech/styles'
import {
	fetchMore,
	useConversation,
	useConvInteractions,
	useMsgrContext,
} from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'
import { ParsedInteraction } from '@berty-tech/store/types.gen'
import { Message } from '@berty-tech/components/chat/message'
import { ChatDate, updateStickyDate } from '@berty-tech/components/chat/common'
import { InfosChat } from '@berty-tech/components/InfosChat'
import { InfosMultiMember } from '@berty-tech/components/chat/InfosMultiMember'
import { pbDateToNum } from '@berty-tech/components/helpers'

const CenteredActivityIndicator: React.FC = (props: ActivityIndicator['props']) => {
	const { ...propsToPass } = props
	return (
		<View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator {...propsToPass} />
		</View>
	)
}

const DateSeparator = ({
	current,
	next,
}: {
	current: ParsedInteraction
	next?: ParsedInteraction
}) => {
	const [{ margin }] = useStyles()

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
}

export const MessageList: React.FC<{
	id: string
	scrollToMessage?: string
	setStickyDate: any
	setShowStickyDate: any
}> = ({ id, scrollToMessage: _scrollToMessage, setStickyDate, setShowStickyDate }) => {
	const [{ overflow, row, flex }, { scaleHeight }] = useStyles()
	const conversation = useConversation(id)
	const ctx = useMsgrContext()
	const members = ctx.members[id]
	const rawMessages = useConvInteractions(id)
	const messages = useMemo(
		() => rawMessages.filter(message => !message.payload?.options?.length),
		[rawMessages],
	)
	const oldestMessage = useMemo(() => messages[messages.length - 1], [messages])

	const [fetchingFrom, setFetchingFrom] = useState<string | null>(null)
	const [fetchedFirst, setFetchedFirst] = useState(false)
	const BeginningOfTimeComponent =
		conversation?.type === beapi.messenger.Conversation.Type.ContactType
			? InfosChat
			: conversation?.type === beapi.messenger.Conversation.Type.MultiMemberType
			? InfosMultiMember
			: ({}) => null

	const initialScrollIndex = undefined
	const flatListRef: any = React.useRef(null)

	const onScrollToIndexFailed = () => {
		flatListRef?.current?.scrollToIndex({ index: 0 })
	}

	const renderItem: ListRenderItem<ParsedInteraction> = useCallback(
		({ item, index }) => {
			return (
				<>
					{index > 0 && <DateSeparator current={item} next={messages[index - 1]} />}
					<Message
						inte={item}
						convKind={conversation?.type || beapi.messenger.Conversation.Type.Undefined}
						convPK={id || ''}
						members={members || {}}
						previousMessage={index < messages.length - 1 ? messages[index + 1] : undefined}
						nextMessage={index > 0 ? messages[index - 1] : undefined}
						replyOf={messages.find(message => message.cid === item.targetCid)}
						scrollToCid={cid => {
							flatListRef?.current?.scrollToIndex({
								index: messages.findIndex(message => message.cid === cid),
							})
						}}
					/>
				</>
			)
		},
		[id, conversation?.type, members, messages],
	)

	const fetchMoreCB = useCallback<() => void>(
		() =>
			fetchMore({
				setFetchingFrom,
				setFetchedFirst,
				fetchingFrom,
				fetchedFirst,
				oldestMessage,
				client: ctx.client,
				convPk: id,
			}),
		[fetchingFrom, fetchedFirst, oldestMessage, ctx.client, id],
	)
	const updateStickyDateCB = useCallback(() => updateStickyDate(setStickyDate), [setStickyDate])

	useEffect(
		() =>
			fetchMore({
				setFetchingFrom,
				setFetchedFirst,
				fetchingFrom: null,
				fetchedFirst: false,
				client: ctx.client,
				convPk: id,
			}),
		[ctx.client, id],
	)

	useEffect(() => {
		return () => {
			if (fetchingFrom !== oldestMessage?.cid) {
				setFetchingFrom(null)
			}
		}
	}, [fetchingFrom, oldestMessage?.cid])

	return (
		<FlatList
			overScrollMode='never'
			initialScrollIndex={initialScrollIndex}
			onScrollToIndexFailed={onScrollToIndexFailed}
			style={[overflow, row.item.fill, flex.tiny, { marginTop: 105 * scaleHeight }]}
			contentContainerStyle={{ paddingBottom: 35 * scaleHeight }}
			ref={flatListRef}
			keyboardDismissMode='on-drag'
			data={messages}
			inverted
			onEndReached={fetchMoreCB}
			onEndReachedThreshold={0.8}
			keyExtractor={(item: any, index: number) => item?.cid || `${index}`}
			refreshing={fetchingFrom !== null}
			ListFooterComponent={
				!conversation || fetchingFrom !== null ? (
					<CenteredActivityIndicator />
				) : fetchedFirst ? (
					<BeginningOfTimeComponent {...conversation} />
				) : null
			}
			renderItem={renderItem}
			onViewableItemsChanged={__DEV__ ? undefined : updateStickyDateCB}
			initialNumToRender={20}
			onScrollBeginDrag={() => {
				setShowStickyDate(false) // TODO: tmp until hide if start of conversation is visible
			}}
			onScrollEndDrag={() => {
				setTimeout(() => setShowStickyDate(false), 2000)
			}}
		/>
	)
}
