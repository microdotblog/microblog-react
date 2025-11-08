import * as React from 'react'
import { Image as RNImage } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import App from '../../stores/App'

const mapContentFitToResizeMode = (contentFit) => {
	if (contentFit === 'contain' || contentFit === 'scale-down') {
		return 'contain'
	}
	if (contentFit === 'cover') {
		return 'cover'
	}
	if (contentFit === 'fill') {
		return 'stretch'
	}
	if (contentFit === 'none') {
		return 'center'
	}
	return undefined
}

const MBImage = React.forwardRef(({ contentFit, ...props }, ref) => {
	if (App.is_share_extension) {
		const {
			transition,
			cachePolicy,
			placeholder,
			...restProps
		} = props

		const { resizeMode, ...nativeProps } = restProps
		const finalResizeMode = resizeMode ?? mapContentFitToResizeMode(contentFit)

		return (
			<RNImage
				ref={ref}
				{...nativeProps}
				resizeMode={finalResizeMode}
			/>
		)
	}

	return (
		<ExpoImage
			ref={ref}
			contentFit={contentFit}
			{...props}
		/>
	)
})

export default MBImage
