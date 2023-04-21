import { types } from 'mobx-state-tree';

export const blog_services = {
	microblog: { name: "Micro.blog", url: "https://micro.blog/micropub", type: "micropub", description: "Micro.blog hosted weblog" },
	xmlrpc: { name: "WordPress", url: "", type: "xmlrpc", description: "WordPress or compatible weblog" },
	micropub: { name: "Micropub", url: "", type: "micropub" },
};

export default types.enumeration('BlogServices', Object.keys(blog_services));
