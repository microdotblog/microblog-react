import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Auth from './../../stores/Auth';
import App from '../../stores/App';
import Collection from '../../stores/Collection';
import MicroPubApi, { POST_ERROR } from '../../api/MicroPubApi';

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

	_render_collection = ({ item }) => {
		return (
			<TouchableOpacity
				key={item.id}
				style={{
					paddingHorizontal: 14,
					paddingVertical: 14,					
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginRight: 5
				}}
				onPress={() => {
					// ...
				}}
			>
				<Text>{item.name}</Text>
				<Text>{item.uploads_count}</Text>
			</TouchableOpacity>
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