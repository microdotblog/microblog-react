import { Navigation } from "react-native-navigation";

// SCREENS
import TimelineScreen from './timeline/timeline';
import MentionsScreen from './mentions/mentions';
import DiscoverScreen from './discover/discover';
import LoginScreen from './login/login';

export const TIMELINE_SCREEN = 'microblog.TimelineScreen';
export const MENTIONS_SCREEN = 'microblog.MentionsScreen';
export const DISCOVER_SCREEN = 'microblog.DiscoverScreen';
export const LOGIN_SCREEN = 'microblog.LoginScreen';

// COMPONENTS
import ProfileImage from './../components/header/profile_image';

export const PROFILE_IMAGE = 'microblog.component.ProfileImage'

// ICONS
import TimelineIcon from './../assets/icons/tab_bar/timeline.png';
import MentionsIcon from './../assets/icons/tab_bar/mentions.png';
import DiscoverIcon from './../assets/icons/tab_bar/discover.png';

// Set up screens
export const Screens = new Map();
Screens.set(TIMELINE_SCREEN, TimelineScreen);
Screens.set(MENTIONS_SCREEN, MentionsScreen);
Screens.set(DISCOVER_SCREEN, DiscoverScreen);
Screens.set(LOGIN_SCREEN, LoginScreen);

// SET UP COMPONENTS
Screens.set(PROFILE_IMAGE, ProfileImage)

export const startApp = () => {
  const tabs = [
    {
      stack: {
        id: 'TIMELINE_SCREEN',
        children: [{
          component: {
            name: TIMELINE_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Timeline',
                },
                rightButtons: [
                  {
                    id: 'profileButton',
                    text: 'profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  },
                ],
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Timeline',
            icon: TimelineIcon
          },
        },
      },
    },
    {
      stack: {
        id: 'MENTIONS_SCREEN',
        children: [{
          component: {
            name: MENTIONS_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Mentions',
                },
                rightButtons: [
                  {
                    id: 'profileButton',
                    text: 'profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  },
                ],
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Mentions',
            icon: MentionsIcon
          },
        },
      },
    },
    {
      stack: {
        id: 'DISCOVER_SCREEN',
        children: [{
          component: {
            name: DISCOVER_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Discover',
                },
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Discover',
            icon: DiscoverIcon
          },
        },
      },
    }
  ]

  Navigation.setDefaultOptions({
    bottomTab: {
      selectedIconColor: "#f80",
      selectedTextColor: "#f80"
    }
  });

  return Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'ROOT',
        children: tabs,
      }
    },
  });
  
}

export const loginScreen = (can_dismiss = false) => {
  return Navigation.showModal({
    stack: {
      id: 'LOGIN_SCREEN',
      children: [ {
        component: {
          name: LOGIN_SCREEN,
          passProps: {
            can_dismiss: can_dismiss
          },
          options: {
            topBar: {
              title: {
                text: 'Sign in',
              },
            }
          }
        },
      }],
    }
  });
}
