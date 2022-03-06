import React from 'react'
import { ScrollView, View } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'

import { ButtonSettingV2, Section } from '../shared-components'

export const Notifications: ScreenFC<'Settings.Notifications'> = () => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<Section>
					<ButtonSettingV2
						text='Enable globally for account'
						icon='bluetooth'
						toggle={{ enable: true }}
						disabled
					/>
					<ButtonSettingV2 text='Mute globally' icon='info' last disabled />
				</Section>
				<Section>
					<ButtonSettingV2 text='Display while using app' icon='bluetooth' last />
				</Section>
				<Section>
					<ButtonSettingV2 text='Hide notifications previews' icon='info' disabled />
					<ButtonSettingV2
						text='Hide names/conersation titles in notifications'
						icon='info'
						last
						disabled
					/>
				</Section>
			</ScrollView>
		</View>
	)
}
