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
  category: types.optional(types.array(types.string), []),
  summary: types.maybeNull(types.string)
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
    if (!self.content) {
      return []
    }
    
    const img_regex = /<img.*?src=["'](.*?)["'].*?>/g
    const video_regex = /<video.*?poster=["'](.*?)["'].*?>/g
    const images = []
    
    let match
    while ((match = img_regex.exec(self.content)) !== null) {
      images.push(match[1])
    }
    
    while ((match = video_regex.exec(self.content)) !== null) {
      const poster = match[1] ? match[1].trim() : ""
      if (poster.length > 0) {
        images.push(poster)
      }
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
