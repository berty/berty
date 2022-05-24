import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StatusBar, Platform } from 'react-native'

import Logo from '@berty/assets/logo/berty_gradient_square.svg'
import { PrimaryButton, SecondaryButton } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useAppSelector } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { selectEmbedded } from '@berty/redux/reducers/ui.reducer'
import { useNotificationsInhibitor, useThemeColor } from '@berty/store'
import { importAccountFromDocumentPicker } from '@berty/utils/accounts/accountBackup'
import { storageSet } from '@berty/utils/accounts/accountClient'
import { GlobalPersistentOptionsKeys } from '@berty/utils/persistent-options/types'

export const GetStarted: ScreenFC<'Onboarding.GetStarted'> = ({ navigation: { navigate } }) => {
	useNotificationsInhibitor(() => true)
	const { margin, padding, text } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const embedded = useAppSelector(selectEmbedded)

	return (
		<View
			style={[
				padding.medium,
				{ backgroundColor: colors['main-background'], flex: 1, justifyContent: 'center' },
			]}
		>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			<View style={[margin.bottom.big, { flexDirection: 'row', justifyContent: 'center' }]}>
				<Logo />
			</View>
			<View>
				<View>
					<UnifiedText
						style={[
							text.align.center,
							text.size.large,
							text.bold,
							{ color: colors['background-header'], textTransform: 'uppercase' },
						]}
					>
						{t('onboarding.getstarted.title')}
					</UnifiedText>
				</View>
				<View style={[margin.top.small]}>
					<UnifiedText style={[text.align.center, text.align.bottom, text.italic]}>
						{t('onboarding.getstarted.desc')}
					</UnifiedText>
				</View>
				<View style={{ marginHorizontal: 60 }}>
					<View style={[margin.top.huge]}>
						<PrimaryButton
							onPress={async () => {
								await storageSet(GlobalPersistentOptionsKeys.IsNewAccount, 'isNew')
								navigate('Onboarding.CreateAccount')
							}}
						>
							{t('onboarding.getstarted.create-button')}
						</PrimaryButton>
					</View>
					{Platform.OS !== 'web' && (
						<View style={[margin.top.small]}>
							<SecondaryButton
								onPress={async () => {
									await importAccountFromDocumentPicker(embedded)
								}}
							>
								{t('onboarding.getstarted.import-button')}
							</SecondaryButton>
						</View>
					)}
				</View>
			</View>
		</View>
	)
}
