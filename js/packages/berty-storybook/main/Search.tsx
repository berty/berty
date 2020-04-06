import React, { useState } from 'react'
import { View, TouchableHighlight, StyleSheet, Dimensions, TextInput } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { styles, colors, useStyles } from '@berty-tech/styles'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { Chat } from '@berty-tech/hooks'
import { useResponsiveHeight } from 'react-native-responsive-dimensions'

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
		backgroundColor: colors.lightYellow,
	},
	searchComponentBody: {},
	searchResultsSearchBar: {
		borderRadius: 7,
		backgroundColor: colors.lightYellow,
	},
})

const initialSearchText = ''

const SearchBar: React.FC<{ onChange?: (text: string) => void; searchText: string }> = ({
	onChange,
	searchText,
}) => {
	const [{ row, color, padding }] = useStyles()
	const windowWidth = Dimensions.get('window').width
	const iconSize = 25
	const paddingHorizontal = 15
	const inputWidth = windowWidth - 2 * (iconSize + paddingHorizontal + 10 + 30)
	return (
		<View style={{ paddingHorizontal: 30 }}>
			<View
				style={[
					{
						flexDirection: 'row',
						justifyContent: 'space-between',
						width: '100%',
						backgroundColor: colors.lightYellow,
						borderRadius: 10,
						padding: 10,
					},
				]}
			>
				<Icon name='search' width={iconSize} height={iconSize} fill={color.yellow} />
				<TextInput
					onChangeText={onChange}
					placeholder='Search'
					placeholderTextColor={color.yellow}
					style={[
						{
							color: color.yellow,
							backgroundColor: color.light.yellow,
							width: inputWidth,
							paddingHorizontal,
							flexGrow: 1,
						},
					]}
				/>
				{searchText.length > 0 && (
					<Icon
						name='close-circle-outline'
						width={iconSize}
						height={iconSize}
						fill={color.yellow}
					/>
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

export const Search: React.FC<{}> = () => {
	const [searchText, setSearchText] = useState(initialSearchText)
	const contacts = Chat.useAccountContactSearchResults(searchText)
	const [{ padding, column, color, margin, row, border }] = useStyles()
	const topMargin = useResponsiveHeight(2.5)

	return (
		<View style={[{ height: '100%', width: '100%', backgroundColor: color.yellow }]}>
			<View
				style={[
					margin.top.small,
					row.item.justify,
					border.scale(2.5),
					border.color.light.grey,
					border.radius.scale(4),
					{
						backgroundColor: 'white',
						width: '14%',
						opacity: 0.6,
						marginBottom: topMargin,
					},
				]}
			/>
			<SearchBar searchText={searchText} onChange={setSearchText} />
			<View style={[column.justify, _stylesSearch.searchComponentBody, { marginTop: 30 }]}>
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

// SEARCH RESULTS

type SearchItemProps = {
	avatarUri: string
	name: string
	message: string
}

const SearchItem: React.FC<SearchItemProps> = ({ avatarUri, name, message }) => {
	const _styles = useStylesSearch()
	return (
		<TouchableHighlight underlayColor={colors.lightGrey}>
			<View style={[styles.row, styles.borderBottom, styles.padding]}>
				<CircleAvatar avatarUri={avatarUri} size={39} withCircle={false} />
				<View style={[styles.flex, styles.col, styles.paddingLeft]}>
					<View style={[styles.row, styles.alignItems]}>
						<Text numberOfLines={1} style={_styles.conversationsItemNameText}>
							{name}
						</Text>
					</View>
					<View style={[styles.bigMarginRight]}>
						<Text
							numberOfLines={1}
							style={[styles.textSmall, styles.textGrey, _styles.conversationsItemMsgText]}
						>
							{message}
						</Text>
					</View>
				</View>
			</View>
		</TouchableHighlight>
	)
}
