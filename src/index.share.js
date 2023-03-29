import { AppRegistry, View, Text } from "react-native"

ShareMenuModuleComponent = () => {
	return (
		<View>
			<Text>Hello</Text>
		</View>
	)
}

AppRegistry.registerComponent(
	"ShareMenuModuleComponent",
	() => ShareMenuModuleComponent
)