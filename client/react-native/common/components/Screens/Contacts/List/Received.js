import React from 'react'
import GenericList from './GenericList'

const Received = (props) => <GenericList filter={{ filter: { status: 4 } }} {...props} ignoreMyself />

export default Received
