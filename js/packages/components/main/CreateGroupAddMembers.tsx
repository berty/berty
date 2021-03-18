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

import beapi from '@berty-tech/api'

import { FooterCreateGroup } from './CreateGroupFooter'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { ContactAvatar } from '../avatars'
import { useTranslation } from 'react-i18next'

// Styles
const useStylesCreateGroup = () => {
	const [{ border }] = useStyles()
	return {
		separateBar: [border.scale(0.6), border.color.light.grey], // opacity
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
		{ scaleHeight },
	] = useStyles()
	return (
		<View style={[!first && background.white]}>
			<TouchableWithoutFeedback onPress={onPress}>
				<View
					style={[
						background.white,
						border.radius.top.scale(30),
						!first && border.shadow.big,
						disabled && opacity(0.5),
						style,
					]}
				>
					<View style={[height(90)]}>
						<View
							style={[
								margin.top.medium,
								row.item.justify,
								border.scale(2.5),
								border.color.light.grey,
								border.radius.scale(4),
								{
									backgroundColor: '#E8E9FC',
									width: 60 * scaleHeight,
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
	const [{ row, margin, padding }, { scaleSize }] = useStyles()
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
					<ContactAvatar size={50 * scaleSize} publicKey={contact.publicKey} />
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

const AddMembers: React.FC<AddMembersProps> = ({ onSetMember, onRemoveMember, members }) => {
	const [{ padding, background, row, margin, border }, { scaleHeight, scaleSize }] = useStyles()
	const [searchText, setSearchText] = useState('')
	const searchContacts = useAccountContactSearchResults(searchText)
	const accountContacts = useContactList()
	const { t }: { t: any } = useTranslation()
	let contacts = searchText.length ? searchContacts : accountContacts
	contacts = contacts.filter(
		(contact: any) => contact.state === beapi.messenger.Contact.State.Accepted,
	)

	return (
		<View style={[padding.horizontal.large, padding.top.small, background.white, { flex: 1 }]}>
			<View
				style={[
					padding.small,
					row.left,
					border.radius.medium,
					{ backgroundColor: '#F7F8FF', alignItems: 'center' },
				]}
			>
				<Icon
					name='search-outline'
					width={30 * scaleHeight}
					height={30 * scaleHeight}
					fill='#AFB1C0'
					style={row.item.justify}
				/>
				<TextInput
					style={[
						margin.left.small,
						{
							color: '#AFB1C0',
							paddingVertical: 8 * scaleHeight,
							flex: 1,
						},
					]}
					placeholder={t('main.home.create-group.search-placeholder')}
					placeholderTextColor='#AFB1C090'
					onChangeText={setSearchText}
					autoCorrect={false}
				/>
			</View>

			<ScrollView
				contentContainerStyle={[padding.top.medium, { paddingBottom: 75 * scaleSize }]}
				style={[margin.top.small, { flex: 1 }]}
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
		</View>
	)
}

const MemberItem: React.FC<{ member: any; onRemove: () => void }> = ({ member, onRemove }) => {
	const [
		{ padding, column, text, color, row, maxWidth, border, background },
		{ scaleSize },
	] = useStyles()

	return (
		<View style={[padding.horizontal.medium, maxWidth(100)]}>
			<View style={[column.top, padding.top.small]}>
				<ContactAvatar size={70 * scaleSize} publicKey={member.publicKey} />
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
			<TouchableOpacity
				style={[
					border.shadow.medium,
					border.radius.medium,
					background.white,
					column.justify,
					{
						height: 25 * scaleSize,
						width: 25 * scaleSize,
						position: 'absolute',
						top: 5 * scaleSize,
						right: 9 * scaleSize,
					},
				]}
				onPress={onRemove}
			>
				<Icon
					name='close-outline'
					width={20 * scaleSize}
					height={20 * scaleSize}
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
	const [{ padding }] = useStyles()

	return (
		<View style={{ height: 135 }}>
			<ScrollView
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[padding.left.medium]}
			>
				{members.map((member) => (
					<MemberItem
						key={member.publicKey}
						member={member}
						onRemove={() => onRemoveMember(member.publicKey)}
					/>
				))}
			</ScrollView>
		</View>
	)
}

export const CreateGroupHeader: React.FC<{}> = () => {
	const navigation = useNavigation()
	const [{ color, padding, margin, text }, { scaleSize }] = useStyles()
	const { t }: { t: any } = useTranslation()
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
					style={{
						padding: 7,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Icon
						name='arrow-back-outline'
						width={_iconArrowBackSize * scaleSize}
						height={_iconArrowBackSize * scaleSize}
						fill={color.white}
					/>
				</TouchableOpacity>
				<Text
					style={[
						text.size.huge,
						{
							fontWeight: '700',
							lineHeight: 1.25 * _titleSize,
							marginLeft: 10,
							color: color.white,
						},
					]}
				>
					{t('main.home.create-group.title')}
				</Text>
			</View>
			<Icon
				name='users'
				pack='custom'
				width={35 * scaleSize}
				height={35 * scaleSize}
				fill={color.white}
			/>
		</View>
	)
}

const _iconArrowBackSize = 30
const _titleSize = 25

export const CreateGroupAddMembers: React.FC<{
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
	members: any[]
}> = ({ onSetMember, onRemoveMember, members }) => {
	const [{ flex, background, margin, color }, { scaleHeight }] = useStyles()
	const navigation = useNavigation()
	const { t }: { t: any } = useTranslation()

	return (
		<Layout style={[flex.tiny]}>
			<StatusBar backgroundColor={color.blue} barStyle='light-content' />
			<SwipeNavRecognizer onSwipeRight={() => navigation.goBack()}>
				<SafeAreaView style={[background.blue]}>
					<CreateGroupHeader />
					<MemberList members={members} onRemoveMember={onRemoveMember} />
				</SafeAreaView>
				<View style={[background.white, { flex: 1 }]}>
					<View style={{ top: -30 * scaleHeight, flex: 1 }}>
						<Header
							title={t('main.home.create-group.add-members')}
							first
							style={[margin.bottom.scale(-1)]}
						/>
						<AddMembers
							members={members}
							onSetMember={onSetMember}
							onRemoveMember={onRemoveMember}
						/>
					</View>
				</View>
			</SwipeNavRecognizer>
			<FooterCreateGroup
				title={t('main.home.create-group.continue')}
				icon='arrow-forward-outline'
				action={navigation.navigate.main.createGroup.createGroupFinalize}
			/>
		</Layout>
	)
}
