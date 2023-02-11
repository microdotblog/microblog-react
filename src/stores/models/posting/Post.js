import { types } from 'mobx-state-tree';
//import { EmojiConvertor } from "emoji-js";

export default Post = types.model('Post', {
  uid: types.identifierNumber,
  name: types.maybe(types.string),
  content: types.maybe(types.string),
  published: types.maybe(types.string),
  url: types.maybe(types.string)
})
.actions(self => ({

}))
.views(self => ({
  
  plain_text_content(){
    const regex = /(<(?!figure|img|\/figure|\/img)[^>]+>)/ig
    let plain_text = self.content.replace(regex, '')
    // TODO: Now we also want to handle any emojis
    // const emoji = new EmojiConvertor()
    // emoji.replace_mode = 'unified';
    // emoji.allow_native = true;
    // plain_text = plain_text.replace(/&#x([a-f0-9]+);/ig, (match, hexCode) => {
    //   return `#x${hexCode}`
    // });
    // plain_text = emoji.replace_unified(plain_text);
    if (plain_text.length > 300) {
      plain_text = plain_text.substring(0, 300) + '...'
    }
    return plain_text.replace(/\r\n|\n\r|\n|\r/g, '\n\n')
  },
  
}))