import type { Meta, StoryObj } from "@storybook/react";
import React from 'react'

import { useIncomingContactRequests } from '@berty/hooks'

import { AppDecorator, NavigationDecorator } from '../../../../../.rnstorybook/preview'
import { IncomingRequests } from './Requests'

const IncomingStory = () => {
	const items = useIncomingContactRequests()

	return <IncomingRequests items={items} />
}


const meta: Meta = {
	title: "Home Components",
	decorators: [AppDecorator],
};

export default meta;

type Story = StoryObj;

export const IncomingRequest: Story = {
	name: "Incoming Request",
	render: () => <IncomingStory />,
};
