import React from 'react'
import { ScrollView, View } from 'react-native'

import { ScreenFC } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

import { ButtonSettingV2, Section } from '@berty/components/shared-components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const Security: ScreenFC<'Settings.Security'> = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<Section>
					{/* TODO i18n */}
					<ButtonSettingV2 text='TouchID/FaceID before open account' disabled />
					<ButtonSettingV2 text='Password' disabled last />
				</Section>
			</ScrollView>
		</View>
	)
}
