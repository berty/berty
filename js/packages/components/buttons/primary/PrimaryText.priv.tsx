import React from 'react'

import { TextButtonPriv } from '../TextButton.priv'

export const PrimaryTextPriv: React.FC = props => {
	return <TextButtonPriv color='white'>{props.children}</TextButtonPriv>
}
