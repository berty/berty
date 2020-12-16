import React, { useState } from 'react'
import { View, TouchableOpacity, TextInput, Text as TextNative } from 'react-native'
import { Buffer } from 'buffer'
import { Text, Icon } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { TabBar } from '../shared-components/TabBar'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import InvalidScan from './InvalidScan'
import messengerMethodsHooks from '@berty-tech/store/methods'

const useStylesModal = () => {
	const [{ width, border, height, opacity }] = useStyles()
	return {
		closeRequest: [width(45), height(45), border.radius.scale(22.5)],
		closeRequestIcon: opacity(0.5),
	}
}

const BodyAddThisContactContent: React.FC<{}> = ({ children }) => {
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

const AddThisContact: React.FC<{
	displayName: string
	publicKey: string
	link: string
	type: string
	isPassword: boolean
}> = ({ displayName, publicKey, link, type, isPassword }) => {
	const [
		{ row, text, column, color, flex, absolute, padding, background, border, margin },
	] = useStyles()
	const navigation = useNavigation()
	const { call: requestContact, error, done } = messengerMethodsHooks.useContactRequest()
	const [selectedContent, setSelectedContent] = useState('Fingerprint')
	const _styles = useStylesModal()
	const { t } = useTranslation()

	const [password, setPassword] = useState('')

	// TODO: handle error (shouldn't happen since we checked the link previously, but still)

	React.useEffect(() => {
		if (done && !error) {
			// navigation.goBack()
			navigation.navigate('Tabs')
		}
	}, [done, error, navigation])

	if (error) {
		let title
		if (type === 'link') {
			title = t('modals.manage-deep-link.invalid-link')
		} else if (type === 'qr') {
			title = t('modals.manage-deep-link.invalid-qr')
		} else {
			title = t('modals.manage-deep-link.error')
		}
		return <InvalidScan title={title} error={error.toString()} />
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
					<ProceduralCircleAvatar
						seed={publicKey}
						style={[border.shadow.big, row.center]}
						diffSize={30}
					/>
				</View>
				<View style={[padding.top.scale(55)]}>
					<Text style={{ textAlign: 'center' }}>{displayName}</Text>
					<TabBar
						tabs={[
							{
								name: t('modals.add-this-contact.fingerprint'),
								icon: 'fingerprint',
								iconPack: 'custom',
							} as any, // TODO: fix typing
							{
								name: t('modals.add-this-contact.info'),
								icon: 'info-outline',
								buttonDisabled: true,
							},
							{
								name: t('modals.add-this-contact.devices'),
								icon: 'smartphone',
								iconSize: 20,
								iconPack: 'feather',
								iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
								buttonDisabled: true,
							} as any, // TODO: fix typing
						]}
						onTabChange={setSelectedContent}
					/>
					<BodyAddThisContactContent>
						<SelectedContent
							contentName={selectedContent}
							pubKey={publicKey}
							isEncrypted={isPassword}
						/>
					</BodyAddThisContactContent>
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
								Enter the contact password
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
								style={[{ fontFamily: 'Open Sans' }, text.bold.small]}
								placeholder='Password...'
							/>
						</View>
					</View>
				) : null}
				<View style={[row.fill, padding.medium]}>
					<TouchableOpacity
						onPress={() => {
							isPassword
								? requestContact({ link, passphrase: Buffer.from(password) })
								: requestContact({ link })
						}}
						style={[
							flex.medium,
							background.light.blue,
							padding.vertical.scale(12),
							border.radius.small,
						]}
					>
						<Text style={[text.color.blue, { textAlign: 'center' }]}>ADD THIS CONTACT</Text>
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

export default AddThisContact
