import { types } from 'mobx-state-tree';

export default Collection = types.model('Collection', {
	id: types.identifierNumber,
	name: types.string,
	uploads_count: types.optional(types.number, 0)
});