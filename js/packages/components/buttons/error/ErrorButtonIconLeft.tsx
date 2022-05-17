import React from 'react'

import IconWrapperLeftPriv from '../icon-button/IconWrapperLeft.priv'
import { IButtonPress, IIconName } from '../interfaces'
import ErrorButtonPriv from './ErrorButton.priv'
import ErrorTextPriv from './ErrorText.priv'

const ErrrorButtonIconLeft: React.FC<IButtonPress & IIconName> = props => {
	return (
		<ErrorButtonPriv onPress={props.onPress}>
			<IconWrapperLeftPriv name={props.name} type='error' />
			<ErrorTextPriv>{props.children}</ErrorTextPriv>
		</ErrorButtonPriv>
	)
}

export default ErrrorButtonIconLeft
