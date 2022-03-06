import React from 'react'
import { ScrollView, View, Text } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'

import { ButtonSettingV2, Section } from '../shared-components'

export const ContactAndConversations: ScreenFC<'Settings.ContactAndConversations'> = () => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<Text style={{ textAlign: 'center' }}>Blah sur reset du QRCode</Text>
				<Section>
					<ButtonSettingV2
						text='Reset my contact link/QR Code'
						icon='bluetooth'
						toggle={{ enable: true }}
						disabled
					/>
					<ButtonSettingV2 text='Enabled incoming contact requests' icon='info' last disabled />
				</Section>
				<Section>
					<ButtonSettingV2 text='Find contacts' icon='bluetooth' last />
				</Section>
				<Section>
					<ButtonSettingV2 text='Store conversations on Berty nodes' icon='info' disabled />
					<ButtonSettingV2 text='List of replication provider' icon='info' disabled />
					<ButtonSettingV2 text='Replicate conversations automatically' icon='info' last disabled />
				</Section>
				<Section>
					<ButtonSettingV2 text='Export my conversations' icon='bluetooth' last />
				</Section>
				<Section>
					<ButtonSettingV2 text='Archived conversations' icon='bluetooth' />
					<ButtonSettingV2 text='Blocked contacts' icon='bluetooth' last />
				</Section>
			</ScrollView>
		</View>
	)
}
