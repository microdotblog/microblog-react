import { types } from 'mobx-state-tree';

export default Collection = types.model('Collection', {
	id: types.identifierNumber,
	name: types.maybe(types.string)
});