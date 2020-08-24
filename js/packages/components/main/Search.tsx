import { Messenger } from '@berty-tech/store/oldhooks'
import {
	useFirstConversationWithContact,
	useGetMessage,
} from '@berty-tech/store/oldhooks/Messenger'
import { Routes, useNavigation } from '@berty-tech/navigation'

import { useStyles } from '@berty-tech/styles'
import { CommonActions } from '@react-navigation/core'
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
import { ConversationProceduralAvatar } from '../shared-components'

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

type SearchItemProps = {
	data: any
	searchTextKey: 'name' | 'message'
	searchText?: string
}

// TODO: Move/refactor to hooks
const useSearchItemDataFromContact = (
	data: any,
): {
	name: string
	message: string
	convId: string
	messageListIndex: number
	receivedDate: number
} => {
	const { name = '', publicKey = '' } = data
	const conversation = useFirstConversationWithContact(publicKey)
	const lastMessage = useGetMessage(
		conversation ? conversation.messages[conversation?.messages.length - 1] : '',
	)
	const { receivedDate = 0 } = lastMessage || {}

	return {
		name,
		messageListIndex: conversation ? conversation.messages.length - 1 : 0,
		convId: conversation ? conversation.id : '',
		message:
			lastMessage && lastMessage.type === messenger.AppMessageType.UserMessage
				? lastMessage.body
				: '',
		receivedDate,
	}
}

const useSearchItemDataFromMessage = (
	data: any = {},
): {
	name: string
	message: string
	convId: string
	messageListIndex: number
	receivedDate: number
} => {
	const {
		message: { body, receivedDate },
		conversationId,
		conversationTitle,
		messageIndex,
	} = data
	return {
		name: conversationTitle,
		message: body,
		messageListIndex: messageIndex,
		convId: conversationId,
		receivedDate,
	}
}

const MessageSearchResult: React.FC<{
	message: string
	searchText: string
}> = ({ message, searchText }) => {
	const [{ start, end }] = useState({
		start: message.toLowerCase().indexOf(searchText.toLowerCase()),
		end: message.toLowerCase().indexOf(searchText.toLowerCase()) + searchText.length,
	})
	const { plainMessageText, searchResultHighlightText } = useStylesSearch()

	return (
		<>
			<Text style={plainMessageText}>{message.slice(0, start)}</Text>
			<Text style={searchResultHighlightText}>{message.slice(start, end)}</Text>
			<Text style={plainMessageText}>{message.slice(end)}</Text>
		</>
	)
}

// hacky workaround to use conditional hook ^^
const useSomeSearchItem = (key: SearchItemProps['searchTextKey']) =>
	key === 'name' ? useSearchItemDataFromContact : useSearchItemDataFromMessage

const SearchResultItem: React.FC<SearchItemProps> = ({ data, searchTextKey, searchText = '' }) => {
	const [{ color, row, padding, flex, column, text, margin, border }] = useStyles()
	const { plainMessageText } = useStylesSearch()
	const { name, message, convId, messageListIndex, receivedDate } = useSomeSearchItem(
		searchTextKey,
	)(data)
	const [noConversation, noMessages] = useMemo(() => [!convId, messageListIndex < 0], [
		convId,
		messageListIndex,
	])
	const { dispatch } = useNavigation()

	const MessageDisplay = () =>
		noMessages ? null : (
			<Text numberOfLines={1} style={plainMessageText}>
				{searchTextKey === 'name' ? (
					<>{message}</>
				) : (
					<MessageSearchResult searchText={searchText} message={message} />
				)}
			</Text>
		)

	const TimeStamp = () => {
		return (
			<Text style={[padding.left.small, text.size.small, text.color.grey]}>
				{formatTimestamp(new Date(receivedDate))}
			</Text>
		)
	}

	return (
		<TouchableHighlight
			disabled={noConversation}
			underlayColor={noConversation ? 'transparent' : color.light.grey}
			onPress={() =>
				noConversation
					? noop()
					: dispatch(
							CommonActions.navigate({
								name: Routes.Chat.OneToOne,
								params: {
									convId,
									scrollToMessage: noMessages ? 0 : messageListIndex,
								},
							}),
					  )
			}
		>
			<View style={[row.center, padding.medium, border.bottom.tiny, border.color.light.grey]}>
				<ConversationProceduralAvatar
					conversationId={convId}
					size={_resultAvatarSize}
					diffSize={9}
					style={[padding.tiny, row.item.justify]}
				/>
				<View style={[flex.medium, column.justify, padding.left.medium]}>
					<View style={[margin.right.big]}>
						<Text
							numberOfLines={1}
							style={[column.item.fill, text.bold.medium, noConversation && text.color.grey]}
						>
							{name}
						</Text>
						<MessageDisplay />
					</View>
				</View>

				<View style={[{ marginLeft: 'auto' }, row.item.center]}>
					{receivedDate > 0 && searchTextKey === 'message' ? <TimeStamp /> : null}
				</View>
			</View>
		</TouchableHighlight>
	)
}

const createSections = (contacts: any, messages: any, searchText: string) => {
	const sections = [
		{
			title: contacts.length ? 'Contacts' : '',
			data: [...contacts],
			renderItem: ({ item }: { item: any }) => (
				<SearchResultItem data={item} searchTextKey={'name'} />
			),
		},
		{
			title: messages.length ? 'Messages' : '',
			data: [...messages],

			renderItem: ({ item }: { item: any }) => (
				<SearchResultItem data={item} searchTextKey={'message'} searchText={searchText} />
			),
		},
	]
	return sections
}

const SearchComponent: React.FC<{
	insets: EdgeInsets | null
}> = ({ insets }) => {
	const validInsets = useMemo(() => insets || { top: 0, bottom: 0, left: 0, right: 0 }, [insets])
	const [searchText, setSearchText] = useState(initialSearchText)
	const contacts = [] /*Messenger.useAccountContactSearchResults(searchText)*/
	const messages = [] /*Messenger.useGetMessageSearchResultWithMetadata(searchText)*/
	const [{ padding, margin, background, text, flex, border, height }] = useStyles()
	const sections = useMemo(() => createSections(contacts, messages, searchText), [
		messages,
		contacts,
		searchText,
	])

	// Remove leading spaces
	const setValidSearchText = (textInput: string) => {
		setSearchText(textInput.replace(/^\s+/g, ''))
	}

	const paddingVertical = useMemo(
		() => ({
			paddingTop: Math.max(0, validInsets.top),
			paddingBottom: contacts.length || messages.length ? 0 : Math.max(0, validInsets.bottom),
		}),
		[contacts.length, validInsets, messages.length],
	)

	const mainBackgroundColor = useMemo(
		() => (contacts.length > 0 || messages.length > 0 ? background.white : background.yellow),
		[background.white, background.yellow, contacts.length, messages.length],
	)

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
				{contacts.length + messages.length > 0 ? (
					<SectionList
						style={{
							marginLeft: Math.max(validInsets.left, 16),
							marginRight: Math.max(validInsets.right, 16),
						}}
						stickySectionHeadersEnabled={false}
						bounces={false}
						keyExtractor={(item, index) => item.id + index}
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
	const [{ flex, background }] = useStyles()

	return (
		<Layout style={[flex.tiny, background.yellow]}>
			<SafeAreaConsumer>
				{(insets: EdgeInsets | null) => {
					return (
						<View style={[flex.tiny]}>
							<SearchComponent insets={insets} />
						</View>
					)
				}}
			</SafeAreaConsumer>
		</Layout>
	)
}
