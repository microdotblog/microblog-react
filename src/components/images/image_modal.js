import * as React from 'react';
import { observer } from 'mobx-react';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { Gesture, GestureDetector, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import App from "../../stores/App"
import { Modal, Platform, SafeAreaView, TouchableOpacity, Image, View, useWindowDimensions, ActivityIndicator, Text } from 'react-native'
import { SFSymbol } from "react-native-sfsymbols";
import ArrowBackIcon from './../../assets/icons/arrow_back.png';

const DISMISS_THRESHOLD = 120
const DISMISS_VELOCITY = 900
const SCALE_DISMISS_THRESHOLD = 1.02

const ImageModalContent = gestureHandlerRootHOC(observer(({ image_url }) => {
	const { height } = useWindowDimensions()
	const scale = useSharedValue(1)
	const translate_y = useSharedValue(0)
	const [is_loading_image, set_is_loading_image] = React.useState(true)
	const [did_fail_image, set_did_fail_image] = React.useState(false)

	const close_modal = React.useCallback(() => {
		App.reset_image_modal()
	}, [])

	React.useEffect(() => {
		if (App.image_modal_is_open) {
			scale.value = 1
			translate_y.value = 0
			set_is_loading_image(true)
			set_did_fail_image(false)
		}
	}, [image_url, scale, translate_y])

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

	return (
		<View style={{ flex: 1 }}>
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
						onLoadStart={() => {
							set_is_loading_image(true)
							set_did_fail_image(false)
						}}
						onLoad={() => {
							set_did_fail_image(false)
						}}
						onLoadEnd={() => {
							set_is_loading_image(false)
						}}
						onError={() => {
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
			<SafeAreaView style={{ position: 'absolute', left: 15, top: 15 }}>
				<TouchableOpacity onPress={App.reset_image_modal}>
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
			</SafeAreaView>
		</View>
	)
}))

const ImageModalModule = observer(() => {
	return (
		<Modal
			visible={App.image_modal_is_open}
			animationType="fade"
			presentationStyle="fullScreen"
			statusBarTranslucent={true}
			onRequestClose={App.reset_image_modal}
		>
			<ImageModalContent image_url={App.current_image_url || ''} />
		</Modal>
	)
})

export default ImageModalModule
