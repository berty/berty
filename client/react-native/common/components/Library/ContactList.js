import { FlatList } from 'react-native'
import React, { PureComponent } from 'react'
import { Separator, ListItem } from '.'

export default class ContactList extends PureComponent {
  sortContacts = (contactList, sortKey) => {
    return contactList.map(_ => _).sort((a, b) => {
      let an = a[sortKey].toLowerCase()
      let bn = b[sortKey].toLowerCase()
      return an < bn ? -1 : an > bn ? 1 : 0
    })
  }

  render () {
    const {
      list,
      state,
      retry,
      navigation,
      action,
      subtitle,
      sortBy,
    } = this.props
    let data = sortBy == null ? list : this.sortContacts(list, sortBy)

    return (
      <FlatList
        data={data}
        ItemSeparatorComponent={({ highlighted }) => (
          <Separator highlighted={highlighted} />
        )}
        refreshing={state.type === state.loading}
        onRefresh={retry}
        renderItem={data => (
          <ListItem
            title={data.item.overrideDisplayName || data.item.displayName}
            subtitle={subtitle}
            onPress={() => navigation.push(action, { id: data.item.id })}
            separators={data.separators}
          />
        )}
      />
    )
  }
}
