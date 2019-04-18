
export const getNamespace = service => {
  if (service.name === '') {
    return ''
  }

  const namespace = getNamespace(service.parent)
  if (namespace === '') {
    return service.name
  }

  return `${namespace}.${service.name}`
}
