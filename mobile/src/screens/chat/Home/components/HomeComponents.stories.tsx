import { storiesOf } from '@storybook/react-native'
import React from 'react'

import { useIncomingContactRequests } from '@berty/hooks'

import { AppDecorator, NavigationDecorator } from '../../../../../.storybook/preview'
import { IncomingRequests } from './Requests'

const IncomingStory = () => {
	const items = useIncomingContactRequests()

	return <IncomingRequests items={items} />
}

storiesOf('Home Components', module)
	.addDecorator(AppDecorator)
	.addDecorator(NavigationDecorator)
	.add('Incoming Request', () => <IncomingStory />)
