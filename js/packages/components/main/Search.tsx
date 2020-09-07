import dayjs from 'dayjs'
import { noop } from 'lodash'
import React, { useMemo, useState } from 'react'
import {
	Keyboard,
	ScrollView,
	SectionList,
	TextInput,
	TouchableHighlight,
	View,
} from 'react-native'
import { EdgeInsets, SafeAreaConsumer } from 'react-native-safe-area-context'
import { Icon, Layout, Text } from 'react-native-ui-kitten'
import { CommonActions } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import pickBy from 'lodash/pickBy'

import { Routes, useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import {
	useAccountContactSearchResults,
	useFirstConversationWithContact,
	useGetMessage,
	useMsgrContext,
	useGetMessageSearchResultWithMetadata,
	useConversation,
	useContact,
	useSortedConvInteractions,
} from '@berty-tech/store/hooks'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import * as api from '@berty-tech/api/index.pb'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'

// Styles

const _titleIconSize = 30

const _landingIconSize = 90

const _resultAvatarSize = 45

const _searchBarIconSize = 25

const _approxFooterHeight = 90

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

// Utility

const formatTimestamp = (date: Date) => {
	const now = new Date(Date.now())
	const isToday =
		now.getDate() === date.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear()
	if (!isToday) {
		return dayjs(date).format('DD/MM')
	} else if (now.getFullYear() !== date.getFullYear()) {
		return dayjs(date).format('DD/MM/YYYY')
	} else {
		const arr = date.toString().split(' ')
		const hours = arr[4].split(':')
		const hour = hours[0] + ':' + hours[1]
		return hour
	}
}

//

const SearchTitle: React.FC<{}> = () => {
	const [{ text, color, flex, margin }, { scaleSize }] = useStyles()
	const { dispatch } = useNavigation()
	return (
		<View
			style={[
				flex.direction.row,
				flex.justify.center,
				flex.align.center,
				margin.left.scale(_titleIconSize),
				margin.top.medium,
			]}
		>
			<Text
				style={[
					text.size.big,
					text.bold.medium,
					text.color.white,
					text.align.center,
					flex.align.center,
					flex.justify.center,
					{
						flexShrink: 0,
						flexGrow: 1,
					},
				]}
			>
				Search
			</Text>
			<Icon
				style={[
					{
						flexShrink: 0,
						flexGrow: 0,
					},
				]}
				name='arrow-forward-outline'
				width={_titleIconSize * scaleSize}
				height={_titleIconSize * scaleSize}
				fill={color.white}
				onPress={() => dispatch(CommonActions.navigate(Routes.Main.Home))}
			/>
		</View>
	)
}

const initialSearchText = ''

const SearchBar: React.FC<{
	onChange: (text: string) => void
	searchText: string
}> = ({ onChange, searchText }) => {
	const [{ row, color, background, text, margin, padding }, { scaleSize }] = useStyles()
	const onClear = (): void => {
		onChange('')
		Keyboard.dismiss()
	}

	return (
		<ScrollView
			contentContainerStyle={[row.left, { alignItems: 'center' }]}
			keyboardShouldPersistTaps='handled'
		>
			<Icon
				name='search'
				width={_searchBarIconSize * scaleSize}
				height={_searchBarIconSize * scaleSize}
				fill={color.yellow}
			/>
			<TextInput
				onChangeText={onChange}
				placeholder='Search'
				placeholderTextColor={color.yellow}
				style={[
					{ flex: 2 },
					padding.scale(4),
					margin.left.scale(10),
					background.light.yellow,
					text.color.yellow,
				]}
				autoCorrect={false}
				autoCapitalize='none'
				value={searchText}
			/>
			{searchText.length > 0 && (
				<Icon
					name='close-circle-outline'
					width={_searchBarIconSize * scaleSize}
					height={_searchBarIconSize * scaleSize}
					fill={color.yellow}
					onPress={onClear}
					style={[{ marginLeft: 'auto' }]}
				/>
			)}
		</ScrollView>
	)
}

const SearchHint: React.FC<{
	hintText: string
}> = ({ hintText = 'Search messages, contacts, or groups...' }) => {
	const [
		{ row, color, text, margin, column, padding, width, opacity },
		{ windowWidth, scaleSize },
	] = useStyles()
	return (
		<View style={[column.top, padding.small, margin.bottom.scale(_approxFooterHeight)]}>
			<Icon
				name='search'
				width={_landingIconSize * scaleSize}
				height={_landingIconSize * scaleSize}
				fill={color.light.yellow}
				style={[row.item.justify, opacity(0.8)]}
			/>
			<Text
				style={[
					text.align.center,
					margin.top.small,
					row.item.justify,
					text.color.light.yellow,
					text.size.large,
					width(windowWidth * 0.66),
					opacity(0.8),
				]}
			>
				{hintText}
			</Text>
		</View>
	)
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

	const date = parseInt((inte?.sentDate as string | undefined) || '0', 10)

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
				{formatTimestamp(new Date(date))}
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

const SearchComponent: React.FC<{
	insets: EdgeInsets | null
	conversations: { [key: string]: api.berty.messenger.v1.IConversation }
	contacts: { [key: string]: api.berty.messenger.v1.IContact }
	interactions: { [key: string]: api.berty.messenger.v1.IInteraction }
	searchText: string
	setSearchText: (v: string) => void
	hasResults: boolean
}> = ({ insets, contacts, interactions, searchText, setSearchText, hasResults, conversations }) => {
	const validInsets = useMemo(() => insets || { top: 0, bottom: 0, left: 0, right: 0 }, [insets])
	const [{ padding, margin, background, text, flex, border, height }] = useStyles()
	const sections = useMemo(
		() =>
			createSections(
				Object.values(conversations),
				Object.values(contacts),
				Object.values(interactions),
				searchText,
			),
		[contacts, conversations, interactions, searchText],
	)

	// Remove leading spaces
	const setValidSearchText = (textInput: string) => {
		setSearchText(textInput.replace(/^\s+/g, ''))
	}

	const paddingVertical = useMemo(
		() => ({
			paddingTop: Math.max(0, validInsets.top),
			paddingBottom: contacts.length || interactions.length ? 0 : Math.max(0, validInsets.bottom),
		}),
		[contacts.length, validInsets, interactions.length],
	)

	const mainBackgroundColor = useMemo(() => (hasResults ? background.white : background.yellow), [
		background.white,
		background.yellow,
		hasResults,
	])

	const hintText = () =>
		searchText && !contacts.length ? 'No results found' : 'Search messages, contacts, or groups...'

	return (
		<View style={[flex.tiny, paddingVertical]}>
			{/* Title */}
			<View
				style={[
					padding.small,
					margin.medium,
					margin.top.large,
					{
						flexShrink: 0,
						marginLeft: Math.max(validInsets.left, 16),
						marginRight: Math.max(validInsets.right, 16),
					},
				]}
			>
				<SearchTitle />
			</View>
			{/* SearchBar */}
			<View
				style={[
					padding.small,
					margin.horizontal.medium,
					margin.bottom.medium,
					background.light.yellow,
					border.radius.small,
					{
						marginLeft: Math.max(validInsets.left, 16),
						marginRight: Math.max(validInsets.right, 16),
						flexShrink: 0,
						flexGrow: 0,
					},
				]}
			>
				<SearchBar searchText={searchText} onChange={setValidSearchText} />
			</View>
			{/* Results or Landing */}
			<View
				style={[
					margin.top.small,
					flex.justify.center,
					mainBackgroundColor,
					{
						flexShrink: 1,
						flexGrow: 1,
						paddingHorizontal: 0,
					},
				]}
			>
				{hasResults ? (
					<SectionList
						style={{
							marginLeft: validInsets.left,
							marginRight: validInsets.right,
						}}
						stickySectionHeadersEnabled={false}
						bounces={false}
						keyExtractor={(item) => item.cid || item.publicKey}
						sections={sections}
						renderSectionHeader={({ section: { title } }) => {
							return title ? (
								<Text style={[text.size.large, padding.medium, background.white]}>{title}</Text>
							) : null
						}}
						ListFooterComponent={() => (
							// empty div at bottom of list

							// Workaround to make sure nothing is hidden behind footer;
							// adding padding/margin to this or a wrapping parent doesn't work
							<View style={[height(_approxFooterHeight), background.white]} />
						)}
					/>
				) : (
					<SearchHint hintText={hintText()} />
				)}
			</View>
		</View>
	)
}

export const Search: React.FC<{}> = () => {
	const [{ flex, background, absolute }] = useStyles()

	const [searchText, setSearchText] = useState(initialSearchText)
	const searching = !!searchText
	const lowSearchText = searchText.toLowerCase()
	const searchCheck = React.useCallback(
		(searchIn?: string | null | false | 0) =>
			(searchIn || '').toLowerCase().includes(lowSearchText),
		[lowSearchText],
	)

	const ctx = useMsgrContext()

	const conversations = React.useMemo(
		() =>
			searching
				? pickBy(
						ctx.conversations,
						(val: any) =>
							val.type === messengerpb.Conversation.Type.MultiMemberType &&
							searchCheck(val.displayName),
				  )
				: {},
		[ctx.conversations, searchCheck, searching],
	)

	const contacts = React.useMemo(
		() => (searching ? pickBy(ctx.contacts, (val: any) => searchCheck(val.displayName)) : {}),
		[ctx.contacts, searchCheck, searching],
	)

	const interactions = React.useMemo(() => {
		if (!searching) {
			return {}
		}
		const allInteractions: any = Object.values(ctx.interactions).reduce(
			(r: any, intes: any) => ({ ...r, ...intes }),
			{},
		)
		return pickBy(
			allInteractions,
			(inte) =>
				inte.type === messengerpb.AppMessage.Type.TypeUserMessage &&
				searchCheck(inte.payload?.body),
		)
	}, [ctx.interactions, searchCheck, searching])

	const hasResults = [conversations, contacts, interactions].some((c) => Object.keys(c).length > 0)

	return (
		<>
			<Layout style={[flex.tiny, background.yellow]}>
				<SafeAreaConsumer>
					{(insets: EdgeInsets | null) => {
						return (
							<View style={[flex.tiny]}>
								<SearchComponent
									insets={insets}
									contacts={contacts}
									interactions={interactions}
									conversations={conversations}
									searchText={searchText}
									setSearchText={setSearchText}
									hasResults={hasResults}
								/>
							</View>
						)
					}}
				</SafeAreaConsumer>
			</Layout>
			{hasResults && (
				<LinearGradient
					style={[
						absolute.bottom,
						{ alignItems: 'center', justifyContent: 'center', height: '15%', width: '100%' },
					]}
					colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
				/>
			)}
		</>
	)
}
