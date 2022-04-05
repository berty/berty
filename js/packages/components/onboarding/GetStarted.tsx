import React from 'react'
import { View, StatusBar } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useNotificationsInhibitor, useThemeColor, useMessengerContext } from '@berty/store'
import { useStyles } from '@berty/styles'
import { ScreenFC } from '@berty/navigation'

import Logo from './berty_gradient_square.svg'
import Button from './Button'
import { importAccountFromDocumentPicker } from '../pickerUtils'
import { UnifiedText } from '../shared-components/UnifiedText'

export const GetStarted: ScreenFC<'Onboarding.GetStarted'> = ({ navigation: { navigate } }) => {
	useNotificationsInhibitor(() => true)
	const [{ margin, padding, text }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const ctx = useMessengerContext()

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
							{ color: colors['background-header'] },
						]}
					>
						{t('onboarding.getstarted.title') as any}
					</UnifiedText>
				</View>
				<View style={[margin.top.small]}>
					<UnifiedText
						style={[padding.horizontal.medium, text.align.center, text.align.bottom, text.italic]}
					>
						{t('onboarding.getstarted.desc') as any}
					</UnifiedText>
				</View>
				<View style={[margin.top.big]}>
					<Button
						onPress={async () => {
							navigate('Onboarding.CreateAccount')
						}}
					>
						{t('onboarding.getstarted.create-button') as any}
					</Button>
					<Button
						status='secondary'
						onPress={async () => {
							importAccountFromDocumentPicker(ctx)
						}}
					>
						{t('onboarding.getstarted.import-button') as any}
					</Button>
					{/*
					<Button status='secondary' onPress={() => {}}>
						{t('onboarding.getstarted.link-button') as any}
					</Button>
					*/}
				</View>
			</View>
		</View>
	)
}
