import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import Auth from './../../stores/Auth';
import App from '../../stores/App';
import Collection from '../../stores/Collection';
import CollectionCell from '../../components/cells/collection_cell';
import MicroPubApi, { POST_ERROR } from '../../api/MicroPubApi';
import ContextMenu from 'react-native-context-menu-view';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-simple-toast';

@observer
export default class CollectionsScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			is_networking: true,
			collections: []
		};
	}
	
	componentDidMount() {
		this.fetch_collections();

		this.focusListener = this.props.navigation.addListener('focus', () => {
			this.fetch_collections();
		});
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
					name: c.properties.name[0],
					uploads_count: c.properties["microblog-uploads-count"]
				});
			}
	
			this.setState({ collections: new_collections, is_networking: false });
		});
	}

	delete_collection(collection) {
		MicroPubApi.delete_collection(this.current_service(), this.current_destination_uid(), collection.url).then(data => {
			this.fetch_collections();
		});
	}

	prompt_delete(collection) {
		Alert.alert("Delete collection", 
			`Are you sure you want to delete the collection ${collection.name}?`,
			[
				{
					text: "Cancel",
					style: 'cancel',
				},
				{
					text: "Delete",
					onPress: () => {
						this.delete_collection(collection);
					},
					style: 'destructive'
				},
			],
			{ cancelable: false },
		);
	}

	copy_shortcode(collection) {		
		const s = `<{{ collection "${collection.name}" }}>`;
		Clipboard.setString(s);
		Toast.showWithGravity("Shortcode copied", Toast.SHORT, Toast.CENTER);
	}

	_collection_context_menu = [
		{
			title: "Copy Shortcode",
			id: "copy_shortcode",
			systemIcon: 'curlybraces'
		},
		{
			title: "Delete",
			id: "delete",
			systemIcon: 'trash',
			destructive: true
		}
	];

	_render_collection = ({ item }) => {
		return (
			<ContextMenu
				previewBackgroundColor="rgba(0, 0, 0, 0.0)"
				style={{
					padding: 5,
					backgroundColor: App.theme_background_color_secondary()
				}}
				onPress={({nativeEvent}) => {
					if (nativeEvent.name == "Copy Shortcode") {
						this.copy_shortcode(item);
					}
					else if (nativeEvent.name == "Delete") {
						this.prompt_delete(item);
					}
				}}
				actions={this._collection_context_menu}
			>
				<CollectionCell collection={item} manager={this} />
			</ContextMenu>
		)
	};
	
	_key_extractor = (item) => {
		return item.id.toString();
	};
		
	render() {
		return (
			<View style={{ paddingTop: 5 }}>
				<FlatList
					data={this.state.collections}
					keyExtractor={this._key_extractor}
					renderItem={this._render_collection}
				/>
			</View>
		);
	}
}