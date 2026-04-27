import { isLiquidGlass } from './ui'

function customHeaderItem(element) {
  return {
    type: 'custom',
    element,
    hidesSharedBackground: false
  }
}

export function headerLeftElement(renderElement) {
  if (isLiquidGlass()) {
    return {
      unstable_headerLeftItems: () => [customHeaderItem(renderElement())]
    }
  }

  return {
    headerLeft: renderElement
  }
}

export function headerRightElement(renderElement) {
  if (isLiquidGlass()) {
    return {
      unstable_headerRightItems: () => [customHeaderItem(renderElement())]
    }
  }

  return {
    headerRight: renderElement
  }
}
