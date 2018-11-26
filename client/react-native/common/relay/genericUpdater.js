import { atob } from 'b64-lite'
import Case from 'case'

import { ConnectionHandler } from 'relay-runtime'

import { FragmentHelper } from './fragment-helper'
import { merge } from '../helpers'

const deepFilterEqual = (a, b) => {
  if (!a) {
    return true
  }
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
  return (store, data) => {
    const helper = new FragmentHelper(fragment)
    const connectionHelper = helper.getConnection(alias)
    const root = store.getRoot()
    const connection = ConnectionHandler.getConnection(
      root,
      helper.getConnection(alias).key,
      args
    )
    if (deepFilterEqual(args, merge([args, { filter: data }])) === false) {
      // delete
      ConnectionHandler.deleteNode(connection, data.id)
      return
    }

    const edges = connection.getLinkedRecords('edges')
    const cursor =
      (args.orderBy && args.orderBy !== 'id') ||
      (args.sortBy && args.sortBy !== 'id')
        ? data[Case.camel(args.orderBy || args.sortBy)]
        : atob(data.id).split(':')[1]
    if (edges.length > 0 && edges.some(e => e.getValue('cursor') === cursor)) {
      // update
      const node = store.get(data.id)
      Object.keys(data).forEach(k => node.setValue(data[k], k))
      return
    }

    // add
    const node =
      store.get(data.id) ||
      store.create(data.id, connectionHelper.getEdgeNodeType())
    const edge = ConnectionHandler.createEdge(
      store,
      connection,
      node,
      connectionHelper.getEdgeType()
    )
    edge.setValue(cursor, 'cursor')

    if (connectionHelper.direction === 'forward' && args.orderDesc === false) {
      ConnectionHandler.insertEdgeAfter(connection, edge, cursor)
      return
    }
    ConnectionHandler.insertEdgeBefore(connection, edge, cursor)
  }
}
