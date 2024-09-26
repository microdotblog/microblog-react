import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform, Image } from 'react-native';
import { SFSymbol } from "react-native-sfsymbols";
import App from '../../stores/App';
import TimelineIcon from './../../assets/icons/tab_bar/timeline.png';
import MentionsIcon from './../../assets/icons/tab_bar/mentions.png';
import DiscoverIcon from './../../assets/icons/tab_bar/discover.png';
import BookmarksIcon from './../../assets/icons/nav/bookmarks.png';

@observer
export default class Tab extends React.Component {
  
  _returnIconNameOrAsset() {
    const { route } = this.props;
    const isIOS = Platform.OS === "ios";

    switch (route.name) {
      case "TimelineStack":
        return isIOS ? "bubble.left.and.bubble.right" : TimelineIcon;
      case "MentionsStack":
        return isIOS ? "at" : MentionsIcon;
      case "DiscoverStack":
        return isIOS ? "magnifyingglass" : DiscoverIcon;
      case "BookmarksStack":
        return isIOS ? "star" : BookmarksIcon;
      default:
        return isIOS ? "questionmark" : null;
    }
  }
  
  render() {
    const iconNameOrAsset = this._returnIconNameOrAsset();
    const { focused } = this.props;
    const color = focused ? App.theme_accent_color() : App.theme_text_color();

    if (Platform.OS === "ios") {
      return (
        <SFSymbol
          name={iconNameOrAsset}
          color={color}
          size={18}
          multicolor={false}
        />
      );
    } else {
      return iconNameOrAsset ? (
        <Image
          source={iconNameOrAsset}
          style={{ width: 24, height: 24, tintColor: color }}
        />
      ) : null;
    }
  }
}
