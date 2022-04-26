import React from 'react'
import { View, StatusBar, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'

import {
	storageSet,
	GlobalPersistentOptionsKeys,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { ScreenFC } from '@berty/navigation'

import Logo from '@berty/assets/logo/berty_gradient_square.svg'
import Button from '@berty/components/onboarding/Button'
import { importAccountFromDocumentPicker } from '@berty/components/pickerUtils'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppSelector } from '@berty/hooks'
import { selectEmbedded } from '@berty/redux/reducers/ui.reducer'

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
							padding.horizontal.medium,
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
					<UnifiedText
						style={[padding.horizontal.medium, text.align.center, text.align.bottom, text.italic]}
					>
						{t('onboarding.getstarted.desc')}
					</UnifiedText>
				</View>
				<View style={[margin.top.big]}>
					<Button
						onPress={async () => {
							await storageSet(GlobalPersistentOptionsKeys.IsNewAccount, 'isNew')
							navigate('Onboarding.CreateAccount')
						}}
					>
						{t('onboarding.getstarted.create-button')}
					</Button>
					{Platform.OS !== 'web' && (
						<Button
							status='secondary'
							onPress={async () => {
								await importAccountFromDocumentPicker(embedded)
							}}
						>
							{t('onboarding.getstarted.import-button')}
						</Button>
					)}
					{/*
					<Button status='secondary' onPress={() => {}}>
						{t('onboarding.getstarted.link-button')}
					</Button>
					*/}
				</View>
			</View>
		</View>
	)
}
