import * as React from "react";
import { observer } from "mobx-react";
import { ActivityIndicator, Dimensions, Text, View, Platform } from "react-native";
import App from "../../stores/App";
import { MenuView } from "@react-native-menu/menu";
import { SvgXml } from "react-native-svg";
import { SFSymbol } from "react-native-sfsymbols";
import MBImage from "../common/MBImage";

@observer
export default class TempUploadCell extends React.Component {
  progress_for(upload) {
    const progress = Number(upload.progress)
    if (!Number.isFinite(progress)) {
      return 0
    }
    return Math.max(0, Math.min(100, progress))
  }

  render() {
    const { upload } = this.props;
    const dimension = Dimensions.get("screen")?.width / 4 - 10;
    const preview_uri = upload.cached_uri || upload.uri
    const destructive_icon_color = App.theme_warning_text_color()
    const progress = this.progress_for(upload)
    const progress_width = `${Math.max(progress, progress > 0 ? 4 : 8)}%`
    const progress_label = progress > 1 ? `${progress}%` : "Uploading"
    const actions = [
      {
        title: "Cancel upload",
        id: "cancel",
        image: Platform.select({
          ios: "trash",
        }),
        imageColor: destructive_icon_color,
        attributes: {
          destructive: true,
        },
      },
    ];
    return (
      <MenuView
        style={{
          padding: 5,
          backgroundColor: App.theme_background_color_secondary(),
        }}
        onPressAction={({ nativeEvent }) => {
          const event_id = nativeEvent.event;
          if (event_id === "cancel") {
            upload.cancel_upload();
          }
        }}
        actions={actions}
      >
        <View
          style={{
            width: dimension,
            height: dimension,
            position: "relative",
          }}
        >
          {upload.is_audio() || upload.is_video() ? (
            <View
              style={{
                width: dimension,
                height: dimension,
                borderWidth: 1,
                borderColor: App.theme_placeholder_text_color(),
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Platform.OS === "ios" ? (
                <SFSymbol
                  name={upload.is_audio() ? "waveform" : "film"}
                  color={App.theme_text_color()}
                  size={20}
                  multicolor={false}
                />
              ) : (
                <SvgXml
                  xml={
                    upload.is_audio()
                      ? `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M285 816V336h60v480h-60Zm165 160V176h60v800h-60ZM120 656V496h60v160h-60Zm495 160V336h60v480h-60Zm165-160V496h60v160h-60Z"/></svg>`
                      : `<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m140 256 74 152h130l-74-152h89l74 152h130l-74-152h89l74 152h130l-74-152h112q24 0 42 18t18 42v520q0 24-18 42t-42 18H140q-24 0-42-18t-18-42V316q0-24 18-42t42-18Zm0 212v368h680V468H140Zm0 0v368-368Z"/></svg>`
                  }
                  width={24}
                  height={24}
                  fill={App.theme_text_color()}
                />
              )}
            </View>
          ) : (
            <MBImage
              key={preview_uri}
              source={{ uri: preview_uri }}
              contentFit="cover"
              transition={120}
              cachePolicy="memory-disk"
              recyclingKey={preview_uri}
              style={{
                width: dimension,
                height: dimension,
                borderWidth: 1,
                borderColor: App.theme_placeholder_text_color(),
                borderRadius: 5,
              }}
            />
          )}

          {upload.is_uploading && (
            <>
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,.45)",
                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1,
                }}
              >
                <ActivityIndicator animating={true} color="#fff" size="small" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "600",
                    marginTop: 6,
                  }}
                >
                  {progress_label}
                </Text>
              </View>
              <View
                style={{
                  height: 5,
                  backgroundColor: "rgba(255,255,255,.35)",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  overflow: "hidden",
                  zIndex: 2,
                }}
              >
                <View
                  style={{
                    width: progress_width,
                    height: 5,
                    backgroundColor: App.theme_accent_color(),
                  }}
                />
              </View>
            </>
          )}
        </View>
      </MenuView>
    );
  }
}
