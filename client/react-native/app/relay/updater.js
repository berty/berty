import { ConnectionHandler } from 'relay-runtime'

export default store => ({
  connection: (name, args) => ({
    delete: id => {
      const root = store.getRoot()
      const connection = ConnectionHandler.getConnection(root, name, args)
      ConnectionHandler.deleteNode(connection, id)
    },
    add: (edgeType, id) => {
      const node = store.get(id)
      const root = store.getRoot()
      const connection = ConnectionHandler.getConnection(root, name, args)
      const edge = ConnectionHandler.createEdge(
        store,
        connection,
        node,
        edgeType
      )
      return {
        // TODO: search cursor in connection to add after or before defined cursor
        after: cursor =>
          ConnectionHandler.insertEdgeAfter(connection, edge, cursor),
        before: cursor =>
          ConnectionHandler.insertEdgeBefore(connection, edge, cursor),
      }
    },
  }),
})
