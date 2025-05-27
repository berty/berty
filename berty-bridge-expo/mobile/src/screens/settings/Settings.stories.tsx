import { ComponentStory } from '@storybook/react-native'
import React from 'react'

import { Permission } from '@berty/components/permissions/Permission'
import AppCommonProviders from '@berty/contexts/AppCommonProviders'
import { PermissionType } from '@berty/utils/permissions/permissions'

import { action } from '../../../.storybook/utils'

// ts-unused-exports:disable-next-line
export default {
	title: 'Permissions',
	component: Permission,
	permissionStatus: 'limited',
	decorators: [
		(Story: any) => (
			<AppCommonProviders>
				<Story />
			</AppCommonProviders>
		),
	],
}

const Template: ComponentStory<typeof Permission> = (args: typeof Default.args) => (
	<>
		<Permission
			permissionType={PermissionType.notification}
			permissionStatus='limited'
			onPressPrimary={() => action('onPressPrimary!')}
			onPressSecondary={() => action('onPressSecondary!')}
			{...args}
		/>
	</>
)
// ts-unused-exports:disable-next-line
export const Default = Template.bind({})
Default.storyName = 'Notifications Default'
Default.args = {
	permissionStatus: 'limited',
}
// ts-unused-exports:disable-next-line
export const Blocked = Template.bind({})
Blocked.storyName = 'Notifications Blocked'
Blocked.args = {
	permissionStatus: 'blocked',
}
// ts-unused-exports:disable-next-line
export const Galery = Template.bind({})
Galery.storyName = 'Galery'
Galery.args = {
	permissionType: PermissionType.gallery,
}
// ts-unused-exports:disable-next-line
export const Audio = Template.bind({})
Audio.storyName = 'Audio'
Audio.args = {
	permissionType: PermissionType.audio,
}
// ts-unused-exports:disable-next-line
export const Contacts = Template.bind({})
Contacts.storyName = 'Contacts'
Contacts.args = {
	permissionType: PermissionType.contacts,
}
// ts-unused-exports:disable-next-line
export const Proximity = Template.bind({})
Proximity.storyName = 'Proximity'
Proximity.args = {
	permissionType: PermissionType.proximity,
}
// ts-unused-exports:disable-next-line
export const Camera = Template.bind({})
Camera.storyName = 'Camera'
Camera.args = {
	permissionType: PermissionType.camera,
}
