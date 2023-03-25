import * as React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Screens, POSTING_SCREEN } from '../../screens';
import CheckmarkIcon from '../../assets/icons/checkmark.png';
import ImageEditor from "@react-native-community/image-editor";
import { Mayfair, Sepia, Grayscale } from "react-native-image-filter-kit";

@observer
export default class ImageCropScreen extends React.Component{
	
	constructor (props) {
		super(props)
		this.state = {
			scroll_size: 0,
			is_cropped: true,
			crop_pt: { x: 0, y: 0 }
		}
		Navigation.events().bindComponent(this)
	}

	navigationButtonPressed = async ({ buttonId }) => {
		console.log("navigationButtonPressed::", buttonId)
		if (buttonId === "add_image_button") {
			if (this.state.is_cropped) {
				var crop_size = 0
				var scaled_pt = { x: 0, y: 0 }

				if (this.props.asset.is_landscape()) {
					crop_size = this.props.asset.height
					scaled_pt.x = this.state.crop_pt.x / this.state.scroll_size * crop_size
				}
				else {
					crop_size = this.props.asset.width
					scaled_pt.y = this.state.crop_pt.y / this.state.scroll_size * crop_size
				}
				
				const crop_info = {
					offset: scaled_pt,
					size: {
						width: crop_size,
						height: crop_size 
					}
				}
				ImageEditor.cropImage(this.props.asset.uri, crop_info).then(url => {
					console.log("Cropped image", url)
					this.props.asset.delete_file()
					var media_asset = MediaAsset.create({
						uri: url,
						type: this.props.asset.type,
						width: crop_size,
						height: crop_size
					})
					Auth.selected_user.posting.attach_asset(media_asset)
					Navigation.pop(POSTING_SCREEN)
				})
			}
			else {
				Auth.selected_user.posting.attach_asset(this.props.asset)
				Navigation.pop(POSTING_SCREEN)
			}
		}
	}
  
	_filter_view = (asset, filter, margin_right = 0) => {
		const box_style = { width: 120, height: 120, marginTop: 25, marginLeft: 25, marginRight: margin_right };
		return (
			<TouchableOpacity onPress={() => {
				}}>
				<View>
					{ filter == "Normal" ?
						<Image source={{ uri: asset.uri }} style={ box_style } />
					: null }
					{ filter == "Mayfair" ?
						<Mayfair image={
							<Image source={{ uri: asset.uri }} style={ box_style } />
						}/>
					: null }
					{ filter == "Sepia" ?
						<Sepia image={
							<Image source={{ uri: asset.uri }} style={ box_style } />
						}/>
					: null }
					{ filter == "Grayscale" ?
						<Grayscale image={
							<Image source={{ uri: asset.uri }} style={ box_style } />
						}/>
					: null }
					<Text style={{ color: App.theme_button_text_color(), paddingLeft: 25, marginTop: 12, marginRight: margin_right, textAlign: "center" }}>{ filter }</Text>
				</View>
			</TouchableOpacity>			
		)
	}
  
	render() {
		const { scroll_size, is_cropped } = this.state
		const { asset } = this.props
		return (
			<View style={{ flexDirection: "column" }}>
				{ is_cropped ? 
					(
						asset.is_landscape() ? 
							<View style={{ flexDirection: "row" }}>
								<ScrollView style={{ width: "100%", height: scroll_size, backgroundColor: App.theme_crop_background_color() }} bounces={ false } contentContainerStyle={{ width: asset.scale_width_for_height(scroll_size), height: scroll_size }} onLayout={(e) => {
									this.setState({ scroll_size: e.nativeEvent.layout.width })
								}} scrollEventThrottle={ 50 } onScroll={(e) => {
									console.log("on scroll", e.nativeEvent.contentOffset.x, e.nativeEvent.contentOffset.y)
									this.setState({ crop_pt: e.nativeEvent.contentOffset })
								}}>
									<Image source={{ uri: asset.uri }} style={{ width: asset.scale_width_for_height(scroll_size), height: scroll_size, resizeMode: "contain" }} />
								</ScrollView>
							</View>
						:
							<View style={{ flexDirection: "row" }}>
								<ScrollView style={{ width: "100%", height: scroll_size, backgroundColor: App.theme_crop_background_color() }} bounces={ false } contentContainerStyle={{ width: scroll_size, height: asset.scale_height_for_width(scroll_size) }} onLayout={(e) => {
									this.setState({ scroll_size: e.nativeEvent.layout.width })
								}} scrollEventThrottle={ 50 } onScroll={(e) => {
									console.log("on scroll", e.nativeEvent.contentOffset.x, e.nativeEvent.contentOffset.y)
									this.setState({ crop_pt: e.nativeEvent.contentOffset })
								}}>
									<Image source={{ uri: asset.uri }} style={{ width: scroll_size, height: asset.scale_height_for_width(scroll_size), resizeMode: "contain" }} />
								</ScrollView>
							</View>
					)
				:
					<View style={{ flexDirection: "row" }}>
						<ScrollView style={{ width: "100%", height: scroll_size, backgroundColor: App.theme_crop_background_color() }} bounces={ false } contentContainerStyle={{ width: scroll_size, height: scroll_size }} onLayout={(e) => {
							this.setState({ scroll_size: e.nativeEvent.layout.width })
						}}>
							<Image source={{ uri: asset.uri }} style={{ width: scroll_size, height: scroll_size, resizeMode: "contain" }} />
						</ScrollView>
					</View>
				}
				
				{ !asset.is_square() ?
					<View style={{ flexDirection: "row" }}>
						<TouchableOpacity
							key={ "toggle_square" }
							style={{ height: 34, paddingLeft: 14, paddingRight: 14, marginTop: 20, marginBottom: 20, marginLeft: 12, marginRight: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: (is_cropped ? App.theme_crop_button_background_color() : App.theme_button_disabled_background_color()), borderRadius: 25 }}
							onPress={() => {
								this.setState({ is_cropped: !is_cropped })
							}}
						>
							<Text style={{ color: (is_cropped ? App.theme_button_text_color() : App.theme_button_disabled_text_color()) }}>
								Crop photo to square 
								{ is_cropped ? <Image source={CheckmarkIcon} style={{ width: 12, height: 12, marginLeft: 5, tintColor: App.theme_button_text_color() }} /> : null }
							</Text>
						</TouchableOpacity>
					</View>
				: null }

				<View style={{ flexDirection: "row" }}>
					<ScrollView style={{ width: "100%", height: 200, backgroundColor: App.theme_filters_background_color() }} bounces={ false } horizontal={ true }>
						{ this._filter_view(asset, "Normal") }
						{ this._filter_view(asset, "Mayfair") }
						{ this._filter_view(asset, "Sepia") }
						{ this._filter_view(asset, "Grayscale", 25) }
					</ScrollView>
				</View>
			</View>
		)
  }

}