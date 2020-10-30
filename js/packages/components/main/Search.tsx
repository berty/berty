import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { CommonActions } from '@react-navigation/native'

import { Routes, useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import { useConversation, useContact, useSortedConvInteractions } from '@berty-tech/store/hooks'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import * as api from '@berty-tech/api/index.pb'

import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { pbDateToNum, timeFormat } from '../helpers'

// Styles

const _resultAvatarSize = 45

const useStylesSearch = () => {
	const [{ text, background }] = useStyles()

	return {
		searchResultHighlightText: [
			text.size.small,
			text.color.yellow,
			background.light.yellow,
			text.bold.medium,
		],
		nameHighlightText: [text.color.yellow, background.light.yellow, text.bold.medium],
		plainMessageText: [text.size.small, text.color.grey],
	}
}

// SEARCH RESULTS

enum SearchResultKind {
	Contact = 'Contact',
	Conversation = 'Conversation',
	Interaction = 'Interaction',
}

type SearchItemProps = { searchText?: string; data: any; kind: SearchResultKind }

const MessageSearchResult: React.FC<{
	message: string
	searchText: string
	style?: any
	highlightStyle?: any
}> = ({ message, searchText, style, highlightStyle }) => {
	if (typeof message !== 'string' || typeof searchText !== 'string') {
		return null
	}

	const parts = []
	let partsCounter = 0
	let lastStart = 0

	const firstResultIndex = message.indexOf(searchText)
	if (firstResultIndex > 20) {
		message = '...' + message.substr(firstResultIndex - 15)
	}

	for (let i = 0; i < message.length; ) {
		const searchTarget = message.substr(i, searchText.length)
		if (searchTarget.toLowerCase() === searchText.toLowerCase()) {
			if (lastStart < i) {
				const plainPart = message.substr(lastStart, i - lastStart)
				parts[partsCounter] = (
					<Text key={partsCounter} style={style}>
						{plainPart}
					</Text>
				)
				partsCounter++
			}
			parts[partsCounter] = (
				<Text key={partsCounter} style={highlightStyle}>
					{searchTarget}
				</Text>
			)
			partsCounter++
			i += searchText.length
			lastStart = i
		} else {
			i++
		}
	}
	if (lastStart !== message.length) {
		const plainPart = message.substr(lastStart)
		parts[partsCounter] = (
			<Text key={partsCounter} style={style}>
				{plainPart}
			</Text>
		)
		lastStart = message.length
		partsCounter++
	}

	return <>{parts}</>
}

const SearchResultItem: React.FC<SearchItemProps> = ({ data, kind, searchText = '' }) => {
	const [{ color, row, padding, flex, column, text, margin, border }] = useStyles()
	const { plainMessageText, searchResultHighlightText, nameHighlightText } = useStylesSearch()
	const { navigate, dispatch } = useNavigation()

	let convPk: string
	switch (kind) {
		case SearchResultKind.Contact:
			convPk = data.conversationPublicKey || ''
			break
		case SearchResultKind.Conversation:
			convPk = data.publicKey || ''
			break
		case SearchResultKind.Interaction:
			convPk = data.conversationPublicKey || ''
			break
	}
	const conv = useConversation(convPk)

	let contactPk: string
	switch (kind) {
		case SearchResultKind.Contact:
			contactPk = data.publicKey
			break
		case SearchResultKind.Conversation:
			contactPk = ''
			break
		case SearchResultKind.Interaction:
			contactPk = conv?.contactPublicKey
			break
	}
	const contact = useContact(contactPk)

	const interactions = useSortedConvInteractions(conv?.publicKey).filter(
		(inte) => inte.type === messengerpb.AppMessage.Type.TypeUserMessage,
	)
	const lastInteraction =
		interactions && interactions.length > 0 ? interactions[interactions.length - 1] : null

	let name: string
	let inte: api.berty.messenger.v1.IInteraction | null
	let avatarSeed: string
	switch (kind) {
		case SearchResultKind.Contact:
			avatarSeed = data.publicKey
			name = data.displayName || ''
			inte = lastInteraction || null
			break
		case SearchResultKind.Conversation:
			avatarSeed = convPk
			name = data.displayName || ''
			inte = lastInteraction || null
			break
		case SearchResultKind.Interaction:
			if (conv?.type === messengerpb.Conversation.Type.ContactType) {
				name = contact?.displayName || ''
				avatarSeed = contact?.publicKey
			} else {
				name = conv?.displayName || ''
				avatarSeed = convPk
			}
			inte = data || null
			break
		default:
			return null
	}

	const date = pbDateToNum(inte?.sentDate)

	const MessageDisplay = () => {
		let content
		switch (kind) {
			case SearchResultKind.Contact:
				switch (data.state) {
					case messengerpb.Contact.State.IncomingRequest:
						content = '📬 Incoming request'
						break
					case messengerpb.Contact.State.OutgoingRequestEnqueued:
						content = '📪 Outgoing request enqueued'
						break
					case messengerpb.Contact.State.OutgoingRequestSent:
						content = '📫 Outgoing request sent'
						break
					default:
						content = (inte?.payload as any)?.body
				}
				break
			case SearchResultKind.Conversation:
				content = (inte?.payload as any)?.body
				break
			case SearchResultKind.Interaction:
				content = (
					<MessageSearchResult
						searchText={searchText}
						message={(inte?.payload as any)?.body}
						style={plainMessageText}
						highlightStyle={searchResultHighlightText}
					/>
				)
				break
			default:
				return null
		}
		return (
			<Text numberOfLines={1} style={plainMessageText}>
				{content}
			</Text>
		)
	}

	const TimeStamp = () => {
		return (
			<Text style={[padding.left.small, text.size.small, text.color.grey]}>
				{timeFormat.fmtTimestamp1(date)}
			</Text>
		)
	}

	return (
		<TouchableHighlight
			underlayColor={!conv ? 'transparent' : color.light.grey}
			onPress={() =>
				!conv
					? data.state === messengerpb.Contact.State.IncomingRequest
						? navigate.main.contactRequest({ contactId: data.publicKey })
						: dispatch(
								CommonActions.navigate({
									name: Routes.Main.RequestSent,
									params: {
										contactPublicKey: data.publicKey,
									},
								}),
						  )
					: dispatch(
							CommonActions.navigate({
								name:
									conv.type === messengerpb.Conversation.Type.ContactType
										? Routes.Chat.OneToOne
										: Routes.Chat.Group,
								params: {
									convId: convPk,
									scrollToMessage: kind === SearchResultKind.Interaction && inte ? inte.cid : null,
								},
							}),
					  )
			}
		>
			<View style={[row.center, padding.medium, border.bottom.tiny, border.color.light.grey]}>
				<ProceduralCircleAvatar
					seed={avatarSeed}
					size={_resultAvatarSize}
					diffSize={9}
					style={[padding.tiny, row.item.justify]}
				/>
				<View style={[flex.medium, column.justify, padding.left.medium]}>
					<View style={[margin.right.big]}>
						<Text numberOfLines={1} style={[column.item.fill, text.bold.medium]}>
							{kind === SearchResultKind.Interaction ? (
								name
							) : (
								<MessageSearchResult
									message={name}
									searchText={searchText}
									style={[text.bold.medium]}
									highlightStyle={nameHighlightText}
								/>
							)}
						</Text>
						<MessageDisplay />
					</View>
				</View>

				<View style={[{ marginLeft: 'auto' }, row.item.center]}>
					{date > 0 && kind === SearchResultKind.Interaction ? <TimeStamp /> : null}
				</View>
			</View>
		</TouchableHighlight>
	)
}

export const createSections = (
	conversations: any,
	contacts: any,
	interactions: any,
	searchText: string,
) => {
	const sections = [
		{
			title: contacts.length ? 'Contacts' : '',
			data: contacts,
			renderItem: ({ item }: { item: any }) => (
				<SearchResultItem data={item} kind={SearchResultKind.Contact} searchText={searchText} />
			),
		},
		{
			title: conversations.length ? 'Groups' : '',
			data: conversations,
			renderItem: ({ item }: { item: any }) => (
				<SearchResultItem
					data={item}
					kind={SearchResultKind.Conversation}
					searchText={searchText}
				/>
			),
		},
		{
			title: interactions.length ? 'Messages' : '',
			data: interactions,
			renderItem: ({ item }: { item: any }) => (
				<SearchResultItem data={item} kind={SearchResultKind.Interaction} searchText={searchText} />
			),
		},
	]
	return sections
}
