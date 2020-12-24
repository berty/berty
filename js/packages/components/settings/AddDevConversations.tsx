import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { useNavigation } from '@react-navigation/native'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

import { useStyles } from '@berty-tech/styles'
import { globals } from '@berty-tech/config'

type ValueOf<T> = T[keyof T]

type ValueType = (
	| ValueOf<typeof globals.berty.contacts>
	| ValueOf<typeof globals.berty.conversations>
) & { kind: string }

const uncap = (s: string) => s[0].toLowerCase() + s.slice(1)

const Button: React.FC<ValueType> = ({ kind: rawKind, name, link }) => {
	const { t } = useTranslation()
	const [{ color }] = useStyles()
	const navigation = useNavigation()

	const kind = uncap(rawKind)

	const text = t('settings.add-dev-conversations.tag-' + kind)
	console.log('kind', kind)
	let state
	switch (kind) {
		case 'bot':
			state = {
				value: text,
				color: color.yellow,
				bgColor: color.light.yellow,
			}
			break
		case 'contact':
			state = {
				value: text,
				color: color.blue,
				bgColor: color.light.blue,
			}
			break
		case 'conversation':
			state = {
				value: text,
				color: color.green,
				bgColor: color.light.green,
			}
			break
		default:
			state = {
				value: 'unknown',
				color: color.grey,
				bgColor: color.light.grey,
			}
	}

	return (
		<ButtonSetting
			name={t('settings.add-dev-conversations.add', { name: name })}
			icon='book-outline'
			iconSize={30}
			iconColor={color.dark.grey}
			actionIcon={null}
			state={state}
			onPress={() => {
				navigation.navigate('Tabs')
				navigation.navigate('ManageDeepLink', { type: 'link', value: link })
			}}
		/>
	)
}

const BodyAddContactList = () => {
	const [{ padding, flex, margin }] = useStyles()

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			{Object.values(globals.berty.contacts).map((value) => {
				return <Button key={value.link} {...value} />
			})}
			{Object.values(globals.berty.conversations).map((value) => {
				return <Button key={value.link} {...value} kind='Conversation' />
			})}
		</View>
	)
}

export const AddDevConversations = () => {
	const { t } = useTranslation()
	const [{ color, padding, flex, background }] = useStyles()
	const { goBack } = useNavigation()

	return (
		<Layout style={[background.white, flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
					<HeaderSettings
						title={t('settings.add-dev-conversations.title')}
						bgColor={color.dark.grey}
						undo={goBack}
					/>
					<BodyAddContactList />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
