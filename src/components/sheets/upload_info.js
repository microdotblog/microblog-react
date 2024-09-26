import * as React from 'react';
import { useRef } from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Text, View } from 'react-native';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import App from '../../stores/App'
import Clipboard from '@react-native-clipboard/clipboard'
import Toast from 'react-native-simple-toast';

@observer
export default class UploadInfoSheet extends React.Component {  
	constructor(props) {
		super(props);
		this.upload = this.props.payload.upload;
	}

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
					<TouchableOpacity onPress={() => {
						console.log("press");
						App.open_url(this.upload.url);
					}}>
						<Text style={{ fontSize: 16, color: App.theme_text_color(), paddingBottom: 20 }}>{this.upload.url}</Text>
					</TouchableOpacity>
									
					{ this.upload.alt.length > 0 && 
						<View>
							<Text style={{ fontSize: 16, color: App.theme_text_color(), paddingBottom: 22 }}>🤖 {this.upload.alt}</Text>
							<View style={{ alignSelf: "flex-start" }}>
								<TouchableOpacity
									style={{
										padding: 8,
										paddingHorizontal: 15,
										backgroundColor: App.theme_button_background_color(),
										borderRadius: 20,
										borderColor: App.theme_section_background_color(),
										borderWidth: 1
									}}
									onPress={() => {
										Clipboard.setString(this.upload.alt);
										SheetManager.hide(this.props.sheetId);
										setTimeout(function() {
											Toast.showWithGravity("Text copied", Toast.SHORT, Toast.CENTER);
										}, 200);
									}}
								>
									<Text style={{ color: App.theme_button_text_color() }}>Copy Text</Text>
								</TouchableOpacity>
							</View>
						</View>
					}
				</View>
			</ActionSheet>
		)
	}
}
