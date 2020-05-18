import React, { useState } from 'react'
import { View, TouchableHighlight, StyleSheet, Dimensions, TextInput } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { Chat } from '@berty-tech/hooks'
import { SafeAreaView } from 'react-native-safe-area-context'

const Screen = Dimensions.get('window')

// Styles
const useStylesSearch = () => {
	const [{ text, width, maxWidth, height }] = useStyles()
	return {
		searchComponentText: [text.color.light.yellow, text.size.scale(17), width(200)],
		conversationsItemMsgText: maxWidth(240),
		conversationsItemNameText: maxWidth(120),
		messages: height(400),
	}
}

const _stylesSearch = StyleSheet.create({
	searchComponent: {
		borderRadius: 7,
		top: -395,
	},
	searchComponentBody: {
		top: -290,
	},
})

const initialSearchText = ''

const SearchBar: React.FC<{ onChange?: (text: string) => void; searchText: string }> = ({
	onChange,
	searchText,
}) => {
	const [{ row, color, margin }] = useStyles()

	return (
		<View>
			<View style={[row.fill]}>
				<View style={[row.center]}>
					<Icon name='search' width={25} height={25} fill={color.yellow} />
					<TextInput
						onChangeText={onChange}
						placeholder='Search'
						placeholderTextColor={color.yellow}
						style={[
							margin.left.medium,
							{ color: color.yellow, backgroundColor: color.light.yellow },
						]}
					/>
				</View>
				{searchText.length > 0 && (
					<Icon name='close-circle-outline' width={25} height={25} fill={color.yellow} />
				)}
			</View>
		</View>
	)
}

const SearchHint = () => {
	const [{ row, color, text, margin }] = useStyles()
	const _styles = useStylesSearch()
	return (
		<>
			<Icon
				name='search'
				width={90}
				height={90}
				fill={color.light.yellow}
				style={row.item.justify}
			/>
			<Text
				style={[text.align.center, margin.top.big, row.item.justify, _styles.searchComponentText]}
			>
				Search messages, contacts, or groups...
			</Text>
		</>
	)
}

const SearchComponent: React.FC<{}> = () => {
	const [searchText, setSearchText] = useState(initialSearchText)
	const contacts = Chat.useAccountContactSearchResults(searchText)
	const [{ padding, column, background }] = useStyles()

	return (
		<View style={[{ height: Screen.height, justifyContent: 'center' }]}>
			<View style={[padding.small, background.light.yellow, _stylesSearch.searchComponent]}>
				<SearchBar searchText={searchText} onChange={setSearchText} />
			</View>
			<View style={[column.justify, _stylesSearch.searchComponentBody]}>
				{contacts.length > 0 ? (
					<SDTSModalComponent
						rows={[
							{
								toggledPoint: 50,
								notToggledPoint: 50,
								title: 'Contacts',
								maxHeight: Screen.height,
							},
						]}
					>
						<View>
							{contacts.map((contact) => (
								<SearchItem
									avatarUri={'https://s3.amazonaws.com/uifaces/faces/twitter/msveet/128.jpg'}
									name={contact.name}
									message='Coiuc bfei  bb dehbde dbehbe dhbed edeh d'
								/>
							))}
						</View>
					</SDTSModalComponent>
				) : (
					<SearchHint />
				)}
			</View>
		</View>
	)
}

export const Search: React.FC<{}> = () => {
	const firstNotToggledPoint = Screen.height - 120
	const firstToggledPoint = 20
	const [{ flex, color }] = useStyles()

	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={[flex.tiny]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							initialPoint: firstToggledPoint,
							header: false,
							maxHeight: Screen.height - 90,
							bgColor: color.yellow,
						},
					]}
				>
					<SearchComponent />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}

// SEARCH RESULTS

type SearchItemProps = {
	avatarUri: string
	name: string
	message: string
}

const SearchItem: React.FC<SearchItemProps> = ({ avatarUri, name, message }) => {
	const _styles = useStylesSearch()
	const [{ color, row, border, padding, flex, column, text, margin }] = useStyles()
	return (
		<TouchableHighlight underlayColor={color.light.grey}>
			<View style={[row.center, border.bottom.big, padding.medium]}>
				<CircleAvatar avatarUri={avatarUri} size={39} withCircle={false} />
				<View style={[flex.medium, column.justify, padding.left.medium]}>
					<View style={[row.center, { alignItems: 'center' }]}>
						<Text numberOfLines={1} style={_styles.conversationsItemNameText}>
							{name}
						</Text>
					</View>
					<View style={[margin.right.big]}>
						<Text
							numberOfLines={1}
							style={[text.size.small, text.color.grey, _styles.conversationsItemMsgText]}
						>
							{message}
						</Text>
					</View>
				</View>
			</View>
		</TouchableHighlight>
	)
}
