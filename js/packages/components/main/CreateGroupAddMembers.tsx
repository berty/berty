import React, { useState } from 'react'
import {
	View,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Text as TextNative,
	TouchableWithoutFeedback,
	StatusBar,
} from 'react-native'
import { Layout, Text, Icon, CheckBox } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import { useContactList, useAccountContactSearchResults } from '@berty-tech/store/hooks'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import beapi from '@berty-tech/api'

import { FooterCreateGroup } from './CreateGroupFooter'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { ContactAvatar } from '../avatars'

// Styles
const useStylesCreateGroup = () => {
	const [{ height, width, absolute, border, background, column }] = useStyles()
	return {
		separateBar: [border.scale(0.5), border.color.light.grey], // opacity
		memberItemDelete: [
			height(25),
			width(25),
			absolute.scale({ top: 5, right: 10 }),
			border.shadow.medium,
			border.radius.medium,
			background.white,
			absolute.top,
			column.justify,
		],
	}
}

// Type
type AddMembersItemProps = {
	separateBar?: boolean
	contact: any
	added: boolean
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
}

type AddMembersProps = {
	paddingBottom?: number
	layout: number
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
	members: any[]
}

export const Header: React.FC<{
	title: string
	icon?: string
	iconPack?: string
	first?: boolean
	disabled?: boolean
	onPress?: any
	style?: any
}> = ({
	children,
	title,
	icon,
	iconPack,
	first = false,
	disabled = false,
	onPress = null,
	style = null,
}) => {
	const [
		{ height, border, margin, row, padding, text, column, color, background, opacity },
	] = useStyles()
	return (
		<View style={[!first && background.white]}>
			<TouchableWithoutFeedback onPress={onPress}>
				<View
					style={[
						background.white,
						border.radius.top.scale(30),
						border.shadow.big,
						disabled && opacity(0.5),
						style,
					]}
				>
					<View style={[height(90)]}>
						<View
							style={[
								margin.top.small,
								row.item.justify,
								border.scale(2.5),
								border.color.light.grey,
								border.radius.scale(4),
								{
									backgroundColor: '#E8E9FC',
									width: '14%',
								},
							]}
						/>
						<View style={[margin.top.small]}>
							<View style={[row.fill, padding.horizontal.medium, padding.top.small]}>
								<TextNative
									style={[
										text.bold.medium,
										text.size.scale(25),
										text.color.black,
										column.item.center,
									]}
								>
									{title}
								</TextNative>
								{icon && (
									<Icon name={icon} pack={iconPack} width={30} height={30} fill={color.black} />
								)}
							</View>
						</View>
					</View>
					{children && <View>{children}</View>}
				</View>
			</TouchableWithoutFeedback>
		</View>
	)
}

const AddMembersItem: React.FC<AddMembersItemProps> = ({
	onSetMember,
	onRemoveMember,
	contact,
	added,
	separateBar = true,
}) => {
	const [{ row, margin, padding }] = useStyles()
	const _styles = useStylesCreateGroup()
	return (
		<View>
			<TouchableOpacity
				onPress={() => {
					if (added) {
						onRemoveMember(contact.publicKey)
					} else {
						onSetMember(contact)
					}
				}}
				style={[row.fill, padding.right.small]}
			>
				<View style={[row.left, row.item.justify, padding.vertical.small, { flexShrink: 1 }]}>
					<ContactAvatar size={50} publicKey={contact.publicKey} />
					<Text numberOfLines={1} style={[margin.left.small, row.item.justify, { flexShrink: 1 }]}>
						{contact.displayName}
					</Text>
				</View>
				<View style={[row.item.justify]}>
					<CheckBox
						checked={added}
						onChange={(isChecked: any) => {
							if (isChecked) {
								onSetMember(contact)
							} else {
								onRemoveMember(contact.publicKey)
							}
						}}
					/>
				</View>
			</TouchableOpacity>
			{separateBar && <View style={[_styles.separateBar]} />}
		</View>
	)
}

export const AddMembersHeader: React.FC<{ style?: any }> = ({ style }) => {
	const [{ padding, row, text, margin, border }] = useStyles()
	return (
		<View style={style}>
			<View
				style={[
					margin.top.small,
					row.item.justify,
					border.scale(2.5),
					border.color.light.grey,
					border.radius.scale(4),
					{
						backgroundColor: '#E8E9FC',
						width: '14%',
					},
				]}
			/>
			<View style={[padding.bottom.big, padding.top.medium]}>
				<TextNative style={[text.bold.medium, text.size.scale(27), text.color.black]}>
					Add members
				</TextNative>
			</View>
		</View>
	)
}

const AddMembers: React.FC<AddMembersProps> = ({
	onSetMember,
	onRemoveMember,
	members,
	paddingBottom,
}) => {
	const [{ padding, background, row, margin, border }] = useStyles()
	const [searchText, setSearchText] = useState('')
	const searchContacts = useAccountContactSearchResults(searchText)
	const accountContacts = useContactList()
	const navigation = useNavigation()
	let contacts = searchText.length ? searchContacts : accountContacts
	contacts = contacts.filter(
		(contact: any) => contact.state === beapi.messenger.Contact.State.Accepted,
	)

	return (
		<View>
			<View style={[padding.horizontal.large, padding.top.small, background.white]}>
				<View
					style={[padding.small, row.left, border.radius.medium, { backgroundColor: '#F7F8FF' }]}
				>
					<Icon
						name='search-outline'
						width={30}
						height={30}
						fill='#AFB1C0'
						style={row.item.justify}
					/>
					<TextInput
						style={[margin.left.small, row.item.justify, { color: '#AFB1C0' }]}
						placeholder='Search'
						placeholderTextColor='#AFB1C090'
						onChangeText={setSearchText}
						autoCorrect={false}
					/>
				</View>

				<ScrollView
					contentContainerStyle={[
						padding.top.medium,
						{
							paddingBottom,
						},
					]}
					showsVerticalScrollIndicator={false}
				>
					{contacts.map((contact, index) => (
						<AddMembersItem
							key={contact.publicKey}
							onSetMember={onSetMember}
							onRemoveMember={onRemoveMember}
							added={!!members.find((member) => member.publicKey === contact.publicKey)}
							contact={contact}
							separateBar={index < contacts.length - 1}
						/>
					))}
				</ScrollView>
				<FooterCreateGroup
					title='CONTINUE'
					icon='arrow-forward-outline'
					action={navigation.navigate.main.createGroup.createGroupFinalize}
				/>
			</View>
		</View>
	)
}

const MemberItem: React.FC<{ member: any; onRemove: () => void }> = ({ member, onRemove }) => {
	const [{ padding, column, text, color, row, maxWidth }] = useStyles()
	const _styles = useStylesCreateGroup()

	return (
		<View style={[padding.horizontal.medium, maxWidth(100)]}>
			<View style={[column.top, padding.top.small]}>
				<ContactAvatar size={70} publicKey={member.publicKey} />
				<TextNative
					numberOfLines={1}
					style={[
						text.color.white,
						column.item.center,
						padding.top.tiny,
						text.bold.medium,
						text.align.center,
					]}
				>
					{member.displayName}
				</TextNative>
			</View>
			<TouchableOpacity style={[_styles.memberItemDelete]} onPress={onRemove}>
				<Icon
					name='close-outline'
					width={20}
					height={20}
					fill={color.red}
					style={row.item.justify}
				/>
			</TouchableOpacity>
		</View>
	)
}

export const MemberList: React.FC<{
	members: any[]
	onRemoveMember: (id: string) => void
}> = ({ members, onRemoveMember }) => {
	const [{ height, padding }] = useStyles()

	return (
		<View style={[height(135)]}>
			<ScrollView
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[padding.left.medium]}
			>
				{members.map((member) => (
					<MemberItem member={member} onRemove={() => onRemoveMember(member.publicKey)} />
				))}
			</ScrollView>
		</View>
	)
}

export const CreateGroupHeader: React.FC<{}> = () => {
	const navigation = useNavigation()
	const [{ color, padding, margin }] = useStyles()
	return (
		<View
			style={[
				padding.medium,
				margin.bottom.small,
				{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				},
			]}
		>
			<View
				style={[
					{
						flexDirection: 'row',
						alignItems: 'center',
					},
				]}
			>
				<TouchableOpacity
					onPress={navigation.goBack}
					style={{ alignItems: 'center', justifyContent: 'center' }}
				>
					<Icon
						name='arrow-back-outline'
						width={_iconArrowBackSize}
						height={_iconArrowBackSize}
						fill={color.white}
					/>
				</TouchableOpacity>
				<Text
					style={{
						fontWeight: '700',
						fontSize: _titleSize,
						lineHeight: 1.25 * _titleSize,
						marginLeft: 10,
						color: color.white,
					}}
				>
					New Group
				</Text>
			</View>
			<Icon name='users' pack='custom' width={35} height={35} fill={color.white} />
		</View>
	)
}

const _iconArrowBackSize = 30
const _titleSize = 26

export const CreateGroupAddMembers: React.FC<{
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
	members: any[]
}> = ({ onSetMember, onRemoveMember, members }) => {
	const [{ flex, background, margin, color }] = useStyles()
	const [layout, setLayout] = useState<number>(0)
	const navigation = useNavigation()
	const insets = useSafeAreaInsets()

	return (
		<Layout style={[flex.tiny]}>
			<StatusBar backgroundColor={color.blue} barStyle='light-content' />
			<SwipeNavRecognizer
				onSwipeUp={() => navigation.goBack()}
				onSwipeDown={() => navigation.goBack()}
				onSwipeLeft={() => navigation.goBack()}
				onSwipeRight={() => navigation.goBack()}
			>
				<SafeAreaView style={[background.blue]}>
					<View onLayout={(e) => setLayout(e.nativeEvent.layout.height)}>
						<CreateGroupHeader />
						<MemberList members={members} onRemoveMember={onRemoveMember} />
					</View>
					<Header title='Add members' first style={[margin.bottom.scale(-1)]} />
					<AddMembers
						members={members}
						onSetMember={onSetMember}
						onRemoveMember={onRemoveMember}
						paddingBottom={240 + insets.bottom}
						layout={layout}
					/>
				</SafeAreaView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
