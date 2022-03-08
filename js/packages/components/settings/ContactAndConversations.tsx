import React from 'react'
import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'

import { ButtonSettingV2, Section } from '../shared-components'

export const ContactAndConversations: ScreenFC<'Settings.ContactAndConversations'> = () => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<Section>
					<ButtonSettingV2
						text={t('settings.contact-convs.reset-button')}
						icon='bluetooth'
						toggle={{ enable: true }}
						disabled
					/>
					<ButtonSettingV2
						text={t('settings.contact-convs.request-button')}
						icon='info'
						last
						disabled
					/>
				</Section>
				{/* TODO i18n */}
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
