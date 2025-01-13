import * as React from 'react';
import { useRef } from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Text, View, FlatList } from 'react-native';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
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
			collections: []
		};
		
		this.fetch_collections();
	}

	fetch_collections() {
		const service = Auth.selected_user.posting.selected_service;
		MicroPubApi.get_collections(service.service_object(), service.config.destination.uid).then(data => {
			let new_collections = [];
			for (let c of data.items) {
				new_collections.push({
					id: c.properties.uid[0],
					name: c.properties.name[0]
				});
			}
			
			this.setState({ collections: new_collections });
		});
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
				}}
			>
				<CheckmarkRowCell text={item.name} is_selected={false} />
			</TouchableOpacity>
		)
	};

	_key_extractor = (item) => item.id.toString();

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
					<Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_text_color() }}>Select collections for this upload:</Text>
					<View style={{ backgroundColor: App.theme_button_background_color(), padding: 8, borderRadius: 8, marginTop: 8 }}>
						<FlatList
							data={this.state.collections}
							keyExtractor={this._key_extractor}
							renderItem={this._render_collection}
						/>
					</View>
				</View>
			</ActionSheet>
		)
	}
}
