import { types } from 'mobx-state-tree';
import { DOMParser } from "@xmldom/xmldom";

let html_parser = new DOMParser({ onError: (error) => {
  // silently ignore errors
}});

export default Post = types.model('Post', {
  uid: types.identifierNumber,
  name: types.maybe(types.string),
  content: types.maybe(types.string),
  published: types.maybe(types.string),
  url: types.maybe(types.string),
  post_status: types.maybe(types.string),
  category: types.optional(types.array(types.string), [])
})
.views(self => ({
  
  plain_text_content(){
    let html = "<p>" + self.content + "</p>";
    var text = "";
    try {
      let doc = html_parser.parseFromString(html, "text/html");
      text = doc.documentElement.textContent;
    }
    catch (error) {
      // if parse error, just show HTML
      text = self.content;
    }

    if (text.length > 300) {
      text = text.substring(0, 300) + '...'
    }
    
    return text;
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
  },
  
  is_draft() {
    return self.post_status == "draft"
  }
  
}))
