import React from 'react'
import { View, StatusBar } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import {
	storageSet,
	GlobalPersistentOptionsKeys,
	useNotificationsInhibitor,
	useThemeColor,
	useMessengerContext,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { ScreenFC } from '@berty-tech/navigation'

import Logo from './berty_gradient_square.svg'
import Button from './Button'
import { importAccountFromDocumentPicker } from '../pickerUtils'

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
					<Text
						style={[
							padding.horizontal.medium,
							text.align.center,
							text.align.bottom,
							text.size.large,
							{
								fontWeight: '700',
								color: colors['background-header'],
							},
						]}
					>
						{t('onboarding.getstarted.title') as any}
					</Text>
				</View>
				<View style={[margin.top.small]}>
					<Text
						style={[
							padding.horizontal.medium,
							text.align.center,
							text.align.bottom,
							{
								fontStyle: 'italic',
								fontWeight: '400',
								color: colors['main-text'],
							},
						]}
					>
						{t('onboarding.getstarted.desc') as any}
					</Text>
				</View>
				<View style={[margin.top.big]}>
					<Button
						onPress={async () => {
							await storageSet(GlobalPersistentOptionsKeys.IsNewAccount, 'isNew')
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
