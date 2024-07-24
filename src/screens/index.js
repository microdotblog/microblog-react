import { Navigation } from "react-native-navigation";
import { Platform } from 'react-native';

// SCREENS
import PostingScreen from "./posts/new";
import PostingOptionsScreen from "./posts/options";
import ImageOptionsScreen from "./posts/image_options";
import ImageCropScreen from "./posts/image_crop";
import PostsScreen from "./posts/posts";
import EditPostScreen from "./posts/edit";
import PostOptionsSettingsScreen from "./settings/post_options";
import ShareScreen from "./share";

export const POSTING_STACK = 'microblog.modal.PostingStack';
export const POSTING_SCREEN = 'microblog.modal.PostingScreen';
export const POSTING_OPTIONS_SCREEN = 'microblog.modal.PostingOptionsScreen';
export const IMAGE_OPTIONS_SCREEN = 'microblog.modal.ImageOptionsScreen';
export const IMAGE_CROP_SCREEN = 'microblog.modal.ImageCropScreen';
export const POSTS_SCREEN = 'microblog.PostsScreen';
export const EDIT_POST_SCREEN = 'microblog.EditPostScreen';
export const POST_OPTIONS_SETTINGS_SCREEN = 'microblog.modal.PostOptionsSettingsScreen';
export const SHARE_SCREEN = 'microblog.modal.ShareScreen';

// COMPONENTS
import ProfileImage from './../components/header/profile_image';
import NewPostButton from './../components/header/new_post';
import ScreenTitle from "../components/header/screen_title";

export const PROFILE_IMAGE = 'microblog.component.ProfileImage'
export const NEW_POST_BUTTON = 'microblog.component.NewPostButton'
export const SCREEN_TITLE = 'microblog.component.ScreenTitle'
export const REFRESH_ACTIVITY = 'microblog.component.RefreshActivity'

// ICONS
import ArrowBackIcon from './../assets/icons/arrow_back.png';

import App from "../stores/App"
import Auth from "../stores/Auth"
import Services from "../stores/Services"

// Set up screens & components
export const Screens = {
  [ POSTING_SCREEN ]: PostingScreen,
  [ POSTING_OPTIONS_SCREEN ]: PostingOptionsScreen,
  [ IMAGE_OPTIONS_SCREEN ]: ImageOptionsScreen,
  [ IMAGE_CROP_SCREEN ]: ImageCropScreen,
  [ POSTS_SCREEN ]: PostsScreen,
  [ EDIT_POST_SCREEN ]: EditPostScreen,
  [ POST_OPTIONS_SETTINGS_SCREEN ]: PostOptionsSettingsScreen,
  [ SHARE_SCREEN ]: ShareScreen,
  // COMPONENTS
  [ PROFILE_IMAGE ]: ProfileImage,
  [ NEW_POST_BUTTON ]: NewPostButton,
  [ SCREEN_TITLE ]: ScreenTitle
}

export const postingScreen = (markdown = null) => {
  const { post_status } = Auth.selected_user?.posting
  if(markdown != null){
    Auth.selected_user?.posting.hydrate_post_with_markdown(markdown)
  }
  return Navigation.showModal({
    stack: {
      id: POSTING_STACK,
      name: POSTING_STACK,
      children: [ {
        component: {
          id: POSTING_SCREEN,
          name: POSTING_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'New Post',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                  icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
                },
              ],
              rightButtons: [
						    {
							    id: 'post_button',
							    text: post_status === "draft" ? "Save" : "Post",
                  color: '#f80'
                },
					    ]
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

export const postingOptionsScreen = (component_id) => {
  const options = {
    component: {
      id: POSTING_OPTIONS_SCREEN,
			name: POSTING_OPTIONS_SCREEN,
			options: {
				topBar: {
					title: {
            text: "Posting Options"
          },
				}
			}
		}
	};

  return Navigation.push(component_id, options);
}

export const imageOptionsScreen = (asset, index, component_id) => {
  console.log("Screens:imageOptionsScreen", asset, index, component_id);

  const options = {
    component: {
      id: IMAGE_OPTIONS_SCREEN,
      name: IMAGE_OPTIONS_SCREEN,
      passProps: {
        asset: asset,
        index: index
      },
      options: {
        topBar: {
          title: {
            text: asset.is_video ? "Video options" : "Image options"
          },
          rightButtons: [
            {
               id: 'remove_image',
               text: "Remove",
               color: 'red',
            }
          ]
        }
      }
    }
  };

  return Navigation.push(component_id, options);
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

export const postsScreen = (component_id) => {
  const options = {
    component: {
      id: POSTS_SCREEN,
      name: POSTS_SCREEN,
      options: {
        topBar: {
          title: {
            text: "Posts"
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            },
            {
              id: 'refresh_indicator',
              text: 'refresh',
              component: {
                name: REFRESH_ACTIVITY,
                passProps: {
                  type: "posts"
                }
              }
            }
          ]
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const editPostScreen = (post) => {
  Auth.selected_user?.posting.hydrate_post_edit(post)
  return Navigation.showModal({
    stack: {
      id: EDIT_POST_SCREEN,
      name: EDIT_POST_SCREEN,
      children: [ {
        component: {
          id: EDIT_POST_SCREEN,
          name: EDIT_POST_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'Edit Post',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                  icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
                },
              ],
              rightButtons: [
                {
                  id: 'post_button',
                  text: 'Update',
                  color: '#f80'
                }
              ]
            },
            layout: {
              backgroundColor: App.theme_background_color()
            }
          }
        },
      } ],
    }
  })
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
