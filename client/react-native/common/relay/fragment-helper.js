import Relay from 'react-relay'

export class ConnectionHelper {
  constructor (selection) {
    console.log('new ConnectionHelper')
    Object.keys(selection).forEach(k => (this[k] = selection[k]))
  }

  getEdgeType = _ =>
    console.log('EdgeType') ||
    ((_ = this.selections.find(_ => _.concreteType.match(/Edge$/))) &&
      _.concreteType)

  getMetadata = metadata => metadata.find(_ => _.alias === this.alias)

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
          new ConnectionHelper(_)
  }

  getDefaultConnection = _ => {
    console.log('getDefaultConnection')
    return (
      (_ = this.selections.find(_ => _.concreteType.match(/Connection$/g))) &&
      new ConnectionHelper(_)
    )
  }
}

export default FragmentHelper
