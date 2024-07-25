import { Navigation } from "react-native-navigation";
import { Platform } from 'react-native';

// SCREENS
import ImageCropScreen from "./posts/image_crop";
import PostOptionsSettingsScreen from "./settings/post_options";
import ShareScreen from "./share";

export const IMAGE_CROP_SCREEN = 'microblog.modal.ImageCropScreen';
export const POST_OPTIONS_SETTINGS_SCREEN = 'microblog.modal.PostOptionsSettingsScreen';
export const SHARE_SCREEN = 'microblog.modal.ShareScreen';

// ICONS
import ArrowBackIcon from './../assets/icons/arrow_back.png';

import App from "../stores/App"
import Services from "../stores/Services"

// Set up screens & components
export const Screens = {
  [ IMAGE_CROP_SCREEN ]: ImageCropScreen,
  [ POST_OPTIONS_SETTINGS_SCREEN ]: PostOptionsSettingsScreen,
  [ SHARE_SCREEN ]: ShareScreen
}

export const imageCropScreen = async (asset, component_id) => {
  console.log("Screens:imageCropScreen");

  const new_asset = await asset.save_to_temp()

  const options = {
    component: {
      id: IMAGE_CROP_SCREEN,
      name: IMAGE_CROP_SCREEN,
      passProps: {
        asset: new_asset
      },
      options: {
        topBar: {
          title: {
            text: "Photo"
          },
          rightButtons: [
            {
              id: 'add_image_button',
              text: 'Add Photo',
              color: App.theme_accent_color()
            }
          ]
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const postOptionsSettingsScreen = async (user, component_id, open_as_modal = false) => {
  console.log("Screens:postOptionsSettingsScreen", user, component_id);
  await Services.hydrate_with_user(user)
  const component = {
    component: {
      id: POST_OPTIONS_SETTINGS_SCREEN,
      name: POST_OPTIONS_SETTINGS_SCREEN,
      passProps: {
        user: user
      },
      options: {
        topBar: {
          title: {
            text: "Post Options"
          },
          ...open_as_modal &&
          {
            leftButtons: [
              {
                id: 'close_modal_button',
                text: 'Close',
                icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
              },
            ]
          }
        }
      }
    }
  }
  if(open_as_modal){
    return Navigation.showModal({
      stack: {
        id: POST_OPTIONS_SETTINGS_SCREEN,
        name: EDIT_PAGE_SCREEN,
        children: [component],
      }
    });
  }
  else{
    return Navigation.push(component_id, component);
  }
}

export const shareScreen = () => {
  return Navigation.showModal({
    stack: {
      id: POSTING_STACK,
      name: POSTING_STACK,
      children: [ {
        component: {
          id: SHARE_SCREEN,
          name: SHARE_SCREEN,
          options: {
            topBar: {
              visible: false
            },
            layout: {
              backgroundColor: App.theme_background_color()
            }
          }
        },
      }],
    }
  });
}
