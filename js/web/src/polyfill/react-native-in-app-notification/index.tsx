import React from 'react'

const showNotification = (
	_title: string,
	_message: string,
	_onPress: () => Promise<void>,
	_additionalProps: { type: string },
) => {}
const withInAppNotification =
	(WrappedComponent: any) =>
	({ ...props }) => {
		return <WrappedComponent showNotification={showNotification} {...props} />
	}
const InAppNotificationProvider = () => <></>

export { withInAppNotification, InAppNotificationProvider }
