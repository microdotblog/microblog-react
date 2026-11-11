import * as React from 'react'
import { Platform, useWindowDimensions } from 'react-native'

export const SidebarWidthContext = React.createContext(0)

export function SidebarLayoutProvider({ children }) {
  const { width, height } = useWindowDimensions()
  // Leave room for the content column and exclude short phone windows in landscape.
  const show_sidebar = Platform.OS === 'ios' && width >= 600 && (Platform.isPad || height >= 560)
  const sidebar_width = show_sidebar ? Math.round(Math.min(248, Math.max(168, width * 0.28))) : 0

  return (
    <SidebarWidthContext.Provider value={sidebar_width}>
      {children}
    </SidebarWidthContext.Provider>
  )
}
