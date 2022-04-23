import React from 'react'
import { ScrollView, View } from 'react-native'

import { ScreenFC } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

import { ButtonSettingV2, Section } from '@berty/components/shared-components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const Notifications: ScreenFC<'Settings.Notifications'> = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				{/* TODO i18n */}
				<Section>
					<ButtonSettingV2 text='Enable globally for account' toggle={{ enable: true }} disabled />
					<ButtonSettingV2 text='Mute globally' last disabled />
				</Section>
				<Section>
					<ButtonSettingV2 text='Display while using app' last />
				</Section>
				<Section>
					<ButtonSettingV2 text='Hide notifications previews' disabled />
					<ButtonSettingV2 text='Hide names/conersation titles in notifications' last disabled />
				</Section>
			</ScrollView>
		</View>
	)
}
