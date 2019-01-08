import React from 'react'
import GenericList from './GenericList'

const Sent = (props) => <GenericList filter={{ filter: { status: 3 } }} {...props} ignoreMyself />

export default Sent
