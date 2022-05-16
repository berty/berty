import React from 'react'

import TextButtonPriv from '../TextButton.priv'

const ErrorTextPriv: React.FC = props => {
	// TODO: replace with value from theme
	return <TextButtonPriv color='#E35179'>{props.children}</TextButtonPriv>
}

export default ErrorTextPriv
