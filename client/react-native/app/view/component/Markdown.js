import MarkdownLib, {
  styles as libStyles,
} from 'react-native-markdown-renderer'
import MarkdownIt from 'markdown-it'
import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { monospaceFont } from '@berty/common/constants/styling'
import colors from '@berty/common/constants/colors'
import { openURL } from '@berty/common/helpers/linking'

export const styles = StyleSheet.create({
  codeBlock: {
    borderRadius: 5,
    borderWidth: 0,
    backgroundColor: colors.fakeBlack,
    color: colors.white,
    padding: 4,
    fontFamily: monospaceFont,
  },
  codeInline: {
    borderRadius: 5,
    borderWidth: 0,
    backgroundColor: colors.fakeBlack,
    color: colors.white,
    padding: 1,
    fontFamily: monospaceFont,
  },
  blockquote: {
    paddingVertical: 0,
    paddingRight: 0,
    paddingLeft: 5,
    borderLeftWidth: 2,
    borderLeftColor: colors.blue25,
    margin: 0,
    backgroundColor: 'transparent',
  },
  inlineCode: {
    borderRadius: 3,
    borderWidth: 1,
    padding: 2,
    fontFamily: monospaceFont,
    fontWeight: 'bold',
  },
  list: {},
  listItem: {
    flex: 1,
    flexWrap: 'wrap',
  },
  listUnorderedItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  listUnorderedItemIcon: {
    marginLeft: 10,
    marginRight: 10,
    lineHeight: 20,
  },
  listUnorderedItemText: {
    fontSize: 20,
    lineHeight: 20,
  },
  listOrderedItem: {
    flexDirection: 'row',
  },
  listOrderedItemIcon: {
    marginLeft: 10,
    marginRight: 10,
    lineHeight: 20,
  },
  listOrderedItemText: {
    fontWeight: 'bold',
    lineHeight: 20,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  hardbreak: {
    width: '100%',
    height: 1,
  },
  strong: {
    fontWeight: 'bold',
  },
  text: {},
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  link: {
    textDecorationLine: 'underline',
  },
  blocklink: {
    flex: 1,
    borderColor: colors.blue,
    borderBottomWidth: 1,
  },
  u: {
    borderBottomWidth: 1,
  },
})

const md = MarkdownIt({
  typographer: true,
  linkify: true,
}).disable([
  'newline',
  'image',
  'link', // Avoid [https://test.com](https://olol.com)
  'html_inline',
  'table',
  'hr',
  'reference',
  'html_block',
  'heading',
])

const flattenedStyles = StyleSheet.flatten([libStyles, styles])

const link = (node, children, parent, styles) => (
  <Text
    key={node.key}
    style={styles.link}
    accessibilityRole="link"
    onPress={() => openURL(node.attributes.href)}
  >
    {children}
  </Text>
)

const Markdown = ({ children, style, ...props }) => (
  <MarkdownLib
    rules={{
      link,
    }}
    markdownit={md}
    style={style || flattenedStyles}
    {...props}
  >
    {children}
  </MarkdownLib>
)

export default Markdown
Markdown.styles = styles
