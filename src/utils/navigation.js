import { isLiquidGlass } from './ui'

function customHeaderItem(element, options = {}) {
  return {
    type: 'custom',
    element,
    hidesSharedBackground: options.hidesSharedBackground === true
  }
}

export function headerLeftElement(renderElement, options = {}) {
  if (isLiquidGlass()) {
    return {
      unstable_headerLeftItems: () => [customHeaderItem(renderElement(), options)]
    }
  }

  return {
    headerLeft: renderElement
  }
}

export function headerRightElement(renderElement, options = {}) {
  if (isLiquidGlass()) {
    return {
      unstable_headerRightItems: () => [customHeaderItem(renderElement(), options)]
    }
  }

  return {
    headerRight: renderElement
  }
}

export function headerItemGroupStyle(gap = 10) {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap,
    paddingHorizontal: isLiquidGlass() ? 8 : 0
  }
}
