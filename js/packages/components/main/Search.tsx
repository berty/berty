/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react'
import {
	View,
	TouchableHighlight,
	TextInput,
	SectionList,
	Keyboard,
	ScrollView,
} from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { Chat } from '@berty-tech/hooks'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDimensions } from '@react-native-community/hooks'

// Styles

const _titleIconSize = 30

const _landingIconSize = 90

const _resultAvatarSize = 39

const _fontSizeSearchComponent = 17 // trying to move away from in-house 'scale' (makes font too small in some devices)
const _fontSizeSmall = 12

const _searchComponentBorderRadius = 7
const _searchBarIconSize = 25

const _searchComponentMarginTopFactor = 0.02
const _approxFooterHeight = 90

const _maxWidthConversationsItemNameText = 120

const useStylesSearch = () => {
	const [{ text, background }] = useStyles()
	const { height: windowHeight, width: windowWidth } = useDimensions().window
	const isLandscape = () => windowHeight < windowWidth

	return {
		searchResultHighlightText: [text.color.yellow, background.light.yellow, text.bold.medium],
		windowHeight,
		windowWidth,
		isLandscape,
	}
}

const SearchTitle: React.FC<{}> = () => {
	const [{ text, color }] = useStyles()
	return (
		<View
			style={[
				{
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					marginLeft: _titleIconSize,
				},
			]}
		>
			<Text
				style={[
					text.size.big,
					text.bold.medium,
					text.color.white,
					text.align.center,
					{
						flexShrink: 0,
						alignItems: 'center',
						justifyContent: 'center',
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
				width={_titleIconSize}
				height={_titleIconSize}
				fill={color.white}
			/>
		</View>
	)
}

const initialSearchText = ''

const SearchBar: React.FC<{
	onChange: (text: string) => void
	searchText: string
}> = ({ onChange, searchText }) => {
	const [{ row, color, background, text }] = useStyles()
	const onClear = (): void => {
		onChange('')
		Keyboard.dismiss()
	}

	return (
		<ScrollView contentContainerStyle={[row.left]} keyboardShouldPersistTaps='handled'>
			<Icon
				name='search'
				width={_searchBarIconSize}
				height={_searchBarIconSize}
				fill={color.yellow}
			/>
			<TextInput
				onChangeText={onChange}
				placeholder='Search'
				placeholderTextColor={color.yellow}
				style={[
					{ marginLeft: 15, padding: 4, flex: 2 },
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
					width={_searchBarIconSize}
					height={_searchBarIconSize}
					fill={color.yellow}
					onPress={onClear}
					style={[{ marginLeft: 'auto' }]}
				/>
			)}
		</ScrollView>
	)
}

const SearchHint: React.FC<{ hintText: string }> = ({
	hintText = 'Search messages, contacts, or groups...',
}) => {
	const [{ row, color, text, margin, column }] = useStyles()
	const { windowWidth } = useStylesSearch()
	return (
		<View style={[column.top, { marginBottom: _approxFooterHeight }]}>
			<Icon
				name='search'
				width={_landingIconSize}
				height={_landingIconSize}
				fill={color.light.yellow}
				style={[row.item.justify, { opacity: 0.8 }]}
			/>
			<Text
				style={[
					text.align.center,
					margin.top.small,
					row.item.justify,
					text.color.light.yellow,
					text.size.medium,
					{ width: windowWidth * 0.5, fontSize: _fontSizeSearchComponent, opacity: 0.8 },
				]}
			>
				{hintText}
			</Text>
		</View>
	)
}

const SearchComponent: React.FC<{}> = () => {
	const [searchText, setSearchText] = useState(initialSearchText)
	const contacts = Chat.useAccountContactSearchResults(searchText)
	const [{ padding, margin, background, text, flex }] = useStyles()
	const { windowHeight, windowWidth } = useStylesSearch()

	const hintText = () =>
		searchText && !contacts.length ? 'No results found' : 'Search messages, contacts, or groups...'

	const fakeMessages: any = !searchText
		? []
		: [
				{ name: contacts[0]?.name, message: 'So cool 😎' },
				{
					name: contacts[0]?.name,
					message:
						"Nobody's gonna hurt anybody. We're all gonna be like three little Fonzies here. And what's Fonzie like? Come on Yolanda, what's Fonzie like?",
				},
				{ name: contacts[0]?.name, message: 'k' },
				{ name: contacts[0]?.name, message: '...' },
				{ name: contacts[0]?.name, message: ' ' },
				{
					name: contacts[0]?.name,
					message:
						"I recognize the council has made a decision, but given that it's a stupid-ass decision, I've elected to ignore it.",
				},
				{
					name: contacts[0]?.name,
					message: "Well, there's this passage I've got memorized — sort of fits the occasion. ",
				},
				{ name: contacts[0]?.name, message: 'à é ü ê î' },
				{ name: contacts[0]?.name, message: 'the THE The' },
		  ]
	const sections = [
		{ title: 'Contacts', data: [...contacts] },
		{ title: 'Messages', data: [...fakeMessages] },
	]

	return (
		<View style={[flex.tiny]}>
			{/* Title */}
			<View
				style={[
					padding.small,
					margin.medium,
					margin.top.huge,
					{
						flexShrink: 0,
						marginTop: windowHeight * _searchComponentMarginTopFactor,
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
					{
						flexShrink: 0,
						flexGrow: 0,
						borderRadius: _searchComponentBorderRadius,
					},
					background.light.yellow,
				]}
			>
				<SearchBar searchText={searchText} onChange={setSearchText} />
			</View>
			{/* Results or Landing */}
			<View
				style={[
					margin.top.small,
					{
						flexShrink: 1,
						flexGrow: 1,
						justifyContent: 'center',
					},
				]}
			>
				{contacts.length > 0 ? (
					<SectionList
						style={[background.white]} // todo: Needs to fill insets from SafeAreaView on Landscape
						keyExtractor={(item, index) => item.name + index}
						sections={sections}
						renderSectionHeader={({ section: { title } }) => {
							return (
								// TODO: Fix this condition (just using it for UI demo)
								(contacts.length > 1 || fakeMessages.length > 1) && (
									<Text style={[text.size.large, padding.medium, background.white]}>{title}</Text>
								)
							)
						}}
						renderItem={({ item }) => (
							<SearchItemTmp
								avatarUri={'https://s3.amazonaws.com/uifaces/faces/twitter/msveet/128.jpg'}
								name={item.name}
								message={item.message || 'The quick brown fox jumps over the lazy dog.'}
								subString={searchText}
								searchTextKey={item.id ? 'name' : 'message'}
							/>
						)}
						ListFooterComponent={() => (
							// Workaround to make sure nothing is hidden behind footer;
							// adding padding/margin to this or a wrapping parent doesn't work
							<View style={[{ height: _approxFooterHeight }, background.white]} />
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
	const [{ flex, color }] = useStyles()

	return (
		<Layout style={[flex.tiny, { backgroundColor: color.yellow }]}>
			{/* // TODO: SAV seems to not respect edges on landscape (even if dynamically changed on orientation change) */}
			<SafeAreaView style={[flex.tiny]} {...{ edges: ['right', 'top', 'left'] }}>
				<SearchComponent />
			</SafeAreaView>
		</Layout>
	)
}

// SEARCH RESULTS

type SearchItemProps = {
	avatarUri: string
	name: string
	message: string
	searchTextKey: 'name' | 'message'
	subString: string
}

// 🚧 The parsing and logic in this function is a placeholder for UI demo
const SearchItemTmp: React.FC<SearchItemProps> = ({
	avatarUri,
	name,
	message,
	searchTextKey,
	subString,
}) => {
	const _styles = useStylesSearch()
	const [{ color, row, padding, flex, column, text, margin }] = useStyles()

	const Name = () => {
		const highlightName = searchTextKey === 'name'
		return (
			<Text
				numberOfLines={1}
				style={[
					{ maxWidth: _maxWidthConversationsItemNameText },
					highlightName && text.bold.medium,
				]}
			>
				{name}
			</Text>
		)
	}

	const Message = () => {
		const highlightMessage = searchTextKey === 'message'
		const subStringLocation = !highlightMessage ? -1 : message.indexOf(subString)
		return !highlightMessage ? (
			<Text numberOfLines={1} style={[{ fontSize: _fontSizeSmall }, text.color.grey]}>
				{message}
			</Text>
		) : (
			<Text numberOfLines={1}>
				<Text style={[{ fontSize: _fontSizeSmall }, text.color.grey]}>
					{message.slice(0, subStringLocation)}
				</Text>
				<Text style={{ ..._styles.searchResultHighlightText, fontSize: _fontSizeSmall }}>
					{message.slice(subStringLocation, subStringLocation + subString.length)}
				</Text>
				<Text style={[{ fontSize: _fontSizeSmall }, text.color.grey]}>
					{message.slice(subStringLocation + subString.length)}
				</Text>
			</Text>
		)
	}

	return (
		<TouchableHighlight underlayColor={color.light.grey}>
			<View
				style={[
					row.center,
					padding.medium,
					{ borderBottomWidth: 1, borderBottomColor: color.light.grey },
				]}
			>
				<CircleAvatar avatarUri={avatarUri} size={_resultAvatarSize} withCircle={false} />
				<View style={[flex.medium, column.justify, padding.left.medium]}>
					<View style={[{ flexDirection: 'row', alignItems: 'center' }]} />
					<View style={[margin.right.big]}>
						<Name />
						<Message />
					</View>
				</View>
			</View>
		</TouchableHighlight>
	)
}
