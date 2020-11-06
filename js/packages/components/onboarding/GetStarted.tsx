import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'

import { MessengerActions, useMsgrContext } from '@berty-tech/store/context'
import Logo from './berty_gradient_square.svg'
import Button from './Button'

export const GetStarted = () => {
	const [{ absolute, background, column, flex, padding, text, margin, color }] = useStyles()
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
							{t('onboarding.getstarted-intro')}
						</Text>
					</View>
					<View style={[flex.medium]}>
						<Button
							style={column.item.center}
							textStyle={{ textTransform: 'uppercase' }}
							onPress={() => dispatch({ type: MessengerActions.SetStateOnBoarding })}
						>
							{t('onboarding.getstarted-button')}
						</Button>
						<Text
							style={[
								column.item.center,
								padding.horizontal.big,
								margin.top.medium,
								padding.medium,
								{
									textTransform: 'uppercase',
									fontWeight: 'normal',
									color: color.grey,
								},
							]}
							onPress={() => {
								dispatch({ type: MessengerActions.SetStateDeleting })
							}}
						>
							{t('onboarding.getstarted-more-options')}
						</Text>
					</View>
				</SafeAreaView>
			)}
		</Translation>
	)
}
