import { registerSheet } from 'react-native-actions-sheet';
import LoginMessageSheet from './login_message';
import SheetMenu from './menu';
import ProfileMoreMenu from "./profile_more"
import TagmojiMenu from "./tagmoji";
import PostsDestinationMenu from "./posts_destination";
import TagsMenu from "./tags";
import AddTagsMenu from "./add_tags";
import NotificationsSheetsMenu from "./notifications";
import UploadInfoSheet from "./upload_info";

registerSheet("login-message-sheet", LoginMessageSheet)
registerSheet("main_sheet", SheetMenu);
registerSheet("profile_more_menu", ProfileMoreMenu);
registerSheet("tagmoji_menu", TagmojiMenu);
registerSheet("posts_destination_menu", PostsDestinationMenu);
registerSheet("tags_menu", TagsMenu)
registerSheet("add_tags_sheet", AddTagsMenu)
registerSheet("notifications_sheet", NotificationsSheetsMenu)
registerSheet("upload_info_sheet", UploadInfoSheet)

export { }