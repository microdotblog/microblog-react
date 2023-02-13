import { types } from 'mobx-state-tree';

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
    const regex = /(<[^>]+>)/ig
    let plain_text = self.content
    if(plain_text.search(regex) !== -1){
      plain_text = plain_text.replace(regex, '').replace(/\r\n|\n\r|\n|\r/g, '\n\n')
    }
    if (plain_text.length > 300) {
      plain_text = plain_text.substring(0, 300) + '...'
    }
    return plain_text
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