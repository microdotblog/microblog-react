import * as React from "react";
import { observer } from "mobx-react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import App from "../../stores/App";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { RectButton } from "react-native-gesture-handler";
import { SvgXml } from "react-native-svg";
import ContextMenu from "react-native-context-menu-view";
import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "react-native-simple-toast";

@observer
export default class CollectionCell extends React.Component {
  constructor(props) {
    super(props);
    this._swipeable = React.createRef();
  }

  _right_actions = (progress, item) => (
    <View style={{ flexDirection: "row" }}>
      <View>
        {this._return_action(
          "Delete",
          "rgb(239,68,68)",
          60,
          progress,
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M 21 2 C 19.354545 2 18 3.3545455 18 5 L 18 7 L 10.154297 7 A 1.0001 1.0001 0 0 0 9.984375 6.9863281 A 1.0001 1.0001 0 0 0 9.8398438 7 L 8 7 A 1.0001 1.0001 0 1 0 8 9 L 9 9 L 9 45 C 9 46.645455 10.354545 48 12 48 L 38 48 C 39.645455 48 41 46.645455 41 45 L 41 9 L 42 9 A 1.0001 1.0001 0 1 0 42 7 L 40.167969 7 A 1.0001 1.0001 0 0 0 39.841797 7 L 32 7 L 32 5 C 32 3.3545455 30.645455 2 29 2 L 21 2 z M 21 4 L 29 4 C 29.554545 4 30 4.4454545 30 5 L 30 7 L 20 7 L 20 5 C 20 4.4454545 20.445455 4 21 4 z M 11 9 L 18.832031 9 A 1.0001 1.0001 0 0 0 19.158203 9 L 30.832031 9 A 1.0001 1.0001 0 0 0 31.158203 9 L 39 9 L 39 45 C 39 45.554545 38.554545 46 38 46 L 12 46 C 11.445455 46 11 45.554545 11 45 L 11 9 z M 18.984375 13.986328 A 1.0001 1.0001 0 0 0 18 15 L 18 40 A 1.0001 1.0001 0 1 0 20 40 L 20 15 A 1.0001 1.0001 0 0 0 18.984375 13.986328 z M 24.984375 13.986328 A 1.0001 1.0001 0 0 0 24 15 L 24 40 A 1.0001 1.0001 0 1 0 26 40 L 26 15 A 1.0001 1.0001 0 0 0 24.984375 13.986328 z M 30.984375 13.986328 A 1.0001 1.0001 0 0 0 30 15 L 30 40 A 1.0001 1.0001 0 1 0 32 40 L 32 15 A 1.0001 1.0001 0 0 0 30.984375 13.986328 z"/></svg>`,
          item
        )}
      </View>
    </View>
  );

  _trigger_delete = () => {
    const { collection, manager } = this.props;
    manager.prompt_delete(collection);
  };

  _return_action = (
    text,
    color,
    x,
    progress,
    icon,
    item,
    manager,
    stroke = "#fff"
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });

    const press_handler = () => {
      this._trigger_delete(manager, item);
      this._swipeable?.current?.close();
    };

    return (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: color,
          transform: [{ translateX: trans }],
        }}
      >
        <RectButton
          style={{
            backgroundColor: color,
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            padding: 5,
            paddingHorizontal: 15,
          }}
          onPress={press_handler}
        >
          <SvgXml xml={icon} width={24} height={24} stroke={stroke} />
        </RectButton>
      </Animated.View>
    );
  };

  render() {
    const { collection, manager } = this.props;
    return (
      <Swipeable
        ref={this._swipeable}
        friction={1}
        overshootFriction={8}
        enableTrackpadTwoFingerGesture={true}
        renderRightActions={(progress) =>
          this._right_actions(progress, collection)
        }
      >
        <View
          key={collection.id}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginRight: 5,
          }}
        >
          <Text style={{ color: App.theme_text_color() }}>
            {collection.name}
          </Text>
          <Text style={{ color: App.theme_text_color() }}>
            {collection.uploads_count}
          </Text>
        </View>
      </Swipeable>
    );
  }
}
