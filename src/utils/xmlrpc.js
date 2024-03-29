
class XMLRPC {

	encode_param(param) {
		var result = "";
		if (typeof param == "boolean") {
			result = `<value><boolean>${param}</boolean></value>`
		}
		else if (typeof param == "string") {
			// encoding special chars
			var s = param
			s = s.replace("&", "&amp;")
			s = s.replace("<", "&lt;")
			s = s.replace(">", "&gt;")
			result = `<value><string>${s}</string></value>`
		}
		else if (typeof param == "number") {
			result = `<value><int>${param}</int></value>`
		}
		else if (typeof param == "object") {
			if (Array.isArray(param)) {
				result = result + "<value><array><data>"
				for (let obj of param) {
					result = result + this.encode_param(obj)
				}
				result = result + "</data></array></value>"
			}
			else if (param instanceof Date) {
				var s = param.toISOString()
				result = `<value><dateTime.iso8601>${s}</dateTime.iso8601></value>`
			}
			else {
				result = result + "<value><struct>"
				for (let k in param) {
					result = result + "<member>"
					result = result + `<name>${ k }</name>`
					if (k === 'bits') {
						result = result + `<value><base64>${param[k]}</base64></value>`;
					}
					else {
						result = result + this.encode_param(param[k]);
					}
					result = result + "</member>"
				}
				result = result + "</struct></value>"
			}
		}
		return result
	}

	make_request(method, params ={}) {
		var params_as_xml = `<?xml version=\"1.0\"?><methodCall><methodName>${method}</methodName>`
		params_as_xml = params_as_xml + "<params>"
		for (let obj of params) {
			params_as_xml = params_as_xml + "<param>"
			params_as_xml = params_as_xml + this.encode_param(obj)
			params_as_xml = params_as_xml + "</param>"
		}
		params_as_xml = params_as_xml + "</params>"
		params_as_xml = params_as_xml + "</methodCall>"
		
		//console.log("XML-RPC", params_as_xml)
		
		return params_as_xml
	}

	decode_value(value) {
		var result = null
		
		if (value["string"] != null) {
			result = value["string"]
		}
		else if (value["int"] != null) {
			result = value["int"]
		}
		else if (value["i4"] != null) {
			result = value["i4"]
		}
		else if (value["boolean"] != null) {
			result = value["boolean"]
		}
		else if (value["dateTime.iso8601"]) {
			result = Date.parse(value["dateTime.iso8601"])
		}
		else if (value["array"] != null) {
			result = []
			const values = value["array"]["data"]["value"]
			if (values != undefined) {
				if (Array.isArray(values)) {
					for (let v of values) {
						result.push(this.decode_value(v))
					}
				}
				else {
					// because of JSON conversion, array could be just single item
					result.push(this.decode_value(values))
				}
			}
		}
		else if (value["struct"] != null) {
			result = {}
			const members = value["struct"]["member"]
			for (let m of members) {
				result[m["name"]] = this.decode_value(m["value"])
			}
		}
		
		return result
	}

	from_json(object) {
		return this.decode_value(object["methodResponse"]["params"]["param"]["value"])
	}

}

export default new XMLRPC()