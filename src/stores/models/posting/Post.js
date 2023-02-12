import { types } from 'mobx-state-tree';
import { DOMParser } from "@xmldom/xmldom";

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
    let html = "<p>" + self.content + "</p>";
    let parser = new DOMParser();    
    let doc = parser.parseFromString(html, "text/html");
    let plain_text = doc.documentElement.textContent;

    if (plain_text.length > 300) {
      plain_text = plain_text.substring(0, 300) + '...'
    }
    return plain_text.replace(/\r\n|\n\r|\n|\r/g, '\n\n')
  },
  
  images_from_content(){
    const regex = /<img.*?src=["'](.*?)["'].*?>/g
    const images = []
    
    let match
    while ((match = regex.exec(self.content)) !== null) {
      images.push(match[1])
    }
    
    return images;
  },
  
  nice_local_published_date(){
    const date = new Date(self.published);
    return date.toLocaleString();
  }
  
}))