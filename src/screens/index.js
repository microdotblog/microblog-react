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

// Set up screens
export const Screens = new Map();
Screens.set(TIMELINE_SCREEN, TimelineScreen);
Screens.set(MENTIONS_SCREEN, MentionsScreen);
Screens.set(DISCOVER_SCREEN, DiscoverScreen);
Screens.set(LOGIN_SCREEN, LoginScreen);

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
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Timeline'
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
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Mentions'
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
            text: 'Discover'
          },
        },
      },
    }
  ]

  Navigation.setDefaultOptions({});

  return Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'ROOT',
        children: tabs,
      },
    },
  });
  
}

export const loginScreen = (can_dismiss = false) => {
  Navigation.showModal({
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
