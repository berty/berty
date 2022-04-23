import React from 'react'
import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { ScreenFC } from '@berty/navigation'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { exportAccountToFile, useThemeColor } from '@berty/store'

import { ButtonSettingV2, Section } from '@berty/components/shared-components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const ContactAndConversations: ScreenFC<'Settings.ContactAndConversations'> = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const selectedAccount = useSelector(selectSelectedAccount)

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
						toggle={{ enable: true }}
						disabled
					/>
					<ButtonSettingV2 text={t('settings.contact-convs.request-button')} last disabled />
				</Section>
				{/* TODO i18n */}
				<Section>
					<ButtonSettingV2 text='Find contacts' last />
				</Section>
				<Section>
					<ButtonSettingV2 text='Store conversations on Berty nodes' disabled />
					<ButtonSettingV2 text='List of replication provider' disabled />
					<ButtonSettingV2 text='Replicate conversations automatically' last disabled />
				</Section>
				<Section>
					<ButtonSettingV2
						text='Export my conversations'
						last
						onPress={() => exportAccountToFile(selectedAccount)}
					/>
				</Section>
				<Section>
					<ButtonSettingV2 text='Archived conversations' />
					<ButtonSettingV2 text='Blocked contacts' last />
				</Section>
			</ScrollView>
		</View>
	)
}
