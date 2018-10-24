import { ConnectionHandler } from 'relay-runtime'

export default store => ({
  connection: (name, args) => ({
    delete: id => {
      const root = store.getRoot()
      const connection = ConnectionHandler.getConnection(root, name, args)
      ConnectionHandler.deleteNode(connection, id)
    },
  }),
})
