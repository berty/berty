export const timestampDate = timestamp => {
  return new Date(
    timestamp
      ? timestamp.seconds * 1000 +
        (timestamp.nanos ? Math.round(timestamp.nanos / 1000000) : 0)
      : 0
  )
}

export default timestampDate
