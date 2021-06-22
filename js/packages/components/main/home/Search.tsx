import React, { useEffect, useMemo } from 'react'
import { SectionList, Text as TextNative, TouchableHighlight, View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { CommonActions } from '@react-navigation/native'
import { EdgeInsets } from 'react-native-safe-area-context'
import { Translation } from 'react-i18next'

import beapi from '@berty-tech/api'
import { Routes, useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import { useConversation, useContact, useConvInteractions } from '@berty-tech/store/hooks'
import { HintBody } from '@berty-tech/components/shared-components'
import { parseInteraction } from '@berty-tech/store/utils'
import { ParsedInteraction } from '@berty-tech/store/types.gen'

import { pbDateToNum, timeFormat } from '../../helpers'
import { ContactAvatar, ConversationAvatar } from '../../avatars'

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
			contactPk = conv?.contactPublicKey || ''
			break
	}
	const contact = useContact(contactPk)

	const interactions = useConvInteractions(conv?.publicKey).filter(
		(inte) => inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage,
	)
	const lastInteraction =
		interactions && interactions.length > 0 ? interactions[interactions.length - 1] : null

	let name: string
	let inte: beapi.messenger.IInteraction | ParsedInteraction | null
	let avatar: JSX.Element
	switch (kind) {
		case SearchResultKind.Contact:
			avatar = <ContactAvatar publicKey={contactPk} size={_resultAvatarSize} />
			name = data.displayName || ''
			inte = lastInteraction || null
			break
		case SearchResultKind.Conversation:
			avatar = <ConversationAvatar publicKey={convPk} size={_resultAvatarSize} />
			name = data.displayName || ''
			inte = lastInteraction || null
			break
		case SearchResultKind.Interaction:
			if (conv?.type === beapi.messenger.Conversation.Type.ContactType) {
				name = contact?.displayName || ''
				avatar = <ContactAvatar publicKey={contact?.publicKey} size={_resultAvatarSize} />
			} else {
				name = conv?.displayName || ''
				avatar = <ConversationAvatar publicKey={convPk} size={_resultAvatarSize} />
			}
			inte = data || null
			if (inte !== null) {
				try {
					inte = parseInteraction(inte as beapi.messenger.Interaction)
				} catch (e) {
					console.warn(e)
				}
			}

			console.log(data)
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
					case beapi.messenger.Contact.State.IncomingRequest:
						content = '📬 Incoming request'
						break
					case beapi.messenger.Contact.State.OutgoingRequestEnqueued:
						content = '📪 Outgoing request enqueued'
						break
					case beapi.messenger.Contact.State.OutgoingRequestSent:
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
					? data.state === beapi.messenger.Contact.State.IncomingRequest
						? navigate.main.contactRequest({ contactId: data.publicKey })
						: null
					: dispatch(
							CommonActions.navigate({
								name:
									conv.type === beapi.messenger.Conversation.Type.ContactType
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
				{avatar}
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

const createSections = (
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

const _approxFooterHeight = 90

export const SearchComponent: React.FC<{
	insets: EdgeInsets | null
	conversations: { [key: string]: beapi.messenger.IConversation | undefined }
	contacts: { [key: string]: beapi.messenger.IContact | undefined }
	interactions: beapi.messenger.IInteraction[]
	hasResults: boolean
	value: string
	earliestInteractionCID: string
}> = ({
	insets,
	conversations,
	contacts,
	interactions,
	hasResults,
	value,
	earliestInteractionCID: _earliestInteractionCID,
}) => {
	const [
		{ height, width, background, padding, text, border, margin },
		{ scaleHeight },
	] = useStyles()
	const validInsets = useMemo(() => insets || { top: 0, bottom: 0, left: 0, right: 0 }, [insets])

	const sortedConversations = useMemo(() => {
		return Object.values(conversations).sort((a, b) => {
			return pbDateToNum(b?.lastUpdate) - pbDateToNum(a?.lastUpdate)
		})
	}, [conversations])

	const sections = useMemo(
		() => createSections(sortedConversations, Object.values(contacts), interactions, value),
		[contacts, sortedConversations, interactions, value],
	)

	useEffect(() => {
		console.log(value, hasResults)
	})

	return hasResults ? (
		<SectionList
			style={{
				marginLeft: validInsets.left,
				marginRight: validInsets.right,
			}}
			stickySectionHeadersEnabled={false}
			bounces={false}
			keyExtractor={(item: any) => item.cid || item.publicKey}
			sections={sections}
			renderSectionHeader={({ section }) => {
				const { title } = section
				let isFirst
				sections?.map((value: any, key: any) => {
					if (value.data?.length && value.title === section.title) {
						switch (key) {
							case 0:
								isFirst = true
								break
							case 1:
								isFirst = sections[0].data?.length ? false : true
								break
							case 2:
								isFirst = sections[0].data?.length || sections[1].data?.length ? false : true
								break
						}
					}
				})
				return title ? (
					<View
						style={[
							!isFirst && border.radius.top.big,
							background.white,
							!isFirst && {
								shadowOpacity: 0.1,
								shadowRadius: 8,
								shadowOffset: { width: 0, height: -12 },
							},
						]}
					>
						<View style={[padding.horizontal.medium]}>
							<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
								<View
									style={[width(42), height(4), margin.top.medium, { backgroundColor: '#F1F4F6' }]}
								/>
							</View>
							<TextNative
								style={[
									text.size.scale(25),
									text.color.black,
									text.bold.medium,
									{ fontFamily: 'Open Sans' },
								]}
							>
								{title}
							</TextNative>
						</View>
					</View>
				) : null
			}}
			ListFooterComponent={() => (
				// empty div at bottom of list

				// Workaround to make sure nothing is hidden behind footer;
				// adding padding/margin to this or a wrapping parent doesn't work
				<View style={[height(_approxFooterHeight + 20)]} />
			)}
		/>
	) : (
		<View style={{ position: 'relative' }}>
			<Translation>
				{(t: any): React.ReactNode => (
					<TextNative
						style={[
							text.color.black,
							text.size.big,
							text.bold.small,
							text.align.center,
							{
								fontFamily: 'Open Sans',
								position: 'absolute',
								top: 230,
								left: 0,
								right: 0,
								color: '#FFAE3A',
							},
						]}
					>
						{t('main.home.search.no-results')}
					</TextNative>
				)}
			</Translation>
			<Icon
				name='search'
				width={500}
				height={500}
				fill='#FFFBF6'
				style={{ position: 'absolute', top: 0, right: -63 }}
			/>
			<View style={[margin.top.scale(370 * scaleHeight)]}>
				<HintBody />
			</View>
		</View>
	)
}
