(function() {
	if (!window.library) {
		window['library'] = {};
	}


	var node = {//Node 类中nodeType值在IE中无法使用宏，所以在此提供兼容版本
		ELEMENT_NODE: 1,
		ATTRIBUTE_NODE: 2,
		TEXT_NODE: 3,
		DOCUMENT_NODE: 9,
		DOCUMENT_TYPE_NODE: 10
	};
	window['library']['node'] = node;









	function $() {
		var elements = [];
		var i = 0;
		var len = arguments.length;
		var ele = null;
		for (i = 0; i < len; i++) {
			ele = arguments[i];
			if (typeof ele === 'string') {
				ele = document.getElementById(ele);
			}
			if (len === 1) {
				return ele;
			}
			elements.push(ele);
		}
		return elements;
	}
	window['library']['$'] = $;

	function addEvent(obj, type, fn) {
		if (obj.addEventListener) {
			obj.addEventListener(type, fn, false);
		} else {
			var iden = 'e' + type + fn;
			obj[iden] = fn;
			obj.attachEvent('on' + type, function() {
				obj[iden](window.event);
			});
			// 这中做法解决了IE浏览器中，事件监听器函数内部this值的引用问题
		}
	}
	window['library']['addEvent'] = addEvent;

	// 
	// 这个函数类似与jquery的$(document).ready(),可以添加DOM树载入完成的事件监听器
	// 
	function addLoadEvent(fn) {
		var init = function() {
			if (arguments.callee.done) {
				return;
			}
			arguments.callee.done = true;
			fn.call(document, arguments);
		};

		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', init, false); //兼容IE9 和其它现代浏览器
		}
		(function() {
			try {
				document.documentElement.doScroll('left');
			} catch (e) {
				setTimeout(arguments.callee, 50);
				return;
			}
			init();
		})(); //兼容IE8及以下		
	}
	window['library']['addLoadEvent'] = addLoadEvent;

	//获得事件对象
	function getEventObject(W3CEvent) {
		return W3CEvent || window.event;
	}
	window['library']['getEventObject'] = getEventObject;

	//获得事件的目标对象
	function getTarget(W3CEvent) {
		W3CEvent = getEventObject(W3CEvent);
		return W3CEvent.target || W3CEvent.srcElement;
	}
	window['library']['getTarget'] = getTarget;

	function getMouseButton(W3CEvent) {
		W3CEvent = getEventObject(W3CEvent);
		var button = {
			'left': false,
			'middle': false,
			'right': false
		};
		if (W3CEvent.toString && W3CEvent.toString().indexOf('MouseEvent') !== -1) {
			switch (W3CEvent.button) {
				case 0:
					button.left = true;
					break;
				case 1:
					button.middle = true;
					break;
				case 2:
					button.right = true;
					break;
				default:
					break;
			}
		} else if (W3CEvent.button >= 0) {
			switch (W3CEvent.button) {
				case 0:
					button.left = true;
					break; //---------------测试中发现，无论按那个键都显示为0
				case 1:
					button.left = true;
					break;
				case 2:
					button.right = true;
					break;
				case 3:
					button.left = true;
					button.right = true;
					break;
				case 4:
					button.middle = true;
					break;
				case 5:
					button.left = true;
					button.middle = true;
					break;
				case 6:
					button.middle = true;
					button.right = true;
					break;
				case 7:
					button.left = true;
					button.right = true;
					button.middle = true;
					break;
				default:
					break;


			}
		} else {
			return false;
		}
		return button;
	}
	window['library']['getMouseButton'] = getMouseButton;

	function getPointerPositionInDocument(W3CEvent) {
		W3CEvent = getEventObject(W3CEvent);
		var x = 0;
		var y = 0;
		x = W3CEvent.pageX || (W3CEvent.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
		y = W3CEvent.pageY || (W3CEvent.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
		return {
			x: x,
			y: y
		};
	}
	window['library']['getPointerPositionInDocument'] = getPointerPositionInDocument;

	function getKeyPressed(W3CEvent) {
		W3CEvent = getEventObject(W3CEvent);
		var code = W3CEvent.keyCode;
		var value = String.fromCharCode(code);
		return {
			code: code,
			value: value
		}
	}
	window['library']['getKeyPressed'] = getKeyPressed;

	function camelize(s) {
		var reg = /-(\w)/g;
		return s.replace(reg,function(strMatch,p1){
			return p1.toUpperCase();
		});
	}//将一个中划线连接的字符串换成驼峰形式


	function walkTheDOMRecursive(func,node,depth,returnedFromParent) {//对dom树进行深度递归遍历
		var root = node || document;
		returnedFromParent = func.call(root,depth,returnedFromParent);
		depth++;
		node = root.firstChild;
		while(node) {
			walkTheDOMRecursive(func,node,depth,returnedFromParent);
			node = node.nextSibling;
		}
	}
	window['library']['walkTheDOMRecursive'] = walkTheDOMRecursive;


})();

if (!String.prototype.repeat) {
	String.prototype.repeat = function(l) {
		return new Array(l + 1).join(this); //重复字符生成字符串
	}
}
if (!String.prototype.trim) {
	String.prototype.trim = function() {
		var reg = /^\s+|\s*$/g; //清除字符串开头和结尾的空格
		return this.replace(reg, '');
	}
}