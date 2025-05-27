import { storiesOf } from '@storybook/react-native'
import React, { useState } from 'react'
import { Text } from 'react-native'

import { useAllConversations, useConversationMembers } from '@berty/hooks'

import { TextualDropdown, MembersDropdown } from '.'
import { AppDecorator, Spacer, ScroolViewDecorator } from '../../../.storybook/preview'

const items = [
	{
		label: 'Rio de Janeiro',
		value: '1',
	},
	{ label: 'Lisbon', value: '2' },
	{ label: 'Paris', value: '3' },
]

const TextualDropdowns = () => {
	const [currentValue, setCurrentValue] = useState('Placeholder')
	return (
		<>
			<Text>Textual Dropdown:</Text>
			<Spacer />
			<TextualDropdown
				items={items}
				placeholder={currentValue}
				onChangeItem={e => setCurrentValue(e.label)}
			/>
			<Spacer />
		</>
	)
}

const MembersDropdowns = () => {
	const all = useAllConversations()
	const members = useConversationMembers(all[2].publicKey || '')

	return (
		<>
			<Text>Members Dropdowns (empty):</Text>
			<Spacer />
			<MembersDropdown
				items={[]}
				publicKey={'publicKey'}
				onChangeItem={member => {
					console.log('member' + member)
				}}
				placeholder={'Placehoder'}
			/>
			<Spacer />

			<Text>Members Dropdown (with content):</Text>
			<Spacer />
			<MembersDropdown
				items={members}
				publicKey={'publicKey'}
				onChangeItem={member => {
					console.log('member' + member)
				}}
				placeholder={'Placehoder'}
			/>
		</>
	)
}

storiesOf('Components', module)
	.addDecorator(AppDecorator)
	.addDecorator(ScroolViewDecorator)
	.add('Dropdown', () => (
		<>
			<TextualDropdowns />
			<Spacer />

			<MembersDropdowns />
			<Spacer />
		</>
	))
