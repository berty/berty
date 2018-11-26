import Relay from 'react-relay'

export class ConnectionHelper {
  constructor (selection, metadata) {
    console.log(metadata)
    Object.keys(selection).forEach(k => (this[k] = selection[k]))
    Object.keys(metadata).forEach(k => (this[k] = metadata[k]))
  }

  getEdge = _ => (_ = this.selections.find(_ => _.concreteType.match(/Edge$/)))

  getEdgeType = _ => (_ = this.getEdge()) && _.concreteType

  getEdgeNodeType = _ =>
    (_ = this.getEdge()) &&
    (_ = _.selections.find(_ => _.name === 'node')) &&
    _.concreteType

  get key () {
    console.log('key')
    return this.name.replace(/^__/g, '').replace(/_connection$/g, '')
  }
}

export class FragmentHelper {
  constructor (schema) {
    const { selections, metadata } = schema.data()

    this.schema = schema
    this.selections = selections
    this.metadata = metadata
  }

  createContainer = component =>
    Relay.createFragmentContainer(component, this.schema)

  getSelection = alias => this.selections.find(_ => _.alias === alias)

  getConnection = (alias, _) => {
    console.log('getConnection')
    return alias == null
      ? this.getDefaultConnection()
      : (_ = this.getSelection(alias)) &&
          _.concreteType.match(/Connection$/g) &&
          new ConnectionHelper(
            _,
            this.metadata.connection.find(_ => _.path.some(_ => _ === alias))
          )
  }

  getDefaultConnection = _ => {
    console.log('getDefaultConnection')
    return (
      (_ = this.selections.find(_ => _.concreteType.match(/Connection$/g))) &&
      new ConnectionHelper(_, this.metadata.connection[0])
    )
  }
}

export default FragmentHelper
