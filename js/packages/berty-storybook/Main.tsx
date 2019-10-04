import React from 'react'
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { Layout, Text, Button } from 'react-native-ui-kitten'
import { Card } from '@berty-tech/shared-storybook'
import styles from './styles'

type Navigation = () => void
type Form<T> = (arg0: T) => Promise<void>

type RequestsItemProps = {
  name: string
  avatar: string
  at: Date
  accept: Form<void>
  discard: Form<void>
}

type RequestsProps = {
  items: Array<RequestsItemProps>
}

enum ConversationsItemStatus {
  Sending = 0,
  Sent,
  Failed,
  Seen,
}
type ConversationsItemProps = {
  avatar: string
  title: string
  intro: string
  at: Date
  badge: number
  verified: boolean
  status: ConversationsItemStatus
}
type ConversationsProps = {
  items: Array<ConversationsItemProps>
}
type FooterProps = {
  search: Navigation
  plus: Navigation
  account: Navigation
}
type ListProps = {
  conversations: ConversationsProps
  requests: RequestsProps
  footer: FooterProps
}

const RequestsItem: React.FC<RequestsItemProps> = ({
  name,
  avatar,
  at,
  accept,
  discard,
}) => (
  <Card>
    <Text>{name}</Text>
    <Text category="s4">{`Received ${at.toLocaleDateString()}`}</Text>
    <View style={styles.row}>
      <Button
        onPress={(): void => {
          discard()
        }}
      >
        X
      </Button>
      <Button
        onPress={(): void => {
          accept()
        }}
      >
        Accept
      </Button>
    </View>
  </Card>
)

const Requests: React.FC<RequestsProps> = ({ items }) => (
  <SafeAreaView>
    <Text style={styles.textWhite}>Requests</Text>
    <ScrollView horizontal>
      {items.map((props) => (
        <RequestsItem {...props} />
      ))}
    </ScrollView>
  </SafeAreaView>
)

const ConversationsItem: React.FC<ConversationsItemProps> = ({
  avatar,
  title,
  intro,
  at,
  badge,
  verified,
  status,
}) => (
  <View style={styles.row}>
    <Text>{title}</Text>
    <Text category="s5">{intro}</Text>
  </View>
)

const Conversations: React.FC<ConversationsProps> = ({ items }) => (
  <Layout style={styles.padding}>
    <Text category="h4">Conversations</Text>
    <ScrollView>
      {items.map((props) => (
        <ConversationsItem {...props} />
      ))}
    </ScrollView>
  </Layout>
)

const Footer: React.FC<FooterProps> = ({ search, plus, account }) => (
  <View
    style={[styles.absolute, styles.bottom, styles.row, styles.spaceEvenly]}
  >
    <Button>Q</Button>
    <Button>+</Button>
    <Button>A</Button>
  </View>
)

export const List: React.FC<ListProps> = ({
  requests,
  conversations,
  footer,
}) => (
  <Layout style={styles.flex}>
    <Requests {...requests} />
    <Conversations {...conversations} />
    <Footer {...footer} />
  </Layout>
)
