import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@react-navigation/native'

import Logo from './berty_gradient_square.svg'
import Button from './Button'

export const GetStarted = () => {
	const { navigate } = useNavigation()
	const [{ absolute, background, column, flex, padding, text }] = useStyles()
	return (
		<Translation>
			{(t) => (
				<SafeAreaView style={[absolute.fill, background.white, column.justify, padding.medium]}>
					<View style={[flex.medium]} />
					<View style={[flex.big, { flexDirection: 'row', justifyContent: 'center' }]}>
						<Logo height='60%' width='65%' />
					</View>
					<View style={[flex.medium]}>
						<Text style={[padding.horizontal.medium, text.align.center, text.align.bottom]}>
							{t('onboarding.getstarted.desc')}
						</Text>
					</View>
					<View style={[flex.medium]}>
						<Button style={column.item.center} onPress={() => navigate('Onboarding.CreateAccount')}>
							{t('onboarding.getstarted.button')}
						</Button>
					</View>
				</SafeAreaView>
			)}
		</Translation>
	)
}
