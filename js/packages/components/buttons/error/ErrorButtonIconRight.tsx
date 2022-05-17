import React from 'react'

import IconWrapperRightPriv from '../icon-button/IconWrapperRight.priv'
import { IButtonPress, IIconName } from '../interfaces'
import ErrorButtonPriv from './ErrorButton.priv'
import ErrorTextPriv from './ErrorText.priv'

const ErrorButtonIconRight: React.FC<IButtonPress & IIconName> = props => {
	return (
		<ErrorButtonPriv onPress={props.onPress}>
			<ErrorTextPriv>{props.children}</ErrorTextPriv>
			<IconWrapperRightPriv name={props.name} type='error' />
		</ErrorButtonPriv>
	)
}

export default ErrorButtonIconRight
