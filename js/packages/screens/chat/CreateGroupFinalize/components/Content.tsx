import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { SecondaryButton, SmallInput } from '@berty/components'
import { usePlaySound } from '@berty/hooks'

import { About } from './About'
import { HeaderTitle } from './HeaderTitle'
import { IconWrapper } from './IconWrapper'
import { SwipeBar } from './SwipeBar'

interface ContentProps {
	loading: boolean
	createGroup: (groupName: string) => void
}

export function Content(props: ContentProps): JSX.Element {
	const { t } = useTranslation()
	const playSound = usePlaySound()

	const [groupName, setGroupName] = useState('New group')

	return (
		<View style={styles.container}>
			<SwipeBar />

			<View style={styles.main}>
				<HeaderTitle title={t('main.home.create-group.group-info')} />

				<View style={styles.content}>
					<IconWrapper />

					<View style={styles.inputWrapper}>
						<SmallInput
							testID={t('main.home.create-group-finalize.placeholder')}
							value={groupName}
							onChangeText={setGroupName}
							placeholder={t('main.home.create-group-finalize.placeholder')}
							autoCorrect={false}
						/>
					</View>
				</View>

				<About />

				<View style={styles.buttonWrapper}>
					<SecondaryButton
						testID={t('main.home.create-group.create-group')}
						loading={props.loading}
						onPress={() => {
							props.createGroup(groupName)
							playSound('groupCreated')
						}}
					>
						{t('main.home.create-group.create-group')}
					</SecondaryButton>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		shadowOpacity: 0.2,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 1 },
		shadowColor: 'black',
		elevation: 5,
	},
	main: {
		paddingTop: 25,
		paddingBottom: '40%',
	},
	content: {
		paddingTop: 18,
		marginLeft: 20,
		paddingRight: 24,
		paddingBottom: 38,
		flexDirection: 'row',
		alignItems: 'center',
	},
	inputWrapper: {
		flex: 1,
		marginLeft: 16,
	},
	buttonWrapper: {
		paddingHorizontal: 38,
		paddingTop: 36,
	},
})
