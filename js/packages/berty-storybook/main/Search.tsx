import React, { useState } from 'react'
import {
	View,
	SafeAreaView,
	ScrollView,
	TouchableHighlight,
	StyleSheet,
	Dimensions,
	TextInput,
} from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors, useStyles } from '@berty-tech/styles'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { RequestProps, UserProps } from '../shared-props/User'

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
		top: -395,
	},
	searchComponentBody: {
		top: -290,
	},
	searchResultsSearchBar: {
		borderRadius: 7,
		backgroundColor: colors.lightYellow,
		top: -50,
	},
})

const SearchBar: React.FC<{}> = () => {
	const [value, setValue] = useState(undefined)
	const [{ row, color, margin }] = useStyles()

	return (
		<View>
			<View style={[row.fill]}>
				<View style={[row.center]}>
					<Icon name='search' width={25} height={25} fill={color.yellow} />
					<TextInput
						value={value && value.length > 0 ? value : undefined}
						onChangeText={(text) => (text.length > 0 ? setValue(text) : setValue(undefined))}
						placeholder='Search'
						placeholderTextColor={color.yellow}
						style={[
							margin.left.medium,
							{ color: color.yellow, backgroundColor: color.light.yellow },
						]}
					/>
				</View>
				{value && value.length > 0 && (
					<Icon name='close-circle-outline' width={25} height={25} fill={color.yellow} />
				)}
			</View>
		</View>
	)
}

const SearchComponent: React.FC<{}> = () => {
	const [{ row, padding, color, text, margin, column }] = useStyles()
	const _styles = useStylesSearch()

	return (
		<View style={[{ height: Screen.height, justifyContent: 'center' }]}>
			<View style={[padding.small, _stylesSearch.searchComponent]}>
				<SearchBar />
			</View>
			<View style={[column.justify, _stylesSearch.searchComponentBody]}>
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

// type ConversationsItemProps = {
// 	avatarUri: string
// 	name: string
// 	message: string
// }

// const ConversationsItem: React.FC<ConversationsItemProps> = ({ avatarUri, name, message }) => {
// 	const _styles = useStylesSearch()
// 	return (
// 	<TouchableHighlight underlayColor={colors.lightGrey}>
// 		<View style={[styles.row, styles.borderBottom, styles.padding]}>
// 			<CircleAvatar avatarUri={avatarUri} size={39} withCircle={false} />
// 			<View style={[styles.flex, styles.col, styles.paddingLeft]}>
// 				<View style={[styles.row, styles.alignItems]}>
// 					<Text numberOfLines={1} style={_styles.conversationsItemNameText}>
// 						{name}
// 					</Text>
// 				</View>
// 				<View style={[styles.bigMarginRight]}>
// 					<Text
// 						numberOfLines={1}
// 						style={[styles.textSmall, styles.textGrey, _styles.conversationsItemMsgText]}
// 					>
// 						{message}
// 					</Text>
// 				</View>
// 			</View>
// 		</View>
// 	</TouchableHighlight>
// )
// 	}

// const Messages: React.FC<UserProps> = ({ avatarUri, name }) => (
// 	<View style={_stylesSearch.messages}>
// 		<ScrollView
// 			contentContainerStyle={[styles.littlePaddingVertical]}
// 			showsVerticalScrollIndicator={false}
// 		>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
// 			/>
// 		</ScrollView>
// 	</View>
// )

// const Contacts: React.FC<UserProps> = ({ avatarUri, name }) => (
// 	<View>
// 		<ScrollView
// 			contentContainerStyle={[styles.littlePaddingBottom]}
// 			showsVerticalScrollIndicator={false}
// 		>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Coiuc bfei  bb dehbde dbehbe dhbed edeh d'
// 			/>
// 			<ConversationsItem
// 				avatarUri={avatarUri}
// 				name={name}
// 				message='Coiuc bfei  bb dehbde dbehbe dhbed edeh d'
// 			/>
// 		</ScrollView>
// 	</View>
// )

// const SearchResultsSearchBar: React.FC<{}> = () => (
// 	<View style={[{ height: Screen.height }]}>
// 		<View style={[styles.littlePadding, _stylesSearch.searchResultsSearchBar]}>
// 			<SearchBar />
// 		</View>
// 	</View>
// )

// export const SearchResults: React.FC<RequestProps> = ({ user }) => {
// 	const firstToggledPoint = 1165
// 	const firstNotToggledPoint = firstToggledPoint

// 	const secondToggledPoint = 430
// 	const secondNotToggledPoint = secondToggledPoint

// 	const thirdToggledPoint = 50
// 	const thirdNotToggledPoint = thirdToggledPoint

// 	return (
// 		<Layout style={[styles.flex]}>
// 			<SafeAreaView style={[styles.flex]}>
// 				<SDTSModalComponent
// 					rows={[
// 						{
// 							toggledPoint: firstToggledPoint,
// 							notToggledPoint: firstNotToggledPoint,
// 							title: 'Messages',
// 							maxHeight: Screen.height,
// 						},
// 						{
// 							toggledPoint: secondToggledPoint,
// 							notToggledPoint: secondNotToggledPoint,
// 							title: 'Contacts',
// 						},
// 						{
// 							toggledPoint: thirdToggledPoint,
// 							notToggledPoint: thirdNotToggledPoint,
// 							header: false,
// 							bgColor: colors.yellow,
// 							maxHeight: Screen.height - 90,
// 						},
// 					]}
// 				>
// 					<Messages {...user} />
// 					<Contacts {...user} />
// 					<SearchResultsSearchBar />
// 				</SDTSModalComponent>
// 			</SafeAreaView>
// 		</Layout>
// 	)
// }
