import React from 'react'
import { ScrollView, View } from 'react-native'

import { useStyles } from '@berty/styles'
import { ScreenFC } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

import { ButtonSettingV2, Section } from '../shared-components'

export const DevicesAndBackup: ScreenFC<'Settings.DevicesAndBackup'> = () => {
	const [{}, { scaleSize }] = useStyles()
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
					<ButtonSettingV2 text='Link device' disabled />
					<ButtonSettingV2 text='Configure your node' disabled />
				</Section>
			</ScrollView>
		</View>
	)
}
