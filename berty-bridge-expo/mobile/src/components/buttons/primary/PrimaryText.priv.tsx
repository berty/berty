import React from 'react'

import { TextButtonPriv } from '../TextButton.priv'

export const PrimaryTextPriv: React.FC<React.PropsWithChildren> = props => {
	return <TextButtonPriv color='#F2F2F2'>{props.children}</TextButtonPriv>
}
