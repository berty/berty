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

//
//  This function will create a generic relay updater for pagination connection
//  based on fragment information
//  The filter "args" need to have same field that the connection have in arguments
//
export default (fragment, alias, args) => {
  return (store, data, deletion) => {
    const helper = new FragmentHelper(fragment)
    const connectionHelper = helper.getConnection(alias)

    const root = store.getRoot()

    const connection = ConnectionHandler.getConnection(
      root,
      helper.getConnection(alias).key,
      args
    )

    if (connection == null) {
      return
    }

    if (
      deletion ||
      deepFilterEqual(args, merge([args, { filter: data }])) === false
    ) {
      // delete
      ConnectionHandler.deleteNode(connection, data.id)
      return
    }

    // get all edges

    const edges = connection.getLinkedRecords('edges')

    let field = args.orderBy || args.sortBy || 'id'
    field = data[field] ? field : Case.camel(field)

    const node =
      store.get(data.id) ||
      store.create(data.id, connectionHelper.getEdgeNodeType())
    node.setValue(data.id, 'id')
    node.setValue(data[field], 'field')

    const cursor =
      field === 'id'
        ? atob(data.id).split(/:(.+)/)[1]
        : atob(data.id).split(/:(.+)/)[1] + ':' + data[field]

    if (
      edges.length > 0 &&
      edges.some(e => e.getLinkedRecord('node').getValue('id') === data.id)
    ) {
      // update
      return
    }

    // add
    const edge = ConnectionHandler.createEdge(
      store,
      connection,
      node,
      connectionHelper.getEdgeType()
    )
    edge.setValue(cursor, 'cursor')

    if (connectionHelper.direction === 'forward' && args.orderDesc === false) {
      ConnectionHandler.insertEdgeBefore(connection, edge, cursor)
    } else {
      ConnectionHandler.insertEdgeBefore(connection, edge, cursor)
    }
  }
}
