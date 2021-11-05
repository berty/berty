import React from 'react'
import { View, StatusBar } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import {
	storageSet,
	GlobalPersistentOptionsKeys,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { ScreenFC } from '@berty-tech/navigation'

import Logo from './berty_gradient_square.svg'
import Button from './Button'

export const GetStarted: ScreenFC<'Onboarding.GetStarted'> = ({ navigation: { navigate } }) => {
	useNotificationsInhibitor(() => true)
	const [{ column, margin, padding, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	return (
		<View
			style={[
				padding.medium,
				{ backgroundColor: colors['main-background'], flex: 1, justifyContent: 'center' },
			]}
		>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			{/* <View style={[flex.medium]} /> */}
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
						style={{
							...column.item.center,
							backgroundColor: colors['background-header'],
							paddingHorizontal: 70 * scaleSize,
						}}
						textStyle={{ textTransform: 'uppercase', color: colors['reverted-main-text'] }}
						onPress={async () => {
							await storageSet(GlobalPersistentOptionsKeys.IsNewAccount, 'isNew')
							navigate('Onboarding.CreateAccount')
						}}
					>
						{t('onboarding.getstarted.button')}
					</Button>
				</View>
			</View>
		</View>
	)
}
