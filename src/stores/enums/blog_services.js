import { types } from 'mobx-state-tree';

export const blog_services = {
	microblog: {name: "Micro.blog", url:"https://micro.blog/micropub", type: "micropub"}
};

export default types.enumeration('BlogServices', Object.keys(blog_services));
