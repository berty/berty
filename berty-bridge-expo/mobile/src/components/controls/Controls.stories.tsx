import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import { AltToggle, StreamProgress, TabBar, Toggle } from '.'
import { AppDecorator, ScroolViewDecorator, Spacer } from '../../../.rnstorybook/preview'

const onPress = () => console.log('onPress')

const Toggles = () => {
	const [toggle1, setToggle1] = useState(true)
	const [toggle2, setToggle2] = useState(false)
	return (
		<>
			<Toggle checked={toggle1} onChange={setToggle1} />
			<Spacer />
			<Toggle checked={toggle2} onChange={setToggle2} />
			<Spacer />
		</>
	)
}

const AltToggles = () => {
	const [toggle1, setToggle1] = useState(true)
	const [toggle2, setToggle2] = useState(false)
	return (
		<>
			<AltToggle checked={toggle1} onChange={setToggle1} />
			<Spacer />
			<AltToggle checked={toggle2} onChange={setToggle2} />
			<Spacer />
		</>
	)
}

const Tabs = () => {
	const { t } = useTranslation()
	return (
		<>
			<Text>Tabs: </Text>
			<Spacer />
			<View>
				<TabBar
					tabs={[
						{ name: t('tabs.qr') },
						{ name: t('tabs.fingerprint') },
						{ name: t('tabs.info') },
						{ name: t('tabs.devices') },
					]}
					onTabChange={onPress}
				/>
			</View>
			<Spacer />
		</>
	)
}

const ProgressBars = () => {
	return (
		<>
			<Text>Progress Bars: </Text>
			<Spacer />
			<StreamProgress />
			<Spacer />
		</>
	)
}

const meta: Meta = {
	title: "Components",
	decorators: [AppDecorator, ScroolViewDecorator],
};

export default meta;

type Story = StoryObj;

export const Controls: Story = {
	name: "Controls",
	render: (args) => (
		<>
			<Text>Toggles:</Text>
			<Spacer />
			<Toggles />
			<Spacer />

			<Text>AltToggles: </Text>
			<Spacer />
			<AltToggles />
			<Spacer />

			<ProgressBars />

			<Tabs />
		</>
	),
}
