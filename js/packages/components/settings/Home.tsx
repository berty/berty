import React from 'react'
import { ScrollView, TouchableOpacity, View, Text } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'
import { useAccount } from '@berty-tech/react-redux'

import { AccountAvatar } from '../avatars'
import { ButtonSettingV2, Section } from '../shared-components'

const ProfileButton: React.FC<{}> = () => {
	const [{ padding, margin, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const account = useAccount()
	const { navigate } = useNavigation()

	return (
		<View
			style={[
				margin.horizontal.medium,
				padding.medium,
				border.radius.medium,
				{
					flex: 1,
					backgroundColor: colors['main-background'],
				},
			]}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<AccountAvatar size={50 * scaleSize} />
					<Text style={[padding.left.medium, { fontFamily: 'Open Sans', fontWeight: '600' }]}>
						{account.displayName || ''}
					</Text>
				</View>
				<TouchableOpacity
					style={[
						padding.scale(8),
						border.radius.scale(100),
						{
							backgroundColor: '#EDEDED',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
						},
					]}
					onPress={() => navigate('Settings.MyBertyId')}
				>
					<Icon
						name='qr'
						pack='custom'
						fill={colors['background-header']}
						width={20 * scaleSize}
						height={20 * scaleSize}
					/>
				</TouchableOpacity>
			</View>
		</View>
	)
}

export const Home: ScreenFC<'Settings.Home'> = () => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { navigate } = useNavigation()

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1, paddingTop: 20 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<ProfileButton />
				<Section>
					<ButtonSettingV2 text='Connect around me' icon='bluetooth' toggle={{ enable: true }} />
					<ButtonSettingV2
						text='Notifications'
						icon='bell'
						onPress={() => navigate('Settings.Notifications')}
					/>
					<ButtonSettingV2
						text='Contact and conversations'
						icon='message-circle'
						onPress={() => navigate('Settings.ContactAndConversations')}
					/>
					<ButtonSettingV2
						text='Appearence'
						icon='smile'
						onPress={() => navigate('Settings.Appearence')}
					/>
					<ButtonSettingV2
						text='Devices and backup'
						icon='smartphone'
						onPress={() => navigate('Settings.DevicesAndBackup')}
						last
					/>
				</Section>
				<Section>
					<ButtonSettingV2
						text='Security'
						icon='lock'
						onPress={() => navigate('Settings.Security')}
					/>
					<ButtonSettingV2
						text='Accounts'
						icon='user'
						onPress={() => navigate('Settings.Accounts')}
					/>
					<ButtonSettingV2
						text='Network'
						icon='wifi'
						last
						onPress={() => navigate('Settings.Network')}
					/>
				</Section>
				<Section>
					<ButtonSettingV2
						text='About Berty'
						icon='info'
						last
						onPress={() => navigate('Settings.AboutBerty')}
					/>
				</Section>
			</ScrollView>
		</View>
	)
}
