import * as React from 'react';
import { useRef } from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Text, View, FlatList, ActivityIndicator } from 'react-native';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import Collection from '../../stores/Collection';
import MicroPubApi, { POST_ERROR } from '../../api/MicroPubApi';
import CheckmarkRowCell from '../../components/cells/checkmark_row_cell';

@observer
export default class CollectionsSheet extends React.Component {  
	constructor(props) {
		super(props);
		this.upload = this.props.payload.upload;
		this.state = {
			is_networking: true,
			collections: [],
			selected_ids: []
		};
	}

	componentDidMount() {
		this.fetch_collections();
	}

	current_service() {
		const service = Auth.selected_user.posting.selected_service;
		return service.service_object();
	}

	current_destination_uid() {
		const service = Auth.selected_user.posting.selected_service;
		return service.config.posts_destination().uid;
	}

	fetch_collections() {
		MicroPubApi.get_collections(this.current_service(), this.current_destination_uid()).then(data => {
			let new_selected = [];
			let new_collections = [];
			for (let c of data.items) {
				const collection_id = c.properties.uid[0];
				const collection_url = c.properties.url[0];

				new_collections.push({
					id: collection_id,
					url: collection_url,
					name: c.properties.name[0]
				});
				
				// check if this upload is in the collection
				MicroPubApi.get_uploads_from_collection(this.current_service(), this.current_destination_uid(), collection_url).then(data => {
					for (let item of data.items) {
						if (item.url == this.upload.url) {
							new_selected.push(collection_id);
							this.setState({ selected_ids: new_selected });
							this.refresh_collections();
						}
					}
				});
			}

			this.setState({ collections: new_collections, is_networking: false });
		});
	}
	
	select_collection(collection) {
		this.setState({ is_networking: true });

		let new_selected = Array.from(this.state.selected_ids);
		if (!this.state.selected_ids.includes(collection.id)) {
			new_selected.push(collection.id);
			
			MicroPubApi.add_upload_to_collection(this.current_service(), this.current_destination_uid(), collection.url, this.upload.url).then(data => {
				this.setState({ selected_ids: new_selected, is_networking: false });
				this.refresh_collections();
			});
		}
		else {
			new_selected = new_selected.filter(item => item != collection.id);
			
			MicroPubApi.remove_upload_from_collection(this.current_service(), this.current_destination_uid(), collection.url, this.upload.url).then(data => {
				this.setState({ selected_ids: new_selected, is_networking: false });
				this.refresh_collections();
			});
		}
	}

	refresh_collections() {
		let new_collections = Array.from(this.state.collections);
		this.setState({ collections: new_collections });
	}

	_render_collection = ({ item }) => {
		return (
			<TouchableOpacity
				key={item.id}
				style={{
					padding: 8,
					marginVertical: 2.5,
					flexDirection: 'row',
					alignItems: 'center',
				}}
				onPress={() => {
					this.select_collection(item);
				}}
			>
				<CheckmarkRowCell text={item.name} is_selected={this.state.selected_ids.includes(item.id)} />
			</TouchableOpacity>
		)
	};

	_key_extractor = (item) => {
		return item.id.toString();
	};

	render() {
		return (
			<ActionSheet
				ref={this.actionSheetRef}
				id={this.props.sheetId}
				snapPoints={[50]}
				initialSnapIndex={[1]}
				overdrawEnabled={true}
				useBottomSafeAreaPadding={true}
				gestureEnabled={true}
				containerStyle={{
				  	backgroundColor: App.theme_background_color_secondary()
				}}
			>
				<View
					style={{
						padding: 15,
						justifyContent: 'center',
						borderRadius: 16,
						paddingBottom: 10,
						marginBottom: 30
					}}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
						<Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_text_color() }}>Select collections for this upload:</Text>
						{ this.state.is_networking && <ActivityIndicator color={App.theme_accent_color()} /> }
					</View>
					<View style={{ backgroundColor: App.theme_button_background_color(), padding: 8, borderRadius: 8, marginTop: 8 }}>
						<FlatList
							data={this.state.collections}
							keyExtractor={this._key_extractor}
							renderItem={this._render_collection}
						/>
					</View>
					
					<View style={{
						alignItems: 'center'
					}}>
						<TouchableOpacity
							style={{
								alignSelf: 'center',
								marginTop: 14,
								marginBottom: 5,
								backgroundColor: App.theme_header_button_background_color(),
								borderColor: App.theme_border_color(),
								borderWidth: 1,
								paddingLeft: 10,
								paddingRight: 10,
								paddingTop: 8,
								paddingBottom: 8,
								borderRadius: 50
							}}
							onPress={() => {
								SheetManager.hide(this.props.sheetId).then(() => {
									App.navigate_to_screen("ManageCollections");
								});
							}}
						>
							<Text>Manage Collections</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ActionSheet>
		)
	}
}
