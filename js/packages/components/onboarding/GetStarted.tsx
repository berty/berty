import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MessengerActions, useMsgrContext } from '@berty-tech/store/context'
import { useNotificationsInhibitor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import Logo from './berty_gradient_square.svg'
import Button from './Button'

export const GetStarted = () => {
	useNotificationsInhibitor(() => true)
	const [{ absolute, background, column, flex, padding, text }] = useStyles()
	const { dispatch } = useMsgrContext()

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
							{t('onboarding.getstarted.desc') as any}
						</Text>
					</View>
					<View style={[flex.medium]}>
						<Button
							style={column.item.center}
							textStyle={{ textTransform: 'uppercase' }}
							onPress={() => {
								dispatch({ type: MessengerActions.SetStateOnBoarding })
							}}
						>
							{t('onboarding.getstarted.button')}
						</Button>
					</View>
				</SafeAreaView>
			)}
		</Translation>
	)
}
