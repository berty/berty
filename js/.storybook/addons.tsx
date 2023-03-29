import React from 'react'
import addons from '@storybook/addons'
import i18next from 'i18next'
import { languages } from '@berty/i18n/locale/languages'
import { View, Button } from 'react-native'

// Addons
addons.register('i18n', () => {
	const items = Object.entries(languages).map(([key, attrs]) => ({
		label: attrs.localName,
		value: key,
	}))
	console.log('items', items)
	addons.addPanel('i18n', {
		title: 'language',
		// eslint-disable-next-line react/prop-types
		render: () =>
			React.createElement(() => {
				return (
					<View>
						{items.map(item => (
							<Button title={item.label} onPress={() => i18next.changeLanguage(item.value)} />
						))}
					</View>
				)
			}),
		paramKey: 'i18n',
	})
})
