import * as React from 'react';
import { useRef } from 'react';
import { observer } from 'mobx-react';
import { ScrollView } from 'react-native';
import ActionSheet, { useScrollHandlers, ActionSheetRef } from "react-native-actions-sheet";
import App from '../../stores/App'
import SheetHeader from "./header";

@observer
export default class TagsMenu extends React.Component{
  
  constructor(props){
    super(props);
    this.actionSheetRef = useRef<ActionSheetRef>(null)
    this.scrollHandlers = useScrollHandlers<ScrollView>(
      "tag-scroll",
      this.actionSheetRef
    )
  }
  
  render() {
    return(
      <ActionSheet
        ref={this.actionSheetRef}
        id={this.props.sheetId}
        snapPoints={[40,95]}
        initialSnapIndex={[1]}
        overdrawEnabled={true}
        useBottomSafeAreaPadding={true}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary()
        }}
      >
      <SheetHeader title="Tags" />
      <ScrollView style={{maxHeight: 700, marginBottom: 15}} {...this.scrollHandlers}>
      </ScrollView>
      </ActionSheet>
    )
  }
  
}