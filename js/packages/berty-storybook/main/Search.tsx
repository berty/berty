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
import { styles, colors } from '../styles'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { RequestProps, UserProps } from '../shared-props/User'

const Screen = Dimensions.get('window')

// Styles
const _stylesSearch = StyleSheet.create({
	searchComponent: {
		borderRadius: 7,
		backgroundColor: colors.lightYellow,
		top: -395,
	},
	searchComponentBody: {
		top: -290,
	},
	searchComponentText: {
		color: colors.lightYellow,
		fontSize: 17,
		width: 200,
	},
	conversationsItemMsgText: {
		maxWidth: 240,
	},
	conversationsItemNameText: {
		maxWidth: 120,
	},
	messages: {
		height: 400,
	},
	searchResultsSearchBar: {
		borderRadius: 7,
		backgroundColor: colors.lightYellow,
		top: -50,
	},
})

const SearchBar: React.FC<{}> = () => {
	const [value, setValue] = useState(undefined)

	return (
		<View>
			<View style={[styles.row, styles.spaceBetween, styles.alignItems]}>
				<View style={[styles.row, styles.alignItems]}>
					<Icon name='search' width={25} height={25} fill={colors.yellow} />
					<TextInput
						value={value && value.length > 0 ? value : undefined}
						onChangeText={(text) => (text.length > 0 ? setValue(text) : setValue(undefined))}
						placeholder='Search'
						placeholderTextColor={colors.yellow}
						style={[
							styles.marginLeft,
							{ color: colors.yellow, backgroundColor: colors.lightYellow },
						]}
					/>
				</View>
				{value && value.length > 0 && (
					<Icon name='close-circle-outline' width={25} height={25} fill={colors.yellow} />
				)}
			</View>
		</View>
	)
}

const SearchComponent: React.FC<{}> = () => (
	<View style={[{ height: Screen.height }, styles.spaceCenter]}>
		<View style={[styles.littlePadding, _stylesSearch.searchComponent]}>
			<SearchBar />
		</View>
		<View style={[styles.center, styles.alignItems, _stylesSearch.searchComponentBody]}>
			<Icon name='search' width={90} height={90} fill={colors.lightYellow} />
			<Text style={[styles.textCenter, styles.bigMarginTop, _stylesSearch.searchComponentText]}>
				Search messages, contacts, or groups...
			</Text>
		</View>
	</View>
)

export const Search: React.FC<{}> = () => {
	const firstToggledPoint = 50
	const firstNotToggledPoint = firstToggledPoint

	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={[styles.flex]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							header: false,
							maxHeight: Screen.height - 90,
							bgColor: colors.yellow,
						},
					]}
				>
					<SearchComponent />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}

type ConversationsItemProps = {
	avatarUri: string
	name: string
	message: string
}

const ConversationsItem: React.FC<ConversationsItemProps> = ({ avatarUri, name, message }) => (
	<TouchableHighlight underlayColor={colors.lightGrey}>
		<View style={[styles.row, styles.borderBottom, styles.padding]}>
			<CircleAvatar avatarUri={avatarUri} size={39} withCircle={false} />
			<View style={[styles.flex, styles.col, styles.paddingLeft]}>
				<View style={[styles.row, styles.alignItems]}>
					<Text numberOfLines={1} style={_stylesSearch.conversationsItemNameText}>
						{name}
					</Text>
				</View>
				<View style={[styles.bigMarginRight]}>
					<Text
						numberOfLines={1}
						style={[styles.textSmall, styles.textGrey, _stylesSearch.conversationsItemMsgText]}
					>
						{message}
					</Text>
				</View>
			</View>
		</View>
	</TouchableHighlight>
)

const Messages: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={_stylesSearch.messages}>
		<ScrollView
			contentContainerStyle={[styles.littlePaddingVertical]}
			showsVerticalScrollIndicator={false}
		>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Cofuhuhif fjhef feh  fegf eh ede  hdvfgjvegfe'
			/>
		</ScrollView>
	</View>
)

const Contacts: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View>
		<ScrollView
			contentContainerStyle={[styles.littlePaddingBottom]}
			showsVerticalScrollIndicator={false}
		>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Coiuc bfei  bb dehbde dbehbe dhbed edeh d'
			/>
			<ConversationsItem
				avatarUri={avatarUri}
				name={name}
				message='Coiuc bfei  bb dehbde dbehbe dhbed edeh d'
			/>
		</ScrollView>
	</View>
)

const SearchResultsSearchBar: React.FC<{}> = () => (
	<View style={[{ height: Screen.height }]}>
		<View style={[styles.littlePadding, _stylesSearch.searchResultsSearchBar]}>
			<SearchBar />
		</View>
	</View>
)

export const SearchResults: React.FC<RequestProps> = ({ user }) => {
	const firstToggledPoint = 1165
	const firstNotToggledPoint = firstToggledPoint

	const secondToggledPoint = 430
	const secondNotToggledPoint = secondToggledPoint

	const thirdToggledPoint = 50
	const thirdNotToggledPoint = thirdToggledPoint

	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={[styles.flex]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							title: 'Messages',
							maxHeight: Screen.height,
						},
						{
							toggledPoint: secondToggledPoint,
							notToggledPoint: secondNotToggledPoint,
							title: 'Contacts',
						},
						{
							toggledPoint: thirdToggledPoint,
							notToggledPoint: thirdNotToggledPoint,
							header: false,
							bgColor: colors.yellow,
							maxHeight: Screen.height - 90,
						},
					]}
				>
					<Messages {...user} />
					<Contacts {...user} />
					<SearchResultsSearchBar />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}
