import * as React from 'react';
import { observer } from 'mobx-react';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { Gesture, GestureDetector, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import App from "../../stores/App"
import { Modal, Platform, TouchableOpacity, Image, View, useWindowDimensions, ActivityIndicator, Text } from 'react-native'
import { SFSymbol } from "react-native-sfsymbols";
import ArrowBackIcon from './../../assets/icons/arrow_back.png';

const DISMISS_THRESHOLD = 120
const DISMISS_VELOCITY = 900
const SCALE_DISMISS_THRESHOLD = 1.02

const ImageModalContent = gestureHandlerRootHOC(observer(({ image_url }) => {
	const { height } = useWindowDimensions()
	const insets = useSafeAreaInsets()
	const close_button_top = insets.top + (Platform.OS === 'ios' ? 14 : 15)
	const scale = useSharedValue(1)
	const translate_y = useSharedValue(0)
	const [is_loading_image, set_is_loading_image] = React.useState(true)
	const [did_fail_image, set_did_fail_image] = React.useState(false)
	const image_load_token = React.useRef(0)
	const image_load_timeout = React.useRef(null)
	const image_did_finish_loading = React.useRef(false)

	const close_modal = React.useCallback(() => {
		App.reset_image_modal()
	}, [])

	const finish_loading_image = React.useCallback((load_token = image_load_token.current) => {
		if (image_load_token.current === load_token) {
			image_did_finish_loading.current = true
			if (image_load_timeout.current) {
				clearTimeout(image_load_timeout.current)
				image_load_timeout.current = null
			}
			set_is_loading_image(false)
		}
	}, [])

	React.useEffect(() => {
		const load_token = image_load_token.current + 1
		image_load_token.current = load_token

		if (image_load_timeout.current) {
			clearTimeout(image_load_timeout.current)
			image_load_timeout.current = null
		}

		if (App.image_modal_is_open && image_url) {
			scale.value = 1
			translate_y.value = 0
			image_did_finish_loading.current = false
			set_is_loading_image(true)
			set_did_fail_image(false)

			Image.getSize(
				image_url,
				() => {
					if (image_load_token.current === load_token) {
						set_did_fail_image(false)
						finish_loading_image(load_token)
					}
				},
				() => {}
			)

			image_load_timeout.current = setTimeout(() => {
				finish_loading_image(load_token)
			}, 5000)
		}

		return () => {
			if (image_load_timeout.current) {
				clearTimeout(image_load_timeout.current)
				image_load_timeout.current = null
			}
		}
	}, [image_url, scale, translate_y, finish_loading_image])

	const dismiss_gesture = Gesture.Pan()
		.minPointers(1)
		.maxPointers(1)
		.activeOffsetY(12)
		.failOffsetX([-25, 25])
		.onTouchesDown((_, manager) => {
			if (scale.value > SCALE_DISMISS_THRESHOLD) {
				manager.fail()
			}
		})
		.onUpdate((event) => {
			if (scale.value > SCALE_DISMISS_THRESHOLD) {
				return
			}
			translate_y.value = Math.max(0, event.translationY)
		})
		.onEnd((event) => {
			if (scale.value > SCALE_DISMISS_THRESHOLD) {
				translate_y.value = withSpring(0)
				return
			}

			const should_dismiss = translate_y.value > DISMISS_THRESHOLD || event.velocityY > DISMISS_VELOCITY
			if (should_dismiss) {
				translate_y.value = withTiming(height, { duration: 180 }, (finished) => {
					if (finished) {
						runOnJS(close_modal)()
					}
				})
			}
			else {
				translate_y.value = withSpring(0, {
					damping: 18,
					stiffness: 180,
				})
			}
		})
		.onFinalize(() => {
			if (scale.value > SCALE_DISMISS_THRESHOLD) {
				translate_y.value = withSpring(0)
			}
		})

	const backdrop_style = useAnimatedStyle(() => ({
		opacity: interpolate(translate_y.value, [0, height * 0.6], [1, 0], Extrapolation.CLAMP),
	}))

	const content_style = useAnimatedStyle(() => ({
		transform: [{ translateY: translate_y.value }],
	}))

	const close_button_style = useAnimatedStyle(() => ({
		opacity: interpolate(translate_y.value, [0, height * 0.35], [1, 0], Extrapolation.CLAMP),
	}))

	return (
		<View
			style={{ flex: 1 }}
			accessibilityViewIsModal={true}
		>
			<Animated.View
				style={[
					{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: '#000',
					},
					backdrop_style,
				]}
			/>
			<GestureDetector gesture={dismiss_gesture}>
				<Animated.View style={[{ flex: 1 }, content_style]}>
					<ImageZoom
						uri={image_url}
						style={{ width: '100%', height: '100%' }}
						resizeMode="contain"
						isDoubleTapEnabled={true}
						scale={scale}
						accessibilityRole="image"
						accessibilityLabel="Image preview"
						onLoadStart={() => {
							if (!image_did_finish_loading.current) {
								set_is_loading_image(true)
							}
							set_did_fail_image(false)
						}}
						onLoad={() => {
							set_did_fail_image(false)
							finish_loading_image()
						}}
						onLoadEnd={() => {
							finish_loading_image()
						}}
						onError={() => {
							image_did_finish_loading.current = true
							set_did_fail_image(true)
							set_is_loading_image(false)
						}}
					/>
					{
						is_loading_image &&
						<View
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								justifyContent: 'center',
								alignItems: 'center',
							}}
							pointerEvents="none"
						>
							<ActivityIndicator color={App.theme_accent_color()} size="large" />
						</View>
					}
					{
						did_fail_image &&
						<View
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								justifyContent: 'center',
								alignItems: 'center',
								paddingHorizontal: 30,
							}}
							pointerEvents="none"
						>
							<Text style={{ color: 'white', textAlign: 'center' }}>
								Couldn&apos;t load image.
							</Text>
						</View>
					}
				</Animated.View>
			</GestureDetector>
			<Animated.View style={[{ position: 'absolute', left: 15, top: close_button_top }, close_button_style]}>
				<TouchableOpacity
					onPress={App.reset_image_modal}
					accessibilityRole="button"
					accessibilityLabel="Close image"
				>
					{
						Platform.OS === 'ios' ?
							<SFSymbol
								name="xmark"
								weight="semibold"
								scale="large"
								color="white"
								size={16}
								resizeMode="center"
								multicolor={false}
								style={{ width: 32, height: 32 }}
							/>
						:
						<Image
							source={ArrowBackIcon}
							resizeMode="center"
							style={{ width: 32, height: 32, tintColor: 'white' }}
						/>
					}
				</TouchableOpacity>
			</Animated.View>
		</View>
	)
}))

const ImageModalModule = observer(() => {
	return (
		<Modal
			visible={App.image_modal_is_open}
			transparent={true}
			animationType="fade"
			presentationStyle="overFullScreen"
			statusBarTranslucent={true}
			onRequestClose={App.reset_image_modal}
		>
			<ImageModalContent image_url={App.current_image_url || ''} />
		</Modal>
	)
})

export default ImageModalModule
