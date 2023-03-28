import * as React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Screens, POSTING_SCREEN } from '../../screens';
import MediaAsset from '../../stores/models/posting/MediaAsset';
import CheckmarkIcon from '../../assets/icons/checkmark.png';
import ImageEditor from "@react-native-community/image-editor";
import { Mayfair, Warm, Cool, Sepia, Vintage, Grayscale } from "react-native-image-filter-kit";

class FilterThumbnail extends React.Component {
	constructor(props) {
		super(props)

		this.asset = props.asset
		this.filter = props.filter
		this.selectHandler = props.select
		this.isSelectedHandler = props.is_selected
		this.currentFilter = "Original"
		this.filteredURI = null
		
		this.onSaveImage = this.onSaveImage.bind(this)
	}
	
	onSaveImage({nativeEvent}) {
		console.log("save image:", this.filter, nativeEvent.uri)
		this.filteredURI = nativeEvent.uri
	}
	
	render() {
		const asset = this.asset
		const filter = this.filter
		const box_style = { width: 120, height: 120, marginTop: 12, marginLeft: 12, marginRight: 12, borderRadius: 5 }
		const selected_box_style = { ...box_style, borderWidth: 2, borderColor: "#FF8800" }

		return (
			<TouchableOpacity onPress={() => {
				this.currentFilter = filter
				if (this.filteredURI == null) {
					this.selectHandler(filter, null)
				}
				else {
					var new_asset = MediaAsset.create({
						uri: this.filteredURI,
						type: asset.type,
						width: asset.width,
						height: asset.height
					})
					
					this.selectHandler(filter, new_asset)
				}
			}}>
				<View>
					{ filter == "Original" ?
						<Image source={{ uri: asset.uri }} style={ this.isSelectedHandler(this.filter) ? selected_box_style : box_style }/>
					: null }
					{ filter == "Mayfair" ?
						<Mayfair extractImageEnabled={true} onExtractImage={this.onSaveImage} image={
							<Image source={{ uri: asset.uri }} style={ this.isSelectedHandler(this.filter) ? selected_box_style : box_style } />
						}/>
					: null }
					{ filter == "Warm" ?
						<Warm extractImageEnabled={true} onExtractImage={this.onSaveImage} image={
							<Image source={{ uri: asset.uri }} style={ this.isSelectedHandler(this.filter) ? selected_box_style : box_style } />
						}/>
					: null }
					{ filter == "Cool" ?
						<Cool extractImageEnabled={true} onExtractImage={this.onSaveImage} image={
							<Image source={{ uri: asset.uri }} style={ this.isSelectedHandler(this.filter) ? selected_box_style : box_style } />
						}/>
					: null }
					{ filter == "Sepia" ?
						<Sepia extractImageEnabled={true} onExtractImage={this.onSaveImage} image={
							<Image source={{ uri: asset.uri }} style={ this.isSelectedHandler(this.filter) ? selected_box_style : box_style } />
						}/>
					: null }
					{ filter == "Vintage" ?
						<Vintage extractImageEnabled={true} onExtractImage={this.onSaveImage} image={
							<Image source={{ uri: asset.uri }} style={ this.isSelectedHandler(this.filter) ? selected_box_style : box_style } />
						}/>
					: null }
					{ filter == "Grayscale" ?
						<Grayscale extractImageEnabled={true} onExtractImage={this.onSaveImage} image={
							<Image source={{ uri: asset.uri }} style={ this.isSelectedHandler(this.filter) ? selected_box_style : box_style } />
						}/>
					: null }
					<Text style={{ color: App.theme_button_text_color(), paddingLeft: 12, marginTop: 12, marginRight: 12, textAlign: "center" }}>{ filter }</Text>
				</View>
			</TouchableOpacity>			
		)
	}
}	

@observer
export default class ImageCropScreen extends React.Component{
	
	constructor (props) {
		super(props)
		
		this.asset = props.asset	
		this.originalAsset = props.asset
		this.state = {
			current_filter: "Original",
			scroll_size: 0,
			is_cropped: true,
			crop_pt: { x: 0, y: 0 }
		}
		
		this.onSelectFilter = this.onSelectFilter.bind(this)
		this.isSelectedFilter = this.isSelectedFilter.bind(this)
		
		Navigation.events().bindComponent(this)
	}
	
	navigationButtonPressed = async ({ buttonId }) => {
		console.log("navigationButtonPressed::", buttonId)
		if (buttonId === "add_image_button") {
			if (this.state.is_cropped) {
				var crop_size = 0
				var scaled_pt = { x: 0, y: 0 }

				if (this.asset.is_landscape()) {
					crop_size = this.asset.height
					scaled_pt.x = this.state.crop_pt.x / this.state.scroll_size * crop_size
				}
				else {
					crop_size = this.asset.width
					scaled_pt.y = this.state.crop_pt.y / this.state.scroll_size * crop_size
				}
				
				const crop_info = {
					offset: scaled_pt,
					size: {
						width: crop_size,
						height: crop_size 
					}
				}
				ImageEditor.cropImage(this.asset.uri, crop_info).then(url => {
					console.log("Cropped image", url)
					this.asset.delete_file()
					var media_asset = MediaAsset.create({
						uri: url,
						type: this.asset.type,
						width: crop_size,
						height: crop_size
					})
					Auth.selected_user.posting.attach_asset(media_asset)
					Navigation.pop(POSTING_SCREEN)
				})
			}
			else {
				Auth.selected_user.posting.attach_asset(this.asset)
				Navigation.pop(POSTING_SCREEN)
			}
		}
	}
  
  	onSelectFilter(filter, new_asset) {
		if (new_asset != null) {
			this.asset = new_asset
		}
		else {
			this.asset = this.originalAsset
		}
		this.setState({ current_filter: filter })
	}
	
	isSelectedFilter(filter) {
		return (this.state.current_filter == filter)
	}
  
	render() {
		const { scroll_size, is_cropped } = this.state
		const asset = this.asset
		
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

				<View style={{ flexDirection: "row", height: "100%", backgroundColor: App.theme_filters_background_color() }}>
					<ScrollView style={{ width: "100%", height: 180 }} bounces={ false } horizontal={ true }>
						<FilterThumbnail asset={asset} filter="Original" select={this.onSelectFilter} is_selected={this.isSelectedFilter} />
						<FilterThumbnail asset={asset} filter="Mayfair" select={this.onSelectFilter} is_selected={this.isSelectedFilter} />
						<FilterThumbnail asset={asset} filter="Warm" select={this.onSelectFilter} is_selected={this.isSelectedFilter} />
						<FilterThumbnail asset={asset} filter="Cool" select={this.onSelectFilter} is_selected={this.isSelectedFilter} />
						<FilterThumbnail asset={asset} filter="Sepia" select={this.onSelectFilter} is_selected={this.isSelectedFilter} />
						<FilterThumbnail asset={asset} filter="Vintage" select={this.onSelectFilter} is_selected={this.isSelectedFilter} />
						<FilterThumbnail asset={asset} filter="Grayscale" select={this.onSelectFilter} is_selected={this.isSelectedFilter} />
					</ScrollView>
				</View>
			</View>
		)
  }

}