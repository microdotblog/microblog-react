import { types } from 'mobx-state-tree';

export const blog_services = {
	microblog: { name: "Micro.blog", url: "https://micro.blog/micropub", type: "micropub", description: "Micro.blog hosted blog" },
	xmlrpc: { name: "WordPress", url: "", type: "xmlrpc", description: "WordPress or compatible blog" },
	micropub: { name: "Micropub", url: "", type: "micropub", description: "WordPress or compatible blog" },
};

export default types.enumeration('BlogServices', Object.keys(blog_services));
