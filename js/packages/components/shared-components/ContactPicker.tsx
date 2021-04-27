import React, { useState } from 'react'
import { useStyles } from '@berty-tech/styles'
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { ContactAvatar } from '@berty-tech/components/avatars'
import { CheckBox, Icon, Text } from '@ui-kitten/components'
import { useAccountContactSearchResults } from '@berty-tech/store/hooks'
import { useTranslation } from 'react-i18next'
import beapi from '@berty-tech/api'

// Styles
const useStylesCreateGroup = () => {
	const [{ border }] = useStyles()
	return {
		separateBar: [border.scale(0.6), border.color.light.grey],
	}
}

// Type
type ContactPickerProps = {
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
	members: any[]
	accountContacts: beapi.messenger.IContact[]
}

type ContactItemProps = {
	separateBar?: boolean
	contact: any
	added: boolean
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
}

const ContactItem: React.FC<ContactItemProps> = ({
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

export const ContactPicker: React.FC<ContactPickerProps> = ({
	onSetMember,
	onRemoveMember,
	members,
	accountContacts,
}) => {
	const [{ padding, background, row, margin, border }, { scaleHeight, scaleSize }] = useStyles()
	const [searchText, setSearchText] = useState('')
	const searchContacts = useAccountContactSearchResults(searchText)
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
					<ContactItem
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
