(function() {

	var requiredVariables = "";
	var domCode = "";
	var nodeNameCounters = [];
	var newVaribales = "";

	function encode(str) {
		if (!str) {
			return null;
		}
		str = str.replace(/\\/g, '\\\\');
		str = str.replace(/'/g, "\\'");
		str = str.replace(/\s+^/gm, '\\n');
		return str;
	}

	function checkForVariable(v) {
		if (v.indexOf('$') === -1) {
			v = "'" + v + "'";
		} else {
			v = v.substring(v.indexOf($) + 1);
			requiredVariables += 'var' + v + ';\n';
		}
		return v;
	}


	function processAttribute(depth,ref) {
		if (this.nodeType !== lib.node.ATTRIBUTE_NODE) {
			return;
		}
		var attributeValue = this.nodeValue ? encode(this.nodeValue.trim()) : '';
		if(!attributeValue) {
			return;
		}
		var tabs = depth ? '\t'.repeat(parseInt(depth)) : '';
		switch(this.nodeName) {
			default:
				if (this.nodeName.substring(0,2) === 'on') {
					domCode += tabs + ref + '.' + this.nodeName + '=function(){'+attributeValue+'}'+'\n';
				} else {
					domCode += tabs + ref + '.' +
					 'setAttribute(\''+this.nodeName+'\', '+checkForVariable(attributeValue)+');'+
					'\n';
				}
				break;
			case 'class':
				domCode += tabs + ref + '.className=' +checkForVariable(attributeValue)+';\n';
				break;
			case 'style':
				var style = attributeValue.split(/\s*;\s*/);
				if(style) {
					for(var pair in style) {
						if(!style[pair]) {
							continue;
						}
						var prop = style[pair].split(/\s*:\s*/);
						if(!prop[1]) {
							continue;
						}
						prop[0] = lib.camelize(prop[0]);
						var propValue = checkForVariable(prop[1]);
						if(prop[0] === 'float') {
							domCode += tabs + ref + '.style.cssFloat=' + propValue +';\n';
							domCode += tabs + ref + '.style.styleFloat=' + propValue +';\n';
						} else {
							domCode += tabs + ref + '.style.' + prop[0] + '=' + propValue + ';\n';
						}
					}
				}
				break;

		}

	}


	function processNode(depth,refParent) {
		var tabs = depth ? '\t'.repeat(parseInt(depth)) : '';
		switch (this.nodeType) {
			case lib.node.ELEMENT_NODE:
				if(nodeNameCounters[this.nodeName]) {
					++nodeNameCounters[this.nodeName];
				} else {
					nodeNameCounters[this.nodeName] = 1;
				}

				var ref = this.nodeName.toLowerCase()+nodeNameCounters[this.nodeName];//构造元素名
				domCode += tabs + 'var ' + ref + '=document.createElement(\''+this.nodeName+'\');'+'\n';
				newVaribales += '' + ref + ';\n';

				if(this.attributes) {
					for(var i = 0; i < this.attributes.length;i++) {
						processAttribute.call(this.attributes[i],depth,ref);
					}
				}
				break;
			case lib.node.TEXT_NODE:
				var value = this.nodeValue ? encode(this.nodeValue.trim()) : '';
				if(value) {
					if(nodeNameCounters['txt']) {
						nodeNameCounters['txt']++;
					} else {
						nodeNameCounters['txt'] = 1;
					}
					var ref = 'txt' + nodeNameCounters['txt'];//构造字符串变量名
					value = checkForVariable(value);//处理字符串，添加单引号，或者，提取变量
					domCode += tabs + 'var ' + ref + '=document.createTextNode('+value+');\n';
					newVaribales += '' + ref + ';\n';
				} else {
					return;
				}
				break;
			default: 
				break;
		}
		if(refParent) {
			domCode += tabs + refParent + '.appendChild('+ref+');\n';
		}
		return ref;
	}

	function generate(strHTML,strRoot) {
		var domRoot = document.createElement('DIV');
		domRoot.innerHTML = strHTML;

		domCode = "";
		nodeNameCounters = [];
		requiredVariables = "";
		newVaribales = ""

		var node = domRoot.firstChild;
		while (node) {
			lib.walkTheDOMRecursive(processNode, node, 0,strRoot);
			node = node.nextSibling;
		}
		domCode = '/*requiredVariables in this code' + requiredVariables + '*/\n\n' +
			domCode + '\n\n' +
			'/*new objects in this code\n' + newVaribales + '*/\n\n';
		return domCode;

	}

	window['generateDOM'] = generate;

})();