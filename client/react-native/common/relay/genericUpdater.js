import { FragmentHelper } from './fragment-helper'
import { ConnectionHandler } from 'relay-runtime'

const deepFilterEqual = (a, b) => {
  if (typeof a !== typeof b) {
    return false
  }
  switch (typeof a) {
    case 'object':
      if (Array.isArray(a)) {
        return a.every(av => b.some(bv => deepFilterEqual(av, bv)))
      }
      return Object.keys(a).every(k => deepFilterEqual(a[k], b[k]))
    default:
      return a === b
  }
}

/*
 * This function will create a generic relay updater for pagination connection
 * based on fragment information
 * The filter "args" need to have same field that the connection have in arguments
 */
export default (fragment, alias, args) => {
  const helper = new FragmentHelper(fragment)
  const connectionHelper = helper.getConnection(alias)

  return (store, data) => {
    const root = store.getRoot()
    const connection = ConnectionHandler.getConnection(
      root,
      helper.getConnection(alias).key,
      args
    )

    if (deepFilterEqual(args, { filter: data }) === false) {
      // delete
      ConnectionHandler.deleteNode(connection, data.id)
      return
    }
    // add
    const cursor = data[args.orderBy || args.sortBy || 'id']
    const node = store.get(data.id)
    const edge = ConnectionHandler.createEdge(
      store,
      connection,
      node,
      helper.getConnection(alias).getEdgeType
    )
    if (
      connectionHelper().getMetadata().direction === 'forward' &&
      args.orderDesc === false
    ) {
      ConnectionHandler.insertEdgeAfter(connection, edge, cursor)
      return
    }
    ConnectionHandler.insertEdgeBefore(connection, edge, cursor)
  }
}
