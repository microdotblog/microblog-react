import { types } from 'mobx-state-tree';

export default Highlight = types.model('Highlight', {
  id: types.identifierNumber,
  title: types.maybe(types.string),
  content_text: types.maybe(types.string),
  url: types.maybe(types.string),
  date_published: types.maybe(types.string),
})