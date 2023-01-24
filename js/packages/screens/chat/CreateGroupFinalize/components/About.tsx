import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { ButtonSettingItem } from '@berty/components/shared-components/SettingsButtons'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

export function About(): JSX.Element {
	const { t } = useTranslation()
	const { row } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={styles.infosContainer}>
			<View style={styles.aboutWrapper}>
				<Icon
					name='info-outline'
					height={20}
					width={20}
					fill={colors['background-header']}
					style={row.item.justify}
				/>
				<UnifiedText style={styles.aboutText}>
					{t('main.home.create-group-finalize.about')}
				</UnifiedText>
			</View>

			<ButtonSettingItem
				value={t('main.home.create-group-finalize.first-bullet-point')}
				color='#393C63'
				iconColor='#8A91EF'
			/>
			<ButtonSettingItem
				value={t('main.home.create-group-finalize.second-bullet-point')}
				color='#393C63'
				iconColor='#8A91EF'
			/>
			<ButtonSettingItem
				value={t('main.home.create-group-finalize.third-bullet-point')}
				color='#393C63'
				iconColor='#8A91EF'
			/>
			<ButtonSettingItem
				value={t('main.home.create-group-finalize.fourth-bullet-point')}
				color='#393C63'
				icon='close-circle'
				iconColor='#E35179'
			/>
			<ButtonSettingItem
				value={t('main.home.create-group-finalize.fifth-bullet-point')}
				color='#393C63'
				icon='close-circle'
				iconColor='#E35179'
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	infosContainer: {
		paddingHorizontal: 38,
	},
	aboutWrapper: {
		flexDirection: 'row',
		paddingBottom: 18,
	},
	aboutText: {
		fontSize: 13,
		marginLeft: 20,
	},
})
