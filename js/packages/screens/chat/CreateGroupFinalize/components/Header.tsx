import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

import { useNavigation } from '@berty/navigation'

import { HeaderTitle } from './HeaderTitle'
import { SwipeBar } from './SwipeBar'

export function Header(): JSX.Element {
	const { goBack } = useNavigation()

	const { t } = useTranslation()

	return (
		<TouchableWithoutFeedback onPress={goBack}>
			<>
				<SwipeBar />
				<View style={styles.content}>
					<HeaderTitle title={t('main.home.create-group.add-members')} />
				</View>
			</>
		</TouchableWithoutFeedback>
	)
}

const styles = StyleSheet.create({
	content: {
		paddingVertical: 25,
	},
})
