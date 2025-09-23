# Commands

- Build: `yarn ios` / `yarn android`
- Test: `yarn test` (single test: `yarn test -- path/to/test.js`)
- Lint: `yarn lint`
- Start: `yarn start`

# Code Style

- **Naming**: Snake_case for MobX properties (is_loading), camelCase for methods/functions
- **Imports**: React/\* → RN components → local imports (stores, components, utils)
- **Components**: Class components with `@observer` decorator
- **Async**: Use async/await with MobX flows for state mutations
- **Formatting**: No semicolons, 2-space indentation
- **Error handling**: Try/catch with console.log for debugging, return error constants
- **File extension**: .js (not .jsx)

# Architecture

- **State**: MobX State Tree stores in `src/stores/`
- **Navigation**: React Navigation v6 with stack/bottom tabs
- **API**: Axios-based services in `src/api/`
- **Components**: Feature-organized in `src/screens/`, reusable in `src/components/`

# General Rules

- Use `bun` commands instead of `yarn` when available
- Follow snake_case convention for state properties
- Use @observer decorators for reactive components
- Prefer async/await over promises for API calls

## Development Commands

### Setup
- `yarn` or `npm install` - Install dependencies (Yarn preferred for lockfile consistency)
- `npx pod-install ios` or `yarn pods` - Install iOS CocoaPods dependencies
- `yarn adb` - Set up Android reverse proxy for Metro bundler (run after starting emulator)

### Running the App
- `yarn start` - Start Metro bundler
- `yarn ios` - Run on iOS simulator
- `yarn android` - Run on Android emulator
- `yarn lint` - Run ESLint
- `yarn test` - Run Jest tests

### Dependency Management
- `yarn check-dependencies` - Check dependency alignment
- `yarn fix-dependencies` - Fix dependency alignment with --write flag
- `yarn postinstall` - Apply patches via patch-package

## Architecture Overview

### State Management
- **MobX State Tree (MST)** for global state management with stores in `src/stores/`
- Main app store in `src/stores/App.js` handles navigation, theming, modals, and global UI state
- Authentication managed in `src/stores/Auth.js`
- User-specific state organized under selected user models

### Navigation Structure
- **React Navigation v6** with native stack and bottom tab navigators
- Main tab navigator: Timeline, Mentions, Bookmarks, Discover
- Modal screens for posting, editing, settings, etc.
- Deep linking support for micro.blog URLs and app-specific schemes

### API Layer
- Three API services: `MicroBlogApi.js` (main), `MicroPubApi.js`, `XMLRPCApi.js`
- Axios-based HTTP client with base URL `https://micro.blog`
- Token-based authentication with auto-refresh handling

### UI Components
- **React Native with custom theming** supporting light/dark modes
- Extensive use of WebViews for timeline display with hybrid native/web interaction
- Action sheets via `react-native-actions-sheet` for modal interactions
- Custom header components and navigation buttons

### File Organization
- `src/screens/` - Screen components organized by feature
- `src/components/` - Reusable UI components (cells, headers, sheets, etc.)
- `src/stores/` - MobX State Tree stores and models
- `src/api/` - API service classes
- `src/utils/` - Utility functions

### Platform-Specific Features
- **iOS**: Share extension, push notifications, custom text highlighting
- **Android**: Share menu integration, Firebase notifications
- Native modules for enhanced text editing and image handling

### Key Patterns
- **Observer pattern** with `@observer` decorators for MobX reactivity
- **Snake_case naming** convention (author's preference over camelCase)
- **Async/await with MobX flows** for state mutations
- **WebView/native hybrid** approach for timeline rendering

### Testing
- Jest configured with React Native preset
- Test files should follow standard Jest patterns

### Development Notes
- Push notifications require `google-services.json` for Android (excluded from git)
- iOS requires proper signing for push notification capabilities  
- Metro bundler runs on port 8081 (use `yarn adb` if Android can't connect)
- Patch-package used for React Native dependency modifications

### Authentication Flow
- Email-based login with token verification
- App token support as alternative login method
- Multi-account support with user switching
- Deep link handling for signin URLs

### Notes
- Don't add a semicolon at the end of a line
