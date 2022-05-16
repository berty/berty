import React from 'react'

import TextButtonPriv from '../TextButton.priv'

const PrimaryTextPriv: React.FC = props => {
	return <TextButtonPriv color='white'>{props.children}</TextButtonPriv>
}

export default PrimaryTextPriv
