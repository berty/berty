import React, { useState } from 'react'
import { View, TouchableOpacity, TextInput, Text as TextNative } from 'react-native'
import { Buffer } from 'buffer'
import { Text, Icon } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { TabBar } from '../shared-components/TabBar'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import InvalidScan from './InvalidScan'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { MultiMemberAvatar } from '../avatars'

const useStylesModal = () => {
	const [{ width, border, height, opacity }] = useStyles()
	return {
		closeRequest: [width(45), height(45), border.radius.scale(22.5)],
		closeRequestIcon: opacity(0.5),
	}
}

const BodyManageGroupInvitationContent: React.FC<{}> = ({ children }) => {
	const [{ margin }] = useStyles()
	return (
		<View style={[margin.top.big]}>
			<View>{children}</View>
		</View>
	)
}

const SelectedContent = ({
	contentName,
	pubKey,
	isEncrypted,
}: {
	contentName: string
	pubKey: string
	isEncrypted: boolean
}) => {
	const [{ padding }] = useStyles()
	switch (contentName) {
		case 'Fingerprint':
			return <FingerprintContent seed={pubKey} isEncrypted={isEncrypted} />
		default:
			return (
				<Text style={[padding.horizontal.medium]}>Error: Unknown content name "{contentName}"</Text>
			)
	}
}

export const ManageGroupInvitation: React.FC<{
	link: string
	displayName: string
	publicKey: string
	type: string
	isPassword: boolean
}> = ({ link, type, displayName, publicKey, isPassword }) => {
	const navigation = useNavigation()
	const { call: joinConversation, done, error } = messengerMethodsHooks.useConversationJoin()
	const [
		{ row, text, column, color, flex, absolute, padding, background, border, margin },
	] = useStyles()
	const [selectedContent, setSelectedContent] = useState('Fingerprint')
	const _styles = useStylesModal()
	const { t } = useTranslation()

	const [password, setPassword] = useState('')

	// TODO: handle error (shouldn't happen since we checked the link previously, but still)

	React.useEffect(() => {
		if (done && !error) {
			navigation.goBack()
			navigation.navigate('Main.Home')
		}
	}, [done, error, navigation])

	if (error) {
		return <InvalidScan type={type} error={error} />
	}

	return (
		<View
			style={[{ justifyContent: 'center', alignItems: 'center', height: '100%' }, padding.medium]}
		>
			<View
				style={[
					background.white,
					padding.horizontal.medium,
					padding.bottom.medium,
					border.radius.large,
					{ width: '100%' },
				]}
			>
				<View style={[absolute.scale({ top: -50 }), row.item.justify]}>
					<MultiMemberAvatar
						publicKey={publicKey}
						style={[border.shadow.big, row.center] as any}
						size={100}
					/>
				</View>
				<View style={[padding.top.scale(55)]}>
					<Text style={{ textAlign: 'center' }}>{displayName}</Text>
					<TabBar
						tabs={[
							{
								key: 'fingerprint',
								name: t('modals.group-invitation.fingerprint'),
								icon: 'fingerprint',
								iconPack: 'custom',
							},
							{
								key: 'info',
								name: t('modals.group-invitation.info'),
								icon: 'info-outline',
								buttonDisabled: true,
							},
							{
								key: 'devices',
								name: t('modals.group-invitation.devices'),
								icon: 'smartphone',
								iconPack: 'feather',
								iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
								buttonDisabled: true,
							},
						]}
						onTabChange={setSelectedContent}
					/>
					<BodyManageGroupInvitationContent>
						<SelectedContent
							contentName={selectedContent}
							pubKey={publicKey}
							isEncrypted={isPassword}
						/>
					</BodyManageGroupInvitationContent>
				</View>
				{isPassword ? (
					<View>
						<View
							style={[
								{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
								margin.top.medium,
							]}
						>
							<Icon name='info-outline' fill={color.blue} width={15} height={15} />
							<TextNative
								style={[
									{ fontFamily: 'Open Sans', color: color.blue, paddingLeft: 5, fontSize: 13 },
									text.align.center,
									text.bold.small,
								]}
							>
								Enter the group password
							</TextNative>
						</View>
						<View
							style={[
								border.radius.small,
								padding.small,
								margin.top.medium,
								row.fill,
								padding.vertical.scale(12),
								{ backgroundColor: '#E8E9FC99' },
							]}
						>
							<TextInput
								value={password}
								secureTextEntry={true}
								onChangeText={setPassword}
								autoCapitalize='none'
								editable={true}
								style={[{ fontFamily: 'Open Sans' }, text.bold.small, { width: '100%' }]}
								placeholder='Password...'
							/>
						</View>
					</View>
				) : null}
				<View style={[padding.top.big, row.fill, padding.medium]}>
					<TouchableOpacity
						onPress={() => {
							isPassword
								? joinConversation({ link, passphrase: Buffer.from(password) })
								: joinConversation({ link })
						}}
						style={[
							flex.medium,
							background.light.blue,
							padding.vertical.scale(12),
							border.radius.small,
						]}
					>
						<Text style={[text.color.blue, { textAlign: 'center' }]}>JOIN THIS GROUP</Text>
					</TouchableOpacity>
				</View>
			</View>
			<TouchableOpacity
				style={[
					background.white,
					padding.vertical.medium,
					border.shadow.medium,
					row.item.justify,
					column.justify,
					_styles.closeRequest,
					{ position: 'absolute', bottom: '2%' },
				]}
				onPress={navigation.goBack}
			>
				<Icon
					style={[row.item.justify, _styles.closeRequestIcon]}
					name='close-outline'
					width={25}
					height={25}
					fill={color.grey}
				/>
			</TouchableOpacity>
		</View>
	)
}

export default ManageGroupInvitation
