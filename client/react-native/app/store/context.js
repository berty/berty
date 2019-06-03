import React from 'react'
import { withContext } from '@berty/common/helpers/views'

export const StoreContext = React.createContext()
StoreContext.displayName = 'StoreContext'

export const withStoreContext = withContext(StoreContext)

export default StoreContext
