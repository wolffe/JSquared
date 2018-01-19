/*!
 * JSquared v2.1.1
 * https://getbutterfly.com/jsquared/
 *
 * Copyright (c) 2009-2018 by Ciprian Popescu
 * Copyright (c) 2007-2009 by James Norton
 *
 * This file is part of JSquared.
 *
 * JSquared is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JSquared is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with JSquared.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 *
 * @fileOverview JSquared Core Library
 * @name JSquared
 *
 * @namespace Root namespace for holding all JSquared objects
 * @name J2
 *
 * The version of the library in use
 * @name version
 * @memberOf J2
 * @type Float
 */
/*@cc_on @*/
var J2 = new (function() {
	this.version = '2.1.1';
});
/**
* @namespace Container for core JSquared functions and objects
* @name J2.Core
* @memberOf J2
*/
J2.Core = new (function() {
	/**
	* Generic event handler for built-in or custom events.
	* Events are sorted based on sort index provided when adding a new event handler
	* with a default sort index of 99. Sort order is descending (higher numbers run first), 
	* range 999 to -999. 
	* Each instance gets a static class member - eventIndexes
	* @memberOf J2.Core
	* @name Event
	* @constructor 
	*/
	this.Event = function() {
		//create events array for storing the handlers and event handler object
		var events = [],
			handler = new (function() {
				var tempEvents,
					eventsAdded = false,
					eventsRemoved = false;
				this.firing = false;
				function start() {
					this.firing = true;
					tempEvents = [];
					eventsAdded = eventsRemoved = false;
				}
				function end() {
					if (eventsRemoved) {
						for (var i = events.length-1; i>=0; i--) {
							if (events[i][3]) events.splice(i, 1);
						}
					}
					if (eventsAdded) {
						for (var i = tempEvents.length-1; i>=0; i--)
							events.push(tempEvents[i]);
					}
					this.firing = false;
				}
				this.fire = function() {
					start.call(handler);
					var	returnVal = true, 
						funcReturnVal,
						i = 0,
						j = events.length;
					//sort the event handlers by the event indexes
					events.sort(function(a, b) {
						return a[2] === b[2] ? 0 : (a[2] < b[2] ? 1 : -1);
					});
					//loop through the event handlers and call the function in the scope of source element
					for (i; i < j; i++) {
						//store the return value from each handler.  If any are false, set the master event return value to false
						funcReturnVal = events[i][0].apply(events[i][1], arguments);
						if (returnVal && funcReturnVal === false) returnVal = false;
					} 
					end.call(handler);
					return returnVal;
				}
				this.listen = function(event) {
					eventsAdded = true;
					tempEvents.push(event);
				}
				this.removeListener = function(i) {
					eventsRemoved = true;
					events[i][3] = true;
				}
				this.removeAllListeners = function() {
					for (var i = events.length-1; i>=0; i--)
						this.removeListener(i);
				}
			});
		
		this.handler = handler;
		this.events = events;
		
		/**
		* Contains accessor methods for the first and last indexes.
		* Created automatically with each instance of J2.Core.Event
		* @class
		* @static
		* @name eventIndexes
		* @memberOf J2.Core.Event
		*/
		this.eventIndexes = new (function() {
			var first = 999, last = -999;
			/**
			* Retrieve the first index.
			* Decrements the value of the first index each time. 
			* @name first
			* @function
			* @memberOf J2.Core.Event.eventIndexes
			* @return {Number}
			*/
			this.first = function() { return first--; };
			/**
			* Retrieve the last index.
			* Increments the value of the first index each time. 
			* @name last
			* @function
			* @memberOf J2.Core.Event.eventIndexes
			* @return {Number}
			*/
			this.last = function() { return last++; };
		});
		/**
		* Add a new subscriber to this event 
		* @name listen
		* @memberOf J2.Core.Event
		* @function
		* @param {Function} fn The function to subscribe to this event handler
		* @param {Object} [context] The context that the handler should be called in.  Defaults to the event handler object itself.
		* @param {Number} [sortIndex] The sort index for this subscriber
		* @return {Function} The function subscribed to the event handler
		*/
		this.listen = function(fn, context, sortIndex) {
			var event = [fn, context || this, sortIndex || 99]
			if (handler.firing)
				handler.listen(event);
			else
				events.push(event);
			return fn;
		};
		/**
		* Remove a subscriber from this event
		* @name removeListener
		* @memberOf J2.Core.Event
		* @function
		* @param {Function} fn The function to remove as a subscriber from the event handler
		*/
		this.removeListener = function(fn) {
			//find the event handler
			//the event handler could have been added multiple times hence loop through complete array
			for (var i = events.length - 1; i >= 0; i--) {
				if (events[i][0] === fn) {
					if (handler.firing)
						handler.removeListener(i);
					else
						events.splice(i, 1);
				}
			}
		};
		/**
		* Remove all subscribers from this event
		* @name removeAllListeners
		* @memberOf J2.Core.Event
		* @function
		*/
		this.removeAllListeners = function() {
			if (handler.firing)
				handler.removeAllListeners();
			else
				events = [];
		}
		/**
		* Event handler binding function.
		* Use this function to fire the event this instance of the J2.Core.Event is being used for
		* Can be called directly to manually fire the event handling routing
		* @name fire
		* @memberOf J2.Core.Event
		* @function
		* @param {Object} e Event object (or empty object for manual firing)
		* @return {Boolean} Subscriber return values.  Default return is true. If any subscriber returns false, handleEvent will return false
		*/
		this.fire = handler.fire;
	};
	//load event handler
	var loadEventHandler = new this.Event();
	/**
	* Add a load event subscriber 
	* @name addLoadEvent
	* @function
	* @type J2.Core.Event
	* @param {Function} fn The function to subscribe to the load event
	* @param {Number} [sortIndex] The sort index for this subscriber
	* @return {Function} The function subscribed to the event handler
	* @see J2.Core.Event
	*/
	addLoadEvent = loadEventHandler.listen;
	/**
	* Contains the first and last methods of J2.Core.Event.eventIndexes.  
	* Specific to the load event handler
	* @name loadEventIndexes
	* @static
	* @see J2.Core.Event.eventIndexes
	*/
	loadEventIndexes = loadEventHandler.eventIndexes;
	if (typeof window.onload === "function")
		loadEventHandler.listen(window.onload, null, loadEventHandler.eventIndexes.first());
	window.onload = loadEventHandler.fire;
	//DOMContentReady event handler
	var domReadyEventHandler = new this.Event();
	/**
	* Add a DOMContentReady event subscriber
	* @name addDOMReadyEvent
	* @function
	* @type J2.Core.Event
	* @param {Function} fn The function to subscribe to the DOMContentReady event
	* @param {Number} [sortIndex] The sort index for this subscriber
	* @return {Function} The function subscribed to the event handler
	* @see J2.Core.Event
	*/
	addDOMReadyEvent = domReadyEventHandler.listen;
	/**
	* Contains the first and last methods of J2.Core.Event.eventIndexes.  
	* Specific to the DOMContentReady event handler
	* @name DOMReadyEventIndexes
	* @static
	* @see J2.Core.Event.eventIndexes
	*/
	DOMReadyEventIndexes = loadEventHandler.eventIndexes;
	
	//add tidy up listeners
	loadEventHandler.listen( function() { delete loadEventIndexes; delete addLoadEvent; }, window, -Infinity );
	domReadyEventHandler.listen( function() { delete DOMReadyEventIndexes; delete addDOMReadyEvent; }, window, -Infinity );
	
	if (navigator.userAgent.search(/WebKit/i) !== -1) {
		window.DOMLoadTimer = setInterval(function () {
			if (document.readyState.search(/loaded|complete/i) !== -1) {
				clearInterval(window.DOMLoadTimer);
				domReadyEventHandler.fire({});
			}
		}, 10);
	}
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", function(e) {clearInterval(window.DOMLoadTimer);domReadyEventHandler.fire.call(this,e);}, false);
	} else {
		window.addLoadEvent( domReadyEventHandler.fire, null, 1000 );
	}

	//Element binding tools
	var boundElements = [];
	/**
	* Bind the JSquared element tools to the provided node.
	* Basic binding will only bind the core tools and will not bind the enahnced DOM methods to the element.
	* The default is for full binding.
	* @name bindElementTools
	* @memberOf J2.Core
	* @function
	* @param {Node} o  The DOM node to bind to - can be an Object
	* @oaram {Boolean} [isBasicBinding] Define the extent of binding to take place
	*/
	this.bindElementTools = function(o, isBasicBinding) {
		if (o) {
			//if the element is not bound, copy the methods onto the element
			if (o.isElementBound !== true) {
				for (var method in J2.Element.Tools)
					o[method] = J2.Element.Tools[method];
				boundElements.push(o);
			}
			if (isBasicBinding === true) return;
			//if the event binding is to be a full set of bindings, enhance the built in DOM nodes
			if (o.isExtraOverridesBound !== true) {
				try {
					o.getElementsByClass = o.getElementsByClassName = J2.Core.newDOMMethods.getElementsByClassName(o.querySelectorAll ? o.querySelectorAll : o.getElementsByClassName || null);
					o.getElementsByTagName = J2.Core.newDOMMethods.getElementsByTagName(o.getElementsByTagName);
					o.appendChild = J2.Core.newDOMMethods.appendChild(o.appendChild);
					o.replaceChild = J2.Core.newDOMMethods.replaceChild(o.replaceChild);
					o.insertBefore = J2.Core.newDOMMethods.insertBefore(o.insertBefore);
					o.isExtraOverridesBound = true;
				} catch (e) { }
			}
		}
		return o;
	};
	/**
	* Removes the JSquared element bindings from an element.
	* Should be used before removing an element from the DOM tree ideally.
	* @function
	* @name removeElementBindings
	* @memberOf J2.Core
	* @param {Node} o The node to remove the bindings from
	* @param {Boolean} [fullRemove] Defines whether to fully remove the bindings or just remove the node from the JSquared bound elements list
	*/
	this.removeElementBindings = function(o, fullRemove) {
		if (typeof o === "object") {
			for (var i = boundElements.length-1; i>=0; i--) {
				if (boundElements[i] === o) {
					boundElements.splice(i,1);
					break;
				}
			}
			if (fullRemove === true) {
				for (var method in J2.Element.Tools) {
					if (o[method])
						o[method] = null;
				}
			}
		}
		return o;
	}
	/**
	* Unbinds all currently bound elements.
	* @function
	* @name unbindAllElements
	* @memberOf J2.Core
	*/
	this.unbindAllElements = function() {
		for (var i = boundElements.length - 1; i >= 0; i--)
			this.removeElementBindings(boundElements[i], true);
	}
	/**
	* Add a new element bound tool.
	* Will add the method to J2.Element.Tools to make available to all future bound DOM nodes.
	* Will add the method to all previously bound nodes.
	* If a method with the same name already exists, it will be overwritten
	* @name addElementTool
	* @memberOf J2.Core
	* @function
	* @param {String} id The name of the new element tool
	* @param {Function} func The function to assign as the new element tool
	*/
	this.addElementTool = function(id, func) {
		if (typeof func !== "function" || typeof id !== "string") return;
		J2.Element.Tools[id] = func;
		//loop through all bound elements and attach the new element tool
		for (var i = boundElements.length - 1; i >= 0; i--)
			boundElements[i][id] = func;
	};
	/**
	* Sort array of DOM nodes to their document order
	* @name sortToDocumentOrder
	* @function
	* @memberOf J2.Core
	* @param {Array} elements DOM nodes to be sorted
	* @return {Array} The sorted array
	*/
	this.sortToDocumentOrder = function(elements) {
		return elements.sort(function(a, b) {
			return 3 - (comparePosition(a, b) & 6);
		});
	};
	function comparePosition(a, b) {
		return a.compareDocumentPosition ? a.compareDocumentPosition(b) : a.contains ? (a !== b && a.contains(b) && 16) + (a !== b && b.contains(a) && 8) + (a.sourceIndex >= 0 && b.sourceIndex >= 0 ? (a.sourceIndex < b.sourceIndex && 4) + (a.sourceIndex > b.sourceIndex && 2) : 1) + 0 : 0;
	}
	/**
	* Enhanced DOM methods which are applied to the document and to each DOM node (where relevant).
	* Where these methods replace existing methods, they will act exactly as per the existing methods with the enhancements as detailed.
	* @class
	* @static
	* @name newDOMMethods
	* @memberOf J2.Core
	*/
	this.newDOMMethods = new (function() {
		//store references to the old DOM functions
		document.oldGetElementById = document.getElementById;
		document.oldCreateElement = document.createElement;
		/**
		* Enhancement - binds element tools to returned node
		* @function
		* @name getElementById
		* @memberOf J2.Core.newDOMMethods
		* @param {String} id The id of the element to return
		* @return {Node} The matching DOM node or null if not found
		*/
		this.getElementById = function(id) {
			return J2.Core.bindElementTools(document.oldGetElementById(id));
		};
		/**
		* Enhancement - binds element tools to new node and applies options to new node
		* @function
		* @name createElement
		* @memberOf J2.Core.newDOMMethods
		* @param {String} type The type (tag name) of the new node
		* @param {Object} options The properties to apply to the new DOM node.
		* @config {String} property The name of the property to apply to the new DOM node. Its value will be the properties value
		* @return {Node} The new DOM node
		* @example 
		* //Each item in the options gets applied to the element
		* var myElement = document.createElement("div", {
		*	cssClass: "myClass",
		*	id: "myElement",
		*	innerHTML: "This is my element"
		* } );
		*/
		this.createElement = function(type, options) {
			var el = document.oldCreateElement(type);
			//go through the options and bind the values to the created node
			if (typeof options === "object") {
				//special handling for cssClasses
				if (options.cssClass != null) {
					el.className = options.cssClass;
					delete options.cssClass;
				}
				for (var item in options)
					el[item] = options[item];
			}
			return J2.Core.bindElementTools(el);
		};
		/**
		* Enhancement - binds element tools to returned nodes
		* @function
		* @name getElementsByTagName
		* @memberOf J2.Core.newDOMMethods
		* @param {String} tag The tag type to select
		* @return {LiveNodeList} The matching DOM nodes
		*/
		this.getElementsByTagName = function(f) {
			return function(tag) {
				this.getElementsByTagName = f;
				var els = this.getElementsByTagName(tag),
					i;
				for (i = els.length - 1; i >= 0; i--)
					J2.Core.bindElementTools(els[i]);
				this.getElementsByTagName = J2.Core.newDOMMethods.getElementsByTagName(this.getElementsByTagName);
				return els;
			};
		};
		/**
		* Enhancement - binds element tools to returned nodes.
		* Access nodes by class name and type.
		* The function either accepts a string parameter or an object literal.
		* If a string is passed in, all nodes matching that class name will be returned.
		* @function
		* @name getElementsByClassName
		* @memberOf J2.Core.newDOMMethods
		* @param {Object or String} options The options for selecting nodes or the class name to select on
		* @config {String} cssClass The class name to match and select nodes on
		* @config {String or Array} [tags] Comma delimeted list of tag types or array of tag types
		* @config {Function} [callback] Callback function called each time a matching node is found - saved iterating over the list twice
		* @return {Array} The matching DOM nodes
		* @example
		* //Returns all nodes of all types with the class name "myClass"
		* var myNodes = document.getElementsByClassName("myClass");
		* @example
		* //Returns all nodes of types "div" and "h2" only with the class name "myClass"
		* var myNodes = document.getElementsByClassName( { cssClass: "myClass", tags: "div,h2" } );
		* @example
		* //Returns all nodes of type "span" or "a" only with the class name "myClass"
		* //For each matching node will call the callback function in the scope of the node itself.
		* var myNodes = document.getElementsByClassName( { cssClass: "myClass", tags: ["span", "a"], callback: function() {
		*	alert(this.tagName);
		* } } );
		*/
		this.getElementsByClassName = function(f) {
			//argument handling function to ensure that all argument properties are set properly
			var handleArguments = function(args) {
				var cssClass = arguments[0].cssClass || arguments[0], tags = arguments[0].tags || "*", callback = arguments[0].callback || null;
				return { tags: isArray(tags) ? tags.join(",").toLowerCase().split(",") : tags.toLowerCase().split(","), cssClass: cssClass, callback: callback };
			};
			if (f == null) {
				//getElementsByClassName and the selector API is not supported by the users browser
				//use the legacy function - worst performance
				return function() {
					var args = handleArguments(arguments[0]);
					return getElementsByClassNameLegacy.call(this, args.cssClass, args.tags, args.callback);
				};
			} else if (document.querySelectorAll) {
				//selector API is supported by the users browser
				return function() {
					var args = handleArguments(arguments[0]);
					this.getElementsByClassName = f;
					//build the query text to pass into querySelectorAll
					var queryText = "";
					if (args.tags === "*") {
						queryText = "." + args.cssClass;
					} else {
						for (var i = 0, j = args.tags.length; i < j; i++) {
							if (i !== 0) {
								queryText += ",";
							}
							queryText += args.tags[i] + "." + args.cssClass;
						}
					}
					//get the elements selected via querySelectorAll into a standard array
					var els = Array.prototype.copy.call(this.getElementsByClassName(queryText));
					//bind returned elements and call callback
					for (var i = 0, j = els.length; i < j; i++) {
						J2.Core.bindElementTools(els[i]);
						if (typeof args.callback === "function")
							args.callback.call(els[i], els[i]);
					}
					//reset the getElementsByClassName method on this node
					//this will ensure that querySelectorAll always runs as native code being called by a non-native function
					this.getElementsByClassName = J2.Core.newDOMMethods.getElementsByClassName(this.getElementsByClassName);
					return els;
				};
			} else {
				return function() {
					//getElementsByClassName is supported by users browser but not the selectors API
					var args = handleArguments(arguments[0]);
					this.getElementsByClassName = f;
					//get all elements of the specified class into a standard array
					var	els = Array.prototype.copy.call(this.getElementsByClassName(args.cssClass)), 
						result = [],
						bind = false,
						isAllTags = args.tags.contains("*"),
						fireCallback = typeof args.callback === "function",
						i = 0,
						j = els.length;
					//loop through all elements and match to specified tag names to build results and call callback
					for (i; i < j; i++) {
						if (isAllTags || args.tags.contains(els[i].tagName.toLowerCase())) {
							result.push(J2.Core.bindElementTools(els[i]));
							if (fireCallback)
								args.callback.call(els[i], els[i]);
						}
					}
					return result;
				};
			}
		};
		/**
		* Enhancement - binds element tools to new node.
		* Allows new node to be retrieved via AJAX if J2.AJAX module is loaded.
		* @function
		* @name appendChild
		* @memberOf J2.Core.newDOMMethods
		* @param {Node or J2.AJAX} el Element to be added or J2.AJAX object to be used to retrieve HTML to append
		* @return {Node or null} The new node added or null if J2.AJAX object used
		* @example
		* //Add new DIV to element
		* var myNewElement = element.appendChild( document.createElement("div") );
		* @example
		* //Retrieve new node using J2.AJAX module.
		* element.appendChild( new J2.AJAX( { url: "page.html" } ) );
		*/
		this.appendChild = function(f) {
			return function(el) {
				this.appendChild = f;
				//if a J2.AJAX object has been supplied, call the setup the callback and call the send method
				if (J2.AJAX && el instanceof J2.AJAX) {
					el.setSuccessHandler(function(ajax) {
						var tempNode = document.createElement("span", { innerHTML: ajax.getResponseText() });
						this.appendChild(tempNode);
						tempNode.remove(true);
					});
					el.setScope(this);
					el.send();
				} else {
					if (el.nodeType === 1)
						J2.Core.bindElementTools(el);
					return this.appendChild(el);
				}
			};
		};
		/**
		* Enhancement - binds element tools to new node.
		* Allows new node to be retrieved via AJAX if J2.AJAX module is loaded.
		* @function
		* @name replaceChild
		* @memberOf J2.Core.newDOMMethods
		* @param {Node or J2.AJAX} newEl Element to be added or J2.AJAX object to be used to retrieve element
		* @param {Node} oldEl Element to be replaced
		* @return {Node or null} The new node added or null if J2.AJAX object used
		*/
		this.replaceChild = function(f) {
			return function(newEl, oldEl) {
				this.replaceChild = f;
				//if a J2.AJAX object has been supplied, call the setup the callback and call the send method
				if (J2.AJAX && newEl instanceof J2.AJAX) {
					newEl.setSuccessHandler(function(ajax) {
						var tempNode = document.createElement("span", { innerHTML: ajax.getResponseText() });
						this.replaceChild(tempNode, oldEl);
						tempNode.remove(true);
					});
					newEl.setScope(this);
					newEl.send();
				} else {
					return this.replaceChild(J2.Core.bindElementTools(newEl), oldEl);
				}
			};
		};
		/**
		* Enhancement - binds element tools to new node.
		* Allows new node to be retrieved via AJAX if J2.AJAX module is loaded.
		* @function
		* @name insertBefore
		* @memberOf J2.Core.newDOMMethods
		* @param {Node or J2.AJAX} newNode Element to be added or J2.AJAX object to be used to retrieve element
		* @param {Node} refNode Reference element
		* @return {Node or null} The new node added or null if J2.AJAX object used
		*/
		this.insertBefore = function(f) {
			return function(newNode, refNode) {
				this.insertBefore = f;
				//if a J2.AJAX object has been supplied, call the setup the callback and call the send method
				if (J2.AJAX && newNode instanceof J2.AJAX) {
					newNode.setSuccessHandler(function(ajax) {
						var tempNode = document.createElement("span", { innerHTML: ajax.getResponseText() });
						this.insertBefore(tempNode, refNode);
						tempNode.remove(true);
					});
					newNode.setScope(this);
					newNode.send();
				} else {
					return this.insertBefore(J2.Core.bindElementTools(newNode), refNode);
				}
			};
		};
		function getElementsByClassNameLegacy(cssClass, tags, callback) {
			//legacy function for getting elements by class name
			var results = [];
			//get all elements with the correct tags
			var elements = this.getElementsByTagNames(tags);
			//loop through all elements and check if it has the correct class name
			for (var i = 0, j = elements.length; i < j; i++) {
				if (J2.Element.Tools.hasCssClass.call(elements[i], cssClass)) {
					results.push(J2.Core.bindElementTools(elements[i]));
					if (typeof callback === "function")
						callback.call(elements[i], elements[i]);
				}
			}
			return results;
		}
	});
	/**
	* Handles colours for use in CSS styles.
	* A CSS Colour can be retrieved as a hex value or as RGB values.
	* @memberOf J2.Core
	* @name CSSColor
	* @constructor
	* @param {Number} r The red index value for the colour.  Range 0 - 255
	* @param {Number} g The green index value for the colour.  Range 0 - 255
	* @param {Number} b The blue index value for the colour.  Range 0 - 255
	*/
	this.CSSColor = function(r, g, b) {
		/**
		* The indexes of this colour
		* @name indexes
		* @type Array
		* @memberOf J2.Core.CSSColor
		*/
		this.indexes = [parseInt(r), parseInt(g), parseInt(b)];
	};
	/**
	* @static
	* @class
	* @prototype
	* @name J2.Core.CSSColor.prototype
	* @memberOf J2.Core.CSSColor
	*/
	this.CSSColor.prototype = new (function() {
		/**
		* Get the hex value of this colour with the # symbol
		* @function
		* @memberOf J2.Core.CSSColor.prototype
		* @name getHex
		* @return {String} The hex value
		*/
		this.getHex = function() {
			var	hexVal = "#",
				partVal,
				i;
			for (i = 0; i < 3; i++) {
				partVal = this.indexes[i].toString(16);
				hexVal += partVal.length === 1 ? "0" + partVal : partVal;
			}
			return hexVal;
		};
		/**
		* Get the RGB format value of this colour eg rgb(255,255,255)
		* @function
		* @memberOf J2.Core.CSSColor.prototype
		* @name getRGB
		* @return {String} The RGB value
		*/
		this.getRGB = function() {
			return "rgb(" + this.indexes.join(",") + ")";
		}
		/**
		* Get the difference between this and another colour
		* @function
		* @name diff
		* @memberOf J2.Core.CSSColor.prototype
		* @param {Array or J2.Core.CSSColor} otherColor The colour to compare this colour to
		* @return {J2.Core.CSSColor} A new CSSColor object representing the difference between the two colours
		* 
		*/
		this.diff = function(otherColor) {
			if (otherColor instanceof J2.Core.CSSColor)
				otherColor = otherColor.indexes;
			if (!isArray(otherColor)) return null;
			var diff = [],
				i;
			for (i = 0; i < 3; i++)
				diff.push(parseInt(this.indexes[i]) - parseInt(otherColor[i]));
			return diff.toCssColor();
		}
		/**
		* Creates a J2.Core.CSSColor object from an RGB or hex representation of the color.
		* @function
		* @name create
		* @memberOf J2.Core.CSSColor.prototype
		* @static
		* @param {String} value RGB or hex representation of a colour
		* @return {J2.Core.CSSColor}
		* @example
		* var myColour = J2.Core.CSSColor.prototype.create( "#ffffff" );
		* @example
		* var myColour = J2.Core.CSSColor.prototype.create( "#fff" );
		* @example
		* var myColour = J2.Core.CSSColor.prototype.create( "rgb(255,255,255)" );
		*/
		this.create = function(value) {
			if (arguments.length < 1) return this;
			var args = [0, 0, 0];
			if (value !== "" && value !== null) {
				if (/rgb/.test(value)) {
					//this is an rgb() style
					args = value.match(/\d{1,3}/g);
				} else {
					value = (value + "").replace(/#/, "");
					if (value.length === 3 || value.length === 6) {
						args = [];
						for (var i = 0, j = value.length; i < j; i += (1 / (3 / j))) {
							args.push(value.slice(i, (1 / (3 / j)) + i));
							args[args.length - 1] = parseInt(args[args.length - 1].length === 1 ? args[args.length - 1] + args[args.length - 1] : args[args.length - 1], 16);
						}
					} else {
						return null;
					}
				}
			}
			return args.toCssColor();
		}
	});
	//Built-in object extensions
	/**
	* Trim white space from the start and end of a string
	* @return {String} Trimmed string
	* @example
	* var trimmedString = "  my string  ".trim();
	*/
	String.prototype.trim = function() {
		return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	};
	/**
	* Convert a hyphenated string to camel case
	* @return {String}
	* @example
	* //Returns "backgroundColor"
	* var camelCasedString = "background-color".hyphenatedToCamelCase()
	*/
	String.prototype.hyphenatedToCamelCase = function() {
		return this.replace(/-\D/g, function(match) { return match.charAt(1).toUpperCase(); });
	}
	/**
	* Convert a double delimited list such as the querystring into an object.  The delimiters can be defined as any set of two delimeters or they will default to & and = as per a querystring.
	* @param {Array} delimeters An array of delimiters to split the string by
	* @return {Object}
	* @example
	* "a=1&b=2".unDelimit()
	* Returns the following object structure:
	* {
	*	a: 1,
	*	b: 2
	* }
	* @example
	* "a~1#b~2#b=3".unDelimit(["#", "~"])
	* Returns the following object structure:
	* {
	*	a: 1,
	*	b: [2, 3]
	* }
	*/
	String.prototype.unDelimit = function(delimeters) {
		delimeters = delimeters || ["&", "="];
		if (delimeters.length === 1)
			return this.split(delimeters[0]);
		var items = this.split(delimeters[0]),
			o = {},
			i = 0,
			j = items.length,
			subItem;
		for (i; i<j; i++) {
			subItem = items[i].split(delimeters[1]);
			subItem[1] = subItem[1] || "";
			if (o[subItem[0]]) {
				if (isArray(o[subItem[0]])) {
					o[subItem[0]].push(subItem[1]);
				} else {
					o[subItem[0]] = [o[subItem[0]], subItem[1]];
				}
			} else {
				o[subItem[0]] = subItem[1];
			}
		}
		return o;
	}
	/**
	* Convert an array of 3 colour indexes to a J2.Core.CSSColor
	* @return {J2.Core.CSSColor}
	* @example
	* var myNewColor = [255,255,255].toCssColor();
	*/
	Array.prototype.toCssColor = function() {
		if (this.length !== 3) return this;
		for (var i = this.length - 1; i >= 0; i--) {
			if (isNaN(parseInt(this[i]))) return this;
		}
		return new J2.Core.CSSColor(this[0], this[1], this[2]);
	}
	/**
	* Check if an array contains a particular value
	* @param {Any type} val The value to check
	* @return {Boolean} Returns true if any item in the array contains the value
	*/
	Array.prototype.contains = function(val) {
		for (var i = this.length - 1; i >= 0; i--) {
			if (this[i] === val) return true;
		}
		return false;
	};
	/**
	* Copy an array to a new disconnected array.
	* Use to convert array like objects to a standard array, such as an arguments list to a function or a live node list as returnd by getElemenetsByTagName
	* @return {Array} The copy
	* @example
	* myCopy = [1,2,3].copy();
	* @example
	* function(a,b,c) {
	*	//copy arguments list (an array type object) to a real array
	*	var argumentsArray = Array.prototype.copy.call(arguments);
	* }
	*/
	Array.prototype.copy = function() {
		if (this.length == null || this.length === 0) return [];
		var newArray;
		//try to use the slice method to create a new array - most efficient
		try {
			newArray = Array.prototype.slice.call(this, 0);
			if (newArray[0] == null) throw "";
		} catch (e) {
			newArray = [];
			for (var i = 0, j = this.length; i < j; i++)
				newArray.push(this[i]);
		}
		return newArray;
	};
});
/**
* Check if an object is an Array
* @name isArray
* @function
* @param {Object} o The object to test
* @return {Boolean}
*/
window.isArray = function(o) {
	return Object.prototype.toString.call(o) === '[object Array]';
};
/**
* Container for methods for acting on the window
* @constructor
* @name J2.Window
* @static
*/
J2.Window = new (function() {
	var size = (function() {
		if (window.innerWidth) {
			return function(dim) {
				return window["inner" + dim];
			}
		} else if (document.documentElement && document.documentElement.clientWidth && document.documentElement.clientWidth !== 0) {
			return function(dim) {
				return document.documentElement["client" + dim];
			}
		} else {
			return function() {
				return 0;
			}
		}
	})();
	/**
	* Get the width of the window
	* @function
	* @name width
	* @memberOf J2.Window
	* @returns {Number} The width of the window
	*/
	this.width = function() {
		return size("Width");
	}
	/**
	* Get the height of the window
	* @function
	* @name height
	* @memberOf J2.Window
	* @returns {Number} The height of the window
	*/
	this.height = function() {
		return size("Height");
	}
});
/**
* Container for transition types.  All should be treated as static.
* @constructor
* @static
* @name J2.Transitions
*/
J2.Transitions = new (function() {
	/*
		s:	startValue
		r:	range
		p:	proportion
		d:	direction
	*/
	/**
	* Linear transition. 
	* @name linear
	* @memberOf J2.Transitions
	* @type Function
	*/
	this.linear = function(s, r, p ,d) {
		return s-(r*p*d);
	};
	var transitionType = function(exp) {
		this.easeIn = function(s, r, p ,d) {
			return s-(r*exp(p)*d);
		};
		this.easeOut = function(s, r, p ,d) {
			return s-(r* (1 - exp(1-p)) *d);
		};
		this.easeInOut = function(s, r, p, d) {		
			return p <= 0.5 ? s - ((exp(2*p)/2)*r*d) : s - (((2 - exp(2 * (1-p))) / 2)*r*d);
		};
	}
	this.Quad	= new transitionType(function(p) {return Math.pow(p, 2);});
	this.Cubic	= new transitionType(function(p) {return Math.pow(p, 3);});
	this.Quart	= new transitionType(function(p) {return Math.pow(p, 4);});
	this.Quint	= new transitionType(function(p) {return Math.pow(p, 5);});
	this.Back	= new transitionType(function(p) {return Math.pow(p, 2) * (3 * p - 2);});
	this.Exp	= new transitionType(function(p) {return Math.pow(2, 8*(p-1));});
	this.Bounce = new transitionType(
		function (p) {
			var a = 0, b = 1;
			while (p < (7 - 4 * a) / 11) {
				a += b;
				b /= 2;
			}
			return - Math.pow((11 - 6 * a - 11 * p) / 4, 2) + b * b;
		}
	);
});
/**
* Quadratic easeIn transition type
* @name Quad.easeIn
* @memberOf J2.Transitions
* @type Function
*/
/**
* Quadratic easeOut transition type
* @name Quad.easeOut
* @memberOf J2.Transitions
* @type Function
*/
/**
* Quadratic easeInOut transition type
* @name Quad.easeInOut
* @memberOf J2.Transitions
* @type Function
*/

/**
* Cubic easeIn transition type
* @name Cubic.easeIn
* @memberOf J2.Transitions
* @type Function
*/
/**
* Cubic easeOut transition type
* @name Cubic.easeOut
* @memberOf J2.Transitions
* @type Function
*/
/**
* Cubic easeInOut transition type
* @name Cubic.easeInOut
* @memberOf J2.Transitions
* @type Function
*/

/**
* Quartic easeIn transition type
* @name Quart.easeIn
* @memberOf J2.Transitions
* @type Function
*/
/**
* Quartic easeOut transition type
* @name Quart.easeOut
* @memberOf J2.Transitions
* @type Function
*/
/**
* Quartic easeInOut transition type
* @name Quart.easeInOut
* @memberOf J2.Transitions
* @type Function
*/

/**
* Quintic easeIn transition type
* @name Quint.easeIn
* @memberOf J2.Transitions
* @type Function
*/
/**
* Quintic easeOut transition type
* @name Quint.easeOut
* @memberOf J2.Transitions
* @type Function
*/
/**
* Quintic easeInOut transition type
* @name Quint.easeInOut
* @memberOf J2.Transitions
* @type Function
*/

/**
* Back easeIn transition type - will force the effect to step backwards at the start of its run
* @name Back.easeIn
* @memberOf J2.Transitions
* @type Function
*/
/**
* Back easeOut transition type  - will force the effect to step backwards at the end of its run
* @name Back.easeOut
* @memberOf J2.Transitions
* @type Function
*/
/**
* Back easeInOut transition type - will force the effect to step backwards at the start and end of its run
* @name Back.easeInOut
* @memberOf J2.Transitions
* @type Function
*/

/**
* Exponential easeIn transition type
* @name Exp.easeIn
* @memberOf J2.Transitions
* @type Function
*/
/**
* Exponential easeOut transition type
* @name Exp.easeOut
* @memberOf J2.Transitions
* @type Function
*/
/**
* Exponential easeInOut transition type
* @name Exp.easeInOut
* @memberOf J2.Transitions
* @type Function
*/

/**
* Bounce easeIn transition type - will force the effect to bounce in and out at the start of its run
* @name Bounce.easeIn
* @memberOf J2.Transitions
* @type Function
*/
/**
* Bounce easeOut transition type - will force the effect to bounce in and out at the end of its run
* @name Bounce.easeOut
* @memberOf J2.Transitions
* @type Function
*/
/**
* Bounce easeInOut transition type - will force the effect to bounce in and out at the start and end of its run
* @name Bounce.easeInOut
* @memberOf J2.Transitions
* @type Function
*/
/**
* @namespace Container for JSquared element tools.
* @name J2.Element
* @memberOf J2
*/
J2.Element = new (function() {
	/**
	* Get a structure for representing where to put nodes inside other nodes.
	* Used for various element tools when moving and positioning nodes, specifically the moveTo method in J2.Element.Tools
	* @name nodePosition
	* @class
	* @static
	* @memberOf J2.Element
	* @see J2.Element.Tools
	* @see J2.Element.Tools#moveTo
	*/
	this.nodePosition = new (function() {
		/**
		* List of possible positions.  Used for comparison purposes only
		* @name positions
		* @static
		* @memberOf J2.Element.nodePosition
		*/
		var positions = {
			first: "first",
			last: "last",
			before: "before",
			after: "after"
		}
		/**
		* Gets a position object representing the first position of a node list
		* @function
		* @name first
		* @memberOf J2.Element.nodePosition
		* @returns {Object} Position object
		*/
		function first() {
			return {
				position: positions.first
			}
		}
		/**
		* Gets a position object representing the last position of a node list
		* @function
		* @name last
		* @memberOf J2.Element.nodePosition
		* @returns {Object} Position object
		*/
		function last() {
			return {
				position: positions.last
			}
		}
		/**
		* Gets a position object representing a position immediately before a reference node
		* @function
		* @name before
		* @memberOf J2.Element.nodePosition
		* @param {Node} node The reference node
		* @returns {Object} Position object
		*/
		function before(node) {
			if (!node) return first();
			return {
				position: positions.before,
				ref: node
			}
		}
		/**
		* Gets a position object representing a position immediately after a reference node
		* @function
		* @name after
		* @memberOf J2.Element.nodePosition
		* @param {Node} node The reference node
		* @returns {Object} Position object
		*/
		function after(node) {
			if (!node) return first();
			return {
				position: positions.after,
				ref: node
			}
		}
		this.first = first;
		this.last = last;
		this.before = before;
		this.after = after;
		this.positions = positions;
	});
	/**
	* These are the tools which will get bound to each DOM node accessed using a JSquared enhanced method.
	* Adding a method to this namespace manually will not add the method to DOM nodes.  Use <a href="J2.Core.html#addElementTool">J2.Core.addElementTool</a>.
	* @name J2.Element.Tools
	* @static
	* @class
	* @memberOf J2.Element
	*/
	this.Tools = new (function() {
		/**
		* Check to see if element is bound to J2.Element
		* @name isElementBound
		* @static
		* @type Boolean
		* @memberOf J2.Element.Tools
		*/
		this.isElementBound = true;
	/**
	* Returns an array of nodes matching a list of tag names.
	* Can be used to return multiple node types.
	* @name getElementsByTagNames
	* @memberOf J2.Element.Tools
	* @function
	* @param {String or Array} list The node types to return.  Comma separated list or array of values.
	* @return {Array} Matching nodes in document order
	* @example
	* //get all DIVs and SPANs in the document
	* var nodes = document.getElementsByTagNames("div,span");
	* @example
	* //get all lists inside a specific node
	* var lists = document.getElementById("myElement").getElementsByTagNames( ["ul", "ol", "dl"] );
	*/
	this.getElementsByTagNames = function(list) {
		if (typeof list === "string") {
			if (arguments.length === 1) {
				var tagNames = list.split(",");
			} else {
				var tagNames = [];
				for (var i = 0, j = arguments.length; i<j; i++) {
					if (typeof arguments[i] === "string")
						tagNames.push(arguments[i]);
				}
			}
		} else if ( isArray(list) ) {
			var tagNames = list;
		} else {
			return [];
		}
		var results = null;
		for (var i=0, j=tagNames.length; i<j; i++) {
			var elements = Array.prototype.copy.call(this.getElementsByTagName(tagNames[i].trim()));
			results = (results == null) ? elements : results.concat(elements);
		}
		return J2.Core.sortToDocumentOrder(results);
	};
	/**
	* Check if a node has a particular CSS class
	* @name hasCssClass
	* @memberOf J2.Element.Tools
	* @function
	* @param {String} cssClass The CSS class name to check for
	* @return {Boolean}
	*/
	this.hasCssClass = function(cssClass) {
		return new RegExp("\\b" + cssClass + "\\b").test(this.className);
	};
	/**
	* Add a CSS class to the CSS classes applied to a node
	* @function
	* @name addCssClass
	* @memberOf J2.Element.Tools
	* @param {String} cssClass The CSS class name to add
	* @return {Node} The node this method acts upon
	*/
	this.addCssClass = function(cssClass) {
		if ( !this.hasCssClass(cssClass) )
			this.className = this.className.trim() + " " + cssClass.trim();
		return this;
	};
	/**
	* Remove a CSS class form the CSS classes applied to a node
	* @function
	* @name removeCssClass
	* @memberOf J2.Element.Tools
	* @param {String} cssClass The CSS class name to remove
	* @return {Node} The node this method acts upon
	*/
	this.removeCssClass = function(cssClass) {
		if ( this.hasCssClass(cssClass) )
			this.className = this.className.replace(cssClass.trim(), "").trim();
		return this;
	};
	/**
	* Set the opacity of a node. 
	* Can also be accessed via setStyle.
	* @function
	* @name setOpacity
	* @memberOf J2.Element.Tools
	* @param {Float} opacityLevel The opacity level (0-1)
	* @return {Node} The node this method acts upon
	*/
	this.setOpacity = function() {
		return function(opacityLevel) {
			this.style.opacity = opacityLevel;
			return this;
		};
	}();
	/**
	* Set a CSS style value on a node.
	* If the property being set is a colour, use a J2.Core.CSSColor object
	* @function
	* @name setStyle
	* @memberOf J2.Element.Tools
	* @param {String} property The property to set
	* @param Value The value to set the supplied property to - can be of multiple types dependant on the property
	* @return {Node} The node this method acts upon
	* @example
	* document.getElementById("myElement").setStyle("top", 200);
	* @example
	* document.getElementById("myElement").setStyle("opacity", 0.5);
	* @example
	* document.getElementById("myElement").setStyle("float", "left");
	* @see J2.Core.CSSColor
	*/
	this.setStyle = function(property, value) {
		property = property.hyphenatedToCamelCase();
		//detect special cases for properties
		if (property === "opacity")
			return this.setOpacity(value);
		if (property === "float")
			property = "cssFloat";
		if (/color/i.test(property)) {
			if (!(value instanceof J2.Core.CSSColor))
				value = J2.Core.CSSColor.prototype.create(value);
			if (!(value instanceof J2.Core.CSSColor))
				return false;
			value = value.getHex();
		}
		//detect special cases for values
		if (typeof value === "number" && (!["zIndex", "zoom"].contains(property)))
			value = value + "px";
		this.style[property] = value;
		return this;
	};
	/**
	* Get the computed style of a node for a particular property.
	* Note: this method relies on browser implementations which are not consistent and it is not possible to code around.
	* @function
	* @name getStyle
	* @memberOf J2.Element.Tools
	* @param {String} property The propert name to retrieve the computed style from
	* @return {Variant} The value (a J2.Core.CSSColor if a colour property is requested)
	* @see J2.Core.CSSColor
	*/
	this.getStyle = this.getOpacity = function(property) {
		property = property.hyphenatedToCamelCase();
		//detect special cases for properties
		if (property === "float")
			property = "cssFloat";
		var property_value = null;
		//get the value as best as the browser will allow
		if (this.currentStyle) {
			property_value = this.currentStyle[property];
		} else if (window.getComputedStyle) {
			property_value = document.defaultView.getComputedStyle(this,null)[property];
		}
		//if the property is a colour property, convert to a J2.Core.CSSColor object
		if (/color/i.test(property))
			property_value = J2.Core.CSSColor.prototype.create(property_value);
		return property_value;
	};
	/**
	* Get the on-screen position of a node relative to any other node.  
	* Default comparison node is window.
	* @function
	* @name getPosition
	* @memberOf J2.Element.Tools
	* @param {Node} [relativeTo] The node to compare this nodes position to.  Defaults to window.
	* @return {Object} Object containing properties for left and top.
	*/
	this.getPosition = function(relativeTo) {
		var relative = {left:0, top:0},
			position = {left:parseInt(this.offsetLeft) - relative.left, top:parseInt(this.offsetTop) - relative.top},
			o = this;
		if (typeof relativeTo === "object")
			relative = J2.Core.bindElementTools(relativeTo).getPosition();
		while (o = o.offsetParent) {
			position.left += parseInt(o.offsetLeft);
			position.top += parseInt(o.offsetTop);
		}
		return position;
	};
	/**
	* Check if a node as any child elements
	* @function
	* @name hasChildElements
	* @memberOf J2.Element.Tools
	* @param {String} [type] The type (tag name) of child to look for.  Defaults to all types.
	* @return {Boolean}
	*/
	this.hasChildElements = function(type) {
		return this.getElementsByTagName(type || "*").length > 0;
	};
	/**
	* Remove all child nodes.
	* @function
	* @name removeAllChildren
	* @memberOf J2.Element.Tools
	* @return {Node} The node this method acts upon
	*/
	this.removeAllChildren = function() {
		while (this.hasChildNodes())
			this.removeChild( this.firstChild );
		return this;
	};
	/**
	* Get the next sibling optionally of a particular type.
	* Will only return element nodes.
	* @function
	* @name getNextSibling
	* @memberOf J2.Element.Tools
	* @param {String} [type] The tag name of the next sibling to find.
	* @return {Node} The next sibling or this if there is no next sibling.
	*/
	this.getNextSibling = function(type) {
		var o = this;
		//keep looking through each next sibling to find the correct node
		while (o = o.nextSibling) {
			if (o.nodeType !== 1) continue;
			if (type == null) break;
			if (type.toLowerCase() === o.tagName.toLowerCase()) break;
		}
		return J2.Core.bindElementTools(o);
	};
	/**
	* Get the previous sibling optionally of a particular type.
	* Will only return element nodes.
	* @function
	* @name getPreviousSibling
	* @memberOf J2.Element.Tools
	* @param {String} [type] The tag name of the previous sibling to find.
	* @return {Node} The previous sibling or this if there is no previous sibling.
	*/
	this.getPreviousSibling = function(type) {
		var o = this;
		//keep looking through each next sibling to find the correct node
		while (o = o.previousSibling) {
			if (o.nodeType !== 1) continue;
			if (type == null) break;
			if (type.toLowerCase() === o.tagName.toLowerCase()) break;
		}
		return J2.Core.bindElementTools(o);
	};
	/**
	* Get the parent node optionally of a type.
	* @function
	* @name getParent
	* @memberOf J2.Element.Tools
	* @param {String} [type] The tag name of the parent to find.
	* @return {Node} The parent node or null if there is no parent of the specified type.
	*/
	this.getParent = function(type) {
		//if no type is specified, just return the parent node
		if (type == null) {
			return J2.Core.bindElementTools(this.parentNode);
		}
		var o = this;
		//loop through the parent nodes looking for the right type
		while (o = o.parentNode) {
			if (o.nodeType !== 1) continue;
			if (o.tagName.toLowerCase() === type.toLowerCase()) {
				return J2.Core.bindElementTools(o);
			}
		}
		return null;
	};
	/**
	* Get the parent node which has a specific style
	* @function
	* @name getParentByStyle
	* @memberOf J2.Element.Tools
	* @param {String} property The CSS property to check for
	* @param {String} value The value the property needs to match
	* @return {Node} The parent node or null if there is no matching parent.
	*/
	this.getParentByStyle = function(property, value) {
		var o = this;
		//loop through all the parent nodes checking if the node has the correct style
		while (o = o.parentNode) {
			if (J2.Element.Tools.getStyle.call(o, property) === value) {
				return J2.Core.bindElementTools(o);
			}
		}
		return null;
	};
	/**
	* Determine is a reference node is inside this node
	* Default comparison node is window.
	* @function
	* @name contains
	* @memberOf J2.Element.Tools
	* @param {Node} ref The node to check
	* @return {Boolean} True is the ref node is within this node.  Otherwise false.
	*/
	this.contains = function(ref) {
		if (ref == null) return false;
		var node = ref.parentNode;
		do {
			if (this === node) return true;
		} while (node = node.parentNode);
		return false;
	}
	/**
	* Insert a node after a reference node. 
	* The opposite of the standard DOM method insertBefore
	* @function
	* @name insertAfter
	* @memberOf J2.Element.Tools
	* @param {Node} newNode The new node to append to the document
	* @param {Node} refNode The reference node to insert the new node after
	* @return {Node or null} The new node added
	*/
	this.insertAfter = function(newNode, refNode) {
		//if a J2.AJAX object has been supplied, call the setup the callback and call the send method
		if (typeof J2.AJAX === "function" && newNode instanceof J2.AJAX) {
			newNode.setSuccessHandler( function(ajax) {
				var tempNode = document.createElement("span", {innerHTML:ajax.getResponseText()});
				this.insertAfter(tempNode, refNode);
				tempNode.remove(true);
			} );
			newNode.setScope(this);
			newNode.send();
		} else {
			var sibling = refNode.getNextSibling();
			if (refNode == null || sibling === refNode) {
				return this.appendChild(newNode);
			} else {
				return this.insertBefore(newNode, sibling);
			}
		}
	};
	/**
	* Remove this node from the document.
	* Optionally, this method will retain the children within the document in their current position whilst removing this node.
	* @function
	* @name remove
	* @memberOf J2.Element.Tools
	* @param {Boolean} [retainChildren] Specify whether to retain the children of this node
	* @example
	* The following examples will act on this markup:
	* <div style="font-family: Consolas; font-size: 12px; color: black; background: #e1e1e1; padding:10px;"><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span> <span style="color: red;">id</span><span style="color: blue;">="RefNode"&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">p</span><span style="color: blue;">&gt;</span>Test paragraph<span style="color: blue;">&lt;/</span><span style="color: #a31515;">p</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">p</span><span style="color: blue;">&gt;&lt;</span><span style="color: #a31515;">a</span> <span style="color: red;">href</span><span style="color: blue;">="#"&gt;</span>Test link<span style="color: blue;">&lt;/</span><span style="color: #a31515;">a</span><span style="color: blue;">&gt;&lt;/</span><span style="color: #a31515;">p</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p></div>
	* @example
	* document.getElementById("RefNode").remove();
	* The node structure will now be:
	* <div style="font-family: Consolas; font-size: 12px; color: black; background: #e1e1e1; padding:10px;"><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;</p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p></div>
	* @example
	* document.getElementById("RefNode").remove(true);
	* The node structure will now be:
	* <div style="font-family: Consolas; font-size: 12px; color: black; background: #e1e1e1; padding:10px;"><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">p</span><span style="color: blue;">&gt;</span>Test paragraph<span style="color: blue;">&lt;/</span><span style="color: #a31515;">p</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">p</span><span style="color: blue;">&gt;&lt;</span><span style="color: #a31515;">a</span> <span style="color: red;">href</span><span style="color: blue;">="#"&gt;</span>Test link<span style="color: blue;">&lt;/</span><span style="color: #a31515;">a</span><span style="color: blue;">&gt;&lt;/</span><span style="color: #a31515;">p</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p></div>
	*/
	this.remove = function(retainChildren) {
		retainChildren = retainChildren || false;
		if (this.parentNode) {
			//if we are to retain the children, rebuild the DOM tree
			if (retainChildren === true && this.hasChildElements()) {
				while (this.childNodes.length > 0)
					this.parentNode.insertBefore( this.childNodes[0], this );
			}
			this.parentNode.removeChild(this);
		}
	};
	/**
	* Replace this node with another node
	* Optionally, this method will retain the children of the original node and add them in the same order to the new node
	* @function
	* @name replace
	* @memberOf J2.Element.Tools
	* @param {Node} newNode The new node to replace this node with	
	* @param {Boolean} [retainChildren] Specify whether to retain the children of this node and append to the new node.  Defaults to true.
	*/
	this.replace = function(newNode, retainChildren) {
		if (this.parentNode && newNode) {
			if ((arguments.length < 2 || retainChildren === true) && this.hasChildElements()) {
				while (this.childNodes.length > 0)
					newNode.appendChild( this.childNodes[0] );
			}
			this.parentNode.replaceChild(newNode, this);
		}
	};
	/**
	* Move this node to another position in the document
	* @function
	* @name moveTo
	* @memberOf J2.Element.Tools
	* @param {Node} newParent The new parent this node should become a child of
	* @param {J2.Element.nodePosition} [position] The position in the list children of the new parent this node should take.  Defaults to last.
	* @return {Node or null} The node moved
	* @example
	* The following examples will act on this markup:
	* <div style="font-family: Consolas; font-size: 10pt; color: black; background: #e1e1e1;"><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="source"&gt;</span>node to move<span style="color: blue;">&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;</p><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span> <span style="color: red;">id</span><span style="color: blue;">="target"&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode1"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode2"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode3"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p></div>
	* @example
	* document.getElementById("source").moveTo(document.getElementById("target"));
	* The node structure will now be
	* <div style="font-family: Consolas; font-size: 10pt; color: black; background: #e1e1e1;"><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;</p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;</p><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span> <span style="color: red;">id</span><span style="color: blue;">="target"&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode1"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode2"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode3"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="source"&gt;</span>node to move<span style="color: blue;">&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p></div>
	* @example
	* document.getElementById("source").moveTo(document.getElementById("target"), J2.Element.nodePosition.first());
	* The node structure will now be
	* <div style="font-family: Consolas; font-size: 10pt; color: black; background: #e1e1e1;"><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;</p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;</p><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span> <span style="color: red;">id</span><span style="color: blue;">="target"&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="source"&gt;</span>node to move<span style="color: blue;">&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode1"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode2"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode3"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p></div>
	* @example
	* document.getElementById("source").moveTo(document.getElementById("target"), J2.Element.nodePosition.before( document.getElementById("existingNode2") ));
	* The node structure will now be
	* <div style="font-family: Consolas; font-size: 10pt; color: black; background: #e1e1e1;"><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;</p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;</p><p style="margin: 0px;"><span style="color: blue;">&lt;</span><span style="color: #a31515;">div</span> <span style="color: red;">id</span><span style="color: blue;">="target"&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode1"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="source"&gt;</span>node to move<span style="color: blue;">&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode2"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;">&nbsp;&nbsp;&nbsp; <span style="color: blue;">&lt;</span><span style="color: #a31515;">span</span> <span style="color: red;">id</span><span style="color: blue;">="existingNode3"&gt;&lt;/</span><span style="color: #a31515;">span</span><span style="color: blue;">&gt;</span></p><p style="margin: 0px;"><span style="color: blue;">&lt;/</span><span style="color: #a31515;">div</span><span style="color: blue;">&gt;</span></p></div>
	*/
	this.moveTo = function(newParent, position) {
		if (!newParent) return;
		position = position || {position:1};
		var positions = J2.Element.nodePosition.positions;
		J2.Core.bindElementTools(newParent);
		switch (position.position) {
			case positions.last:
			default:
				newParent.appendChild(this);
				break;
			case positions.first:
				newParent.insertBefore(this, newParent.firstChild);
				break;
			case positions.after:
				newParent.insertAfter(this, position.ref);
				break;
			case positions.before:
				newParent.insertBefore(this, position.ref);
				break;
		}
		return this;
	};
	/**
	* Insert a node as a new child of this node.  See the moveTo method (linked below) for more information on the J2.Element.nodePosition usage.
	* @function
	* @name insert
	* @memberOf J2.Element.Tools
	* @param {Node} node The new node to insert
	* @param {J2.Element.nodePosition} [position] The position in the list children of this node that the new node should take.  Defaults to last.
	* @return {Node or null} The node inserted
	* @see J2.Element.Tools#moveTo
	*/
	this.insert = function(node, position) {
		if (!node) return;
		position = position || {position:1};
		var positions = J2.Element.nodePosition.positions;
		switch (position.position) {
			case positions.last:
			default:
				this.appendChild(node);
				break;
			case positions.first:
				this.insertBefore(node, this.firstChild);
				break;
			case positions.after:
				newParent.insertAfter(node, position.ref);
				break;
			case positions.before:
				newParent.insertBefore(node, position.ref);
				break;
		}
		return J2.Core.bindElementTools(node);
	};
	//create a special event handler for DOM events
	var regExs = {
		key: /key/,
		click: /click/i,
		mouse: /mouse/i,
		menu: /menu/i,
		over: /over/i,
		out: /out/i,
		DOMMouseScroll: /DOMMouseScroll|mousewheel/
	};
	function DOMEvent() {
		var eventHandler = new J2.Core.Event();
		var oldFire = eventHandler.fire;
		eventHandler.oldFire = oldFire;
		eventHandler.fire = function(e) {
			//normalise the event object for browser compatability
			e = e || event;
			e.sourceNode = (e.target || e.srcElement) || null;
			if (regExs.key.test(e.type))
				e.keyPressed = (e.which || e.keyCode) || null;
			if (regExs.click.test(e.type) || regExs.mouse.test(e.type) || regExs.menu.test(e.type)) {
				e.mouse = e.manual === true ? {x:0,y:0} : {
					x: e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
					y: e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop
				};
			}
			if (regExs.over.test(e.type)) {
				if (e.manual === true) e.relatedTarget = e.sourceNode
				else if (!e.relatedTarget && e.fromElement) e.relatedTarget = e.fromElement;
			}
			if (regExs.out.test(e.type)) {
				if (e.manual === true) e.relatedTarget = e.sourceNode
				else if (!e.relatedTarget && e.toElement) e.relatedTarget = e.toElement;
			}
			if (regExs.DOMMouseScroll.test(e.type))
				e.wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
			e.rightClick = (e.which == 3) || (e.button == 2);
			if (!e.stopPropagation) {
				e.stopPropagation = function() {
					this.cancelBubble = true;
				};
			}
			if (!e.preventDefault) {
				e.preventDefault = function() {
					this.returnValue = false;
				};
			}
			e.stop = function() {
				this.preventDefault();
				this.stopPropagation();
			};
			//call the old fire method
			return eventHandler.oldFire(e);
		};
		return eventHandler;
	}
	/**
	* Add an event handler to a DOM node for an event type.
	* This is for adding event handlers for standard DOM events.
	* Each event type implements an instance of J2.Core.Event.
	* @function
	* @name addEvent
	* @memberOf J2.Element.Tools
	* @param {String} type The type of event to handle.  Eg click, mouseover, keyup
	* @param {Function} fn The handler to add to the event type
	* @param {Number} [sortIndex] The sort index for the event.  See J2.Core.Event.eventIndexes
	* @return {Function} The function handler added to the event type
	* @see J2.Core.Event
	* @see J2.Core.Event.eventIndexes
	* @example
	* document.getElementById("myElement").addEvent("click", function(e) { alert(this); });
	*/
	this.addEvent = function(type, fn, sortIndex) {
		if (typeof fn !== "function") return;
		type = type.toLowerCase();

		if (type === "mouseleave" || type === "mouseenter") {
			mouseEvents[type](this, fn, sortIndex);
		}

		if (!this.events) this.events = {};
		if (!this.events[type]) {
			this.events[type] = new DOMEvent();
			if (this["on" + type] && typeof this["on" + type] === "function")
				this.events[type].listen(this["on" + type], this, Infinity);
			this["on" + type] = this.events[type].fire;
		}
		this.events[type].listen(fn, this, sortIndex);
		return fn;
	};
	/**
	* Remove an event handler from a DOM node for an event type.
	* @function
	* @name removeEvent
	* @memberOf J2.Element.Tools
	* @param {String} type The type of event.  Eg click, mouseover, keyup
	* @param {Function} fn The handler to remove from the event type
	*/
	this.removeEvent = function(type, fn) {
		var events = this.events;
		if (events && events[type] instanceof J2.Core.Event)
			events[type].removeListener(fn);
	};
	/**
	* Remove all event handlers of a particular type from a DOM node.  This method will only remove the handlers, 
	* @function
	* @name removeAllEvents
	* @memberOf J2.Element.Tools
	* @param {String} type The type of event.  Eg click, mouseover, keyup
	* @param {Boolean} [purgeChildNodes] Specify whether to iterate through all child nodes removing all events by the specified type.  Defaults to false.
	*/
	this.removeAllEvents = function(type, purgeChildNodes) {
		var events = this.events ? this.events[type] : null;
		if (!events) return;
		if (events instanceof J2.Core.Event) {
			events.removeAllHandlers();
		}
		if (purgeChildNodes === true) {
			var children = this.getElementsByTagName("*");
			for (var i = children.length-1; i>=0; i--)
				if (typeof children[i].removeAllEvents === "function")
					children[i].removeAllEvents(type, false);
		}
	}
	/**
	* Purges all event handlers for a node.  Use to ensure no memory leaks when removing a node from the document.
	* @function
	* @name purgeEvents
	* @memberOf J2.Element.Tools
	* @param {Boolean} [purgeChildNodes] Specify whether to iterate through all child nodes purging all event handlers.  Defaults to true
	*/
	this.purgeEvents = function(purgeChildNodes) {
		this.events = null;
		var children = this.getElementsByTagName("*");
		if (purgeChildNodes !== false) {
			for (var i = children.length-1; i>=0; i--)
				if (typeof children[i].purgeEvents === "function")
					children[i].purgeEvents(type, false);
		}
	}
	/**
	* Fire an event programatically.  Event will bubble, but browser defaults will not fire
	* @function
	* @name fireEvent
	* @memberOf J2.Element.Tools
	* @param {String} type The type of event to fire.  Eg click, mouseover, keyup
	*/
	this.fireEvent = function(type, e) {
		var events = this.events,
			parent = this.parentNode;
			e = e || {target:this,type:type,manual:true};
		if (events && events[type] && typeof events[type].fire === "function")
			events[type].fire(e);
		//go through parents and if one has a fireEvent method, call it
		if (e.cancelBubble === true) return;
		do {
			if (parent && parent.isElementBound && typeof parent.fireEvent === "function") {
				parent.fireEvent(type, e);
				break;
			}
		} while ( parent = parent.parentNode )
	}
	/**
	* Add a delegate handler to a DOM node for an event type.
	* This is for adding event handlers for standard DOM events.
	* Each event type implements an instance of J2.Core.Event.
	* @function
	* @name addDelegate
	* @memberOf J2.Element.Tools
	* @param {String} type The type of event to handle.  Eg click, mouseover, keyup
	* @param {Function} check The checking function to determine if the node which activates the event is one to handle
	* @param {Function} handler The event handler
	* @param {Number} [sortIndex] The sort index for the delegate handler.  This runs in the sortIndex of the events of this type on the node.  Defaults to run first.
	* @example
	* function checkNode(handlingNode) {
	* 	//runs in the scope of the event source
	*	//gets passed the event object that fired the event and the node which is handling the delegate
	* 	return this.tagName.toLowerCase === "div";
	* }
	* function handler(e) {
	* 	//runs in the scope of the delegate node
	* 	//e.target references the firing node
	* 	e.target.addCssClass("clicked");
	* }
	* document.getElementById("myElement").addDelegate("click", checkNode, handler);
	*/
	this.addDelegate = function(type, check, handler, sortIndex) {
		if (typeof check !== "function" || typeof handler !== "function") 
			return;
		if (this.delegateFunctions == null)
			this.delegateFunctions = {};
		this.delegateFunctions[type] = {check: check, handler: handler};
		this.addEvent(type, delegateHandler, sortIndex || 1000);
	};
	function delegateHandler(e) {
		var delegateFunctions = this.delegateFunctions[e.type];
		if (delegateFunctions.check.call(e.target, e, this))
			return delegateFunctions.handler.call(this, e, e.target);
		return true;
	}
	var mouseEvents = new (function() {
		var check = function(e, handlingNode) {
			return e.relatedTarget !== handlingNode && !handlingNode.contains(e.relatedTarget);
		}
		this.mouseenter = function(el, fn, sortIndex) {
			el.addDelegate("mouseover", check, fn, sortIndex);
		}
		this.mouseleave = function(el, fn, sortIndex) {
			el.addDelegate("mouseout", check, fn, sortIndex);
		}
	});
	/**
	* Perform an animation based on changing a CSS property.  Animations will start immediately unless a wait has been setup on the element.  See the wait method for more details.
	* @function
	* @name animate
	* @memberOf J2.Element.Tools
	* @param {Object} details The specification of the animation to be performed.  Each item in the object should have the item name as the property to be animated.  The value can be an object specifying the end value, time to complete and specific transition for the specific property.  Each value other than the end value is optional.  Each property to be animated can have a different end value, time to complete and transition.  Alternatively, just an end value can be specified typically as a Number rather than a complete object.  See the examples and the JSquared website for more details and examples.
	* @param {Function} [callback] A function to be called once all specified properties have been animated to their completion.
	* @return {Node} This node for use in chaining
	* @example
	* //An animation of a single property specifying all details
	* var el = document.getElementById("TestDiv");
	* el.animate( { 
	*	"width": {
	*		to: 100,
	*		time: 750,
	*		transition: J2.Transitions.Quad.easeOut
	*	} 
	* } );
	* @example
	* //An animation of a single property specifying all details with a callback function
	* var el = document.getElementById("TestDiv");
	* el.animate( { 
	*	"width": {
	*		to: 100,
	*		time: 750,
	*		transition: J2.Transitions.Quad.easeOut
	*	} 
	* }, function() {
	*		//callback function
	* } );
	* @example
	* //An animation of multiple properties specifying all details for some
	* var el = document.getElementById("TestDiv");
	* el.animate( { 
	*	"width": {
	*		to: 100,
	*		time: 750,
	*		transition: J2.Transitions.Quad.easeOut
	*	},
	*	"height": 200
	* }, function() {
	*		//callback function
	* } );
	* @example
	* //An animation set being run as a chain on an element
	* var el = document.getElementById("TestDiv");
	* el
	* .animate( {width: 100} )
	* .animate( {height: 100} );
	*/
	this.animate = (function() {
		function animator(animations, element, id, callback, wait) {
		var x = 1;
		var interval,
			progress = 0,
			startTime,
			previouslyElapsedTime = 0;
		this.paused = false;
		this.wait = wait;
		this.play = play;
		
		this.play();
		
		this.stop = function(runToEnd) {
			clearInterval(interval);
			if (runToEnd === true) {
				for (var i = animations.length-1;i>=0;i--)
					animations[i].end();
			}
			end();
		}
		
		this.updateCallback = function(newCallBack) {
			var oldCallBack = callback;
			callback = function() {
				if (typeof oldCallBack === "function") {
					var me = this;
					setTimeout(function() {oldCallBack.call(me);}, 1);
				}
				newCallBack.call(this);
			}
		}
		
		this.pause = function() {
			clearInterval(interval);
			if (startTime)
				previouslyElapsedTime = new Date().getTime() - startTime;
			this.paused = true;
		}
		
		function play() {
			if (!this.wait) {
				startTime = new Date().getTime();
				interval = setInterval( step, 10 );
			}
			this.paused = false;
		}
		
		function end() {
			clearInterval(interval);
			var elementFX = element.FX;
			if (typeof callback === "function") callback.call(element);
			elementFX[id] = null;
		}

		function step() {
			var elapsed = new Date().getTime() - startTime + previouslyElapsedTime,
				animation,
				progress;
			if (elapsed === 0) return;
			for (var i = animations.length - 1; i>=0; i--) {
				animation = animations[i];
				if (elapsed >= animation.time) {
					animation.end();
					animations.splice(i,1);
				} else {
					progress = elapsed / animation.time;
					animation.update(progress);
				}
			}
			if (animations.length === 0) end();
		}
	}
		function animation(property, endVal, time, transition, element) {
		this.time = time;
		var startVal,
			range,
			direction,
			isColor = false;
			
		if (/color/i.test(property)) {
			isColor = true;
			endVal = endVal.indexes;
			startVal = element.getStyle(property).indexes;
			range = (function() {
				var r = [];
				for (var i = 0; i<=2; i++)
					r.push( Math.abs(startVal[i] - endVal[i]) );
				return r;
			})();
			direction = (function() {
				var d = [];
				for (var i = 0; i<=2; i++)
					d.push( startVal[i] < endVal[i] ? -1 : 1 );
				return d;
			})();
		} else {
			startVal = parseFloat(element.getStyle(property));
			range = Math.abs(startVal - endVal);
			direction = startVal < endVal ? -1 : 1;
		}
		
		this.update = function(progress) {
			if (isColor) {
				var newVal;
				if (progress === 1) {
					newVal = endVal;
				} else {				
					newVal = [
						getNewValue( progress, startVal[0], range[0], direction[0] ),
						getNewValue( progress, startVal[1], range[1], direction[1] ),
						getNewValue( progress, startVal[2], range[2], direction[2] )
					];
				}
				element.setStyle(property, newVal.toCssColor());
			} else {
				element.setStyle(property, progress === 1 ? endVal : getNewValue(progress, startVal, range, direction));
			}
		}
		this.end = function() {
			this.update(1);
		}
		
		function getNewValue(progress, startVal, range, direction) {
			return progress === 1 ? endVal : (progress === 0 ? startVal : transition(startVal, range, progress, direction));
		}
	}
		var	defaultDetails = {
			transition: J2.Transitions.linear,
			time: 500
		};
		function setupAnimations(animations, details, element) {
			var endVal,
				time,
				transition;
			for (var property in details) {
				if (typeof details[property] === "object" && !(details[property] instanceof J2.Core.CSSColor)) {
					endVal = details[property].to;
					time = details[property].time || defaultDetails.time;
					transition = details[property].transition || defaultDetails.transition;
				} else {
					endVal = details[property];
					time = defaultDetails.time;
					transition = defaultDetails.transition;
				}
				animations.push( new animation( property, endVal, time, transition, element ) );
			}
		}
		function getWaitCallback(me, FXid, thisFX, animations, details, waitTime) {
			return function() {
				setTimeout( function() {
					setupAnimations(animations, details, me);
					if (!thisFX[FXid]) return;
					thisFX[FXid].wait = false;
					if (!thisFX[FXid].paused)
						thisFX[FXid].play();
				}, waitTime);
			}
		}
		return function(details, callback) {
			var	animations = [],
				uID = "FX_",
				thisFX = this.FX,
				waiting = this.waiting,
				wait = false;
			
			if (thisFX == null) { 
				thisFX = this.FX = {};
				thisFX.count = 0;
			}
			uID = uID + thisFX.count;
			
			//check if we need to wait:
			if (waiting != null && waiting.length > 0) {
				var waitTime = waiting[0];
				waiting.splice(0,1);
				
				previousAnimation = thisFX["FX_" + (thisFX.count-1)];
				if (previousAnimation) {
					var me = this;
					previousAnimation.updateCallback( getWaitCallback(me, uID, thisFX, animations, details, waitTime) );
					wait = true;
				}
			}
			
			thisFX.count++;
			if (!wait) setupAnimations(animations, details, this);
			thisFX[uID] = new animator(animations, this, uID, callback, wait);
			return this;
		}
	})();
/**
	* Stop all currently paused animations on this element
	* @function
	* @name stop
	* @memberOf J2.Element.Tools
	* @param {Boolean} [runToEnd] Specify whether to move the animation to its end position immediately.  Defaults to false.
	* @return {Node} This node
	*/
	this.stop = function(runToEnd) {
		//stop all animations
		var thisFX = this.FX;
		if (thisFX == null) return this;
		
		for (var animation in thisFX)
			if (thisFX[animation] && thisFX[animation].stop)
				thisFX[animation].stop(runToEnd);
		return this;
	}
/**
	* Pause all currently running animations on this element
	* @function
	* @name pause
	* @memberOf J2.Element.Tools
	* @return {Node} This node
	*/
	this.pause = function() {
		//pause all animations
		var thisFX = this.FX;
		if (thisFX == null) return this;
		for (var animation in thisFX)
			if (thisFX[animation] && thisFX[animation].pause)
				thisFX[animation].pause();
		return this;
	}
/**
	* Play all currently paused animations on this element
	* @function
	* @name play
	* @memberOf J2.Element.Tools
	* @return {Node} This node
	*/
	this.play = function() {
		//stop all animations
		var thisFX = this.FX;
		if (thisFX == null) return this;
		for (var animation in thisFX)
			if (thisFX[animation] && thisFX[animation].play)
				thisFX[animation].play();
		return this;
	}
/**
	* Wait before executing the next animation.  Can be used independantly or in a chain.  When used in a chain, will force the next animation to wait even if no wait time is specified.
	* @function
	* @name wait
	* @memberOf J2.Element.Tools
	* @param {Number} [Time] The time to wait.  Defaults to zero.
	* @return {Node} This node
	*/
	this.wait = function(time) {
		var waiting = this.waiting;
		if (waiting == null) {
			waiting = this.waiting = [];
		}
		waiting.push(time || 1);
		return this;
	}
	});
});
//final bindings
(function() {
	if (/function|object/.test(typeof HTMLElement))
		J2.Core.bindElementTools( HTMLElement.prototype, true );
	else
		window.addDOMReadyEvent( function() { J2.Core.bindElementTools( document.getElementsByTagName("body")[0] ) }, null, -99999 );
	document.getElementsByTagName = J2.Core.newDOMMethods.getElementsByTagName( document.getElementsByTagName );
	document.getElementsByClass = document.getElementsByClassName = J2.Core.newDOMMethods.getElementsByClassName( document.querySelectorAll ? document.querySelectorAll : document.getElementsByClassName || null );
	document.getElementById = J2.Core.newDOMMethods.getElementById;
	document.createElement = J2.Core.newDOMMethods.createElement;
	document.getElementsByTagNames = J2.Element.Tools.getElementsByTagNames;
	window.addEvent = function(type, fn, sortIndex) {
		type = type.toLowerCase();
		if (type === "load") {
			window.addLoadEvent(fn, window, sortIndex);
		} else if (type === "domcontentloaded" || type === "domready") {
			window.addDOMReadyEvent(fn, window, sortIndex);
		} else {
			J2.Element.Tools.addEvent.apply(this, arguments);
		}
	};
})();
/**
* @fileOverview JSquared AJAX Object
* @name AJAX
*/
//check if J2 namespace exists and if not, create it
if (typeof J2 != "object") var J2 = {};
/**
* AJAX Object.  For sending AJAX requests and handling their responses.
* @constructor
* @name J2.AJAX
* @param {Object} [options] The options for this ADIJ instance
* @config {String} URL The URL for the src of the script tag
* @config {String} method The HTTP verb for this AJAX request (eg GET, POST)
* @config {Function} onSuccess The callback function for a successful AJAX request
* @config {Function} onFail The callback function for a failed AJAX request
* @config {Object} scope The scope for the callback function
* @config {Number} timeoutLength The time in milliseconds to wait for the request to be completed before failing the request with a timeout error.  Defaults to 12000 (12 seconds).
* @config {Array} headers An array of objects or arrays of headers to add to the request.
*/
J2.AJAX = function(options) {
	var timeoutLength = 12000;
	var requestObj = null;
	var requestDetails = { method: "get" };
	var timeout = null;
	var failed = false;
	var me = this;
	
	/* allow the passing in of an object literal */
	if (typeof options == "object") {
		requestDetails.URL = options.URL || null;
		requestDetails.method = options.method || requestDetails["method"];
		requestDetails.onSuccess = (typeof options.onSuccess == "function") ? options.onSuccess : null;
		requestDetails.onFail = (typeof options.onFail == "function") ? options.onFail : null;
		requestDetails.scope = (typeof options.scope == "object") ? options.scope : null;
		requestDetails.timeoutLength = options.timeoutLength || timeoutLength;
		if ( options.headers instanceof Array ) {
			for (var i = options.headers.length-1; i>=0; i--)
				addRequestHeader( options.headers[i][0] || options.headers[i]["key"] || null, options.headers[i][1] || options.headers[i]["value"] || null );
		}
	}
	
	function addRequestHeader(key, value) {
		if (key != null && value != null) {
			requestDetails.requestHeaders = requestDetails.requestHeaders || {};
			requestDetails.requestHeaders[key] = value;
		}
	}
	/**
	* Add an HTTP header to the request
	* @function
	* @name addRequestHeader
	* @memberOf J2.AJAX
	* @param {String} key The name of the HTTP header
	* @param {String} value The value of the HTTP header
	*/
	this.addRequestHeader = addRequestHeader;
	/**
	* Set or reset the URL for the request
	* @function
	* @name setUrl
	* @memberOf J2.AJAX
	* @param {String} url The URL for the request
	*/
	this.setUrl = function(url) {
		requestDetails.URL = url;
	}
	/**
	* Set or reset the callback function for a successful AJAX request
	* @function
	* @name setSuccessHandler
	* @memberOf J2.AJAX
	* @param {Function} func The callback function
	*/
	this.setSuccessHandler = function(func) {
		if (typeof func == "function")
			requestDetails.onSuccess = func;
	}
	/**
	* Set or reset the callback function for a failed AJAX request
	* @function
	* @name setFailHandler
	* @memberOf J2.AJAX
	* @param {Function} func The callback function
	*/
	this.setFailHandler = function(func) {
		if (typeof func == "function")
			requestDetails.onFail = func;
	}
	/**
	* Set the time in milliseconds to wait for the request to be completed before failing the request with a timeout error
	* @function
	* @name setTimeoutLength
	* @memberOf J2.AJAX
	* @param {Number} length The timeout length in milliseconds
	*/
	this.setTimeoutLength = function(length) {
		timeoutLength = length;
	}
	/**
	* Set or reset the scope for the callback functions
	* @function
	* @name setScope
	* @memberOf J2.AJAX
	* @param {Object} scope The scope for the callback functions
	*/
	this.setScope = function(o) {
		if (typeof o == "object")
			requestDetails.scope = o;
	}
	/**
	* Send the AJAX request.  If no URL has been provided, the send method will fail.
	* @function
	* @name send
	* @memberOf J2.AJAX
	* @param {String} [data] The data for the body of the request
	*/
	this.send = function(data) {
		//reset the failed notifier
		failed = false;
		//checl that a URL has been specified
		if (requestDetails.URL == null || requestDetails.URL == "")
			return false;
		//check for data and if not provided, set to the empty string
		if (arguments.length < 1 || data == null)
			data = "";
		//get an XMLHttpRequest object
		requestObj = requestObj || this.getRequestObject();
		//open the request
		requestObj.open(requestDetails.method, requestDetails.URL, true);
		//set the correct encoding type for post requests
		if (requestDetails.method.toLowerCase() == "post")
			requestObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
		//add the supplied headers to the request
		for (var key in requestDetails.requestHeaders)
			requestObj.setRequestHeader(key, requestDetails.requestHeaders[key]);
		//set the onreadystatechange handler
		requestObj.onreadystatechange = this.handleReadyStateChange;
		//initiate the timeout for handling request timeouts
		timeout = setTimeout(this.handleTimeout, requestDetails.timeoutLength);
		//send the request
		requestObj.send(data);
	}
	/**
	* Close the request object
	* @function
	* @name close
	* @memberOf J2.AJAX
	*/
	this.close = function() {
		requestObj.abort();
	}
	/**
	* Handle the timeout for timing out the request.  Will cause the timeout failure to be fired and will close the AJAX request.
	* @function
	* @name handleTimeout
	* @memberOf J2.AJAX
	*/
	this.handleTimeout = function() {
		me.clearTimeout();
		if (typeof requestDetails.onFail == "function") {
			failed = true;
			me.close();
			fail(J2.AJAX.FailureCodes.timeout);
		}
	}
	/**
	* Clear the timeout handling AJAX request timing.  Only call this method if the timout error should never fire or if it has already been fired.
	* @function
	* @name clearTimeout
	* @memberOf J2.AJAX
	*/
	this.clearTimeout = function() {
		clearTimeout(timeout);
	}
	//fail the request with the given fail code or with a general error if none is supplied
	function fail(failCode) {
		failed = true;
		requestDetails.onFail.call( requestDetails.scope || requestDetails.onFail, me, failCode || J2.AJAX.FailureCodes.general );
	}
	/**
	* Handles ready state changes for the AJAX request.
	* @function
	* @name handleReadyStateChange
	* @memberOf J2.AJAX
	*/
	this.handleReadyStateChange = function() {
		//if the request has already failed, dont bother going any further
		if (failed == true) return;
		//if the response has arrived
		if (requestObj.readyState == 4) {
			//clear the timeout to avoid firing a timeout error
			me.clearTimeout();
			//if the request has returned OK
			if (requestObj.status == 200) {
				//if a success handler has been provided, call it now and pass back in the AJAX object
				if (typeof requestDetails.onSuccess == "function")
					requestDetails.onSuccess.call( requestDetails.scope || requestDetails.onSuccess, me );
			} else {
				//set the failed notifier
				failed = true;
				//if a fail handler has been provided, call it
				if (typeof requestDetails.onFail == "function") {
					var status = requestObj.status;
					var failureCode = J2.AJAX.FailureCodes.general;
					//calculate if a fail code matches the status of the request
					for (var failType in J2.AJAX.FailureCodes) {
						if (J2.AJAX.FailureCodes[failType] == status) {
							failureCode = J2.AJAX.FailureCodes[failType];
							break;
						}
					}
					fail(failureCode);
				}
			}
		}
	}
	/**
	* Get a response header from the response to the request.
	* @function
	* @name getResponseHeader
	* @memberOf J2.AJAX
	* @return {String} The value of the response header
	*/
	this.getResponseHeader = function(headerName) {
		return requestObj.getResponseHeader(headerName);
	}
	/**
	* Get all the response headers.
	* @function
	* @name getAllResponseHeaders
	* @memberOf J2.AJAX
	* @return {String} The full list of response headers from the request
	*/
	this.getAllResponseHeaders = function() {
		return requestObj.getAllResponseHeaders();
	}
	/**
	* Get the response text returned from the request.
	* @function
	* @name getResponseText
	* @memberOf J2.AJAX
	* @return {String} The response text
	*/
	this.getResponseText = function() {
		return requestObj.responseText;
	}
	/**
	* Get the response XML if the response uses an XML mime type and is valid.
	* @function
	* @name getResponseXML
	* @memberOf J2.AJAX
	* @return {Document} The response XML
	*/
	this.getResponseXML = function() {
		return requestObj.responseXML;
	}
	/**
	* Gets the URL the request was made to.
	* @function
	* @name getUrl
	* @memberOf J2.AJAX
	* @return {String} The URL the request was sent to
	*/
	this.getUrl = function() {
		return requestDetails.URL;
	}
}
/**
* @static
* @class
* @prototype
* @name J2.AJAX.prototype
* @memberOf J2.AJAX
*/
/**
* Get an XMLHttpRequest object or a compatable object depending on the users browser 
* @function
* @name getRequestObject
* @memberOf J2.AJAX.prototype
* @return {XMLHttpRequest}
*/
J2.AJAX.prototype.getRequestObject = function() {
	J2.AJAX.supported = true;
	if (typeof XMLHttpRequest != "undefined" && typeof XMLHttpRequest != null) {
		return function() {
			return new XMLHttpRequest();
		}; 
	} else if (window.ActiveXObject) {
		return function() {
			return new ActiveXObject("Microsoft.XMLHTTP");
		};
	} else {
		J2.AJAX.supported = false;
		return function() {
			return null;
		}
	}
} ();
/**
* The J2.AJAX failure codes
* @static
* @class
* @name FailureCodes
* @memberOf J2.AJAX
*/
J2.AJAX.FailureCodes = {
	/**
	* A general failure
	* @type FailureCode
	* @name general
	* @memberOf J2.AJAX.FailureCodes
	*/
	general: "xx1",
	/**
	* HTTP response code 401
	* @type FailureCode
	* @name unauthorised
	* @memberOf J2.AJAX.FailureCodes
	*/
	unauthorised: 401,
	/**
	* HTTP response code 404
	* @type FailureCode
	* @name notFound
	* @memberOf J2.AJAX.FailureCodes
	*/
	notFound: 404,
	/**
	* HTTP response code 408.  Can also be created by the request timeout being fired.
	* @type FailureCode
	* @name timeout
	* @memberOf J2.AJAX.FailureCodes
	*/
	timeout: 408,
	/**
	* HTTP response code 500
	* @type FailureCode
	* @name server
	* @memberOf J2.AJAX.FailureCodes
	*/
	server: 500	
}
/**
* @fileOverview JSquared ADIJ Object
* @name ADIJ
*/
//check if J2 namespace exists and if not, create it
if (typeof J2 != "object") var J2 = {};
/**
* ADIJ object for dynamically creating script tags and appending them to the HEAD of the document.
* Used for asynchronously loading JavaScript and calling REST API's.
* @constructor
* @name J2.ADIJ
* @param {Object} [options] The options for this ADIJ instance
* @config {String} URL The URL for the src of the script tag
* @config {Function} onSuccess The callback function for the ADIJ request
* @config {Object} scope The scope for the callback function
* @config {Boolean} isJSONP Defines whether this request should conform to the JSON-P standard
* @config {String} JSONPParam The name of the callback querystring parameter for JSON-P style requests.  Defaults to "callback"
*/
J2.ADIJ = function(options) {
	//create requestDetails object and fulfill shared interface with AJAX object with getResponseText method
	var requestDetails = {
		getResponseText: function() {
			return this.json || "";
		}
	};
	//initialise requestDetails member values
	if (typeof options == "object") {
		requestDetails.URL = options.URL || null;
		requestDetails.scope = (typeof options.scope == "object") ? options.scope : null;
		requestDetails.onSuccess = (typeof options.onSuccess == "function") ? options.onSuccess : null;
		requestDetails.isJSONP = options.JSONP || false;
		requestDetails.JSONPParam = (typeof options.JSONPParam == "string") ? options.JSONPParam : "callback";
	}
	/**
	* Set or reset the URL for the request
	* @function
	* @name setUrl
	* @memberOf J2.ADIJ
	* @param {String} url The URL for the src of the script tag
	*/
	this.setUrl = function(url) {
		requestDetails.URL = url;
	}
	/**
	* Set or reset the callback function for the ADIJ request
	* @function
	* @name setSuccessHandler
	* @memberOf J2.ADIJ
	* @param {Function} func The callback function for the ADIJ request
	*/
	this.setSuccessHandler = function(func) {
		if (typeof func == "function")
			requestDetails.onSuccess = func;
	}
	/**
	* Set or reset the scope for the callback function
	* @function
	* @name setScope
	* @memberOf J2.ADIJ
	* @param {Object} scope The scope for the callback function
	*/
	this.setScope = function(scope) {
		if (typeof scope == "object")
			requestDetails.scope = scope;
	}
	/**
	* Send the ADIJ request - will write the script tag into the document
	* @function
	* @name send
	* @memberOf J2.ADIJ
	*/
	this.send = function() {
		this.sendRequest(requestDetails);
	}
}
// Create a prototype instance closure to hide shared Requests object
/**
* @static
* @class
* @prototype
* @name J2.ADIJ.prototype
* @memberOf J2.ADIJ
*/
J2.ADIJ.prototype = new (function() {
	//static references
	var headTag = null;
	var requestCount = 0;
	//storage for the requests
	var Requests = {};
	//get a new and unique ADIJ ID
	var getID = function() {
		requestCount++;
		return "ADIJ_" + requestCount;
	};
	var generateJSONPFunction = function(id) {
		window[id] = function(json) {
			J2.ADIJ.prototype.handleResponse(id, json);
			delete window[id];
		}
	};
	/**
	* Send the request by adding the script tag based on a series of request details.
	* @function
	* @name sendRequest
	* @memberOf J2.ADIJ.prototype
	* @param {Object} requestDetails The request details for this request.  Created via the J2.ADIJ.send method.
	*/
	this.sendRequest = function(requestDetails) {
		if (typeof requestDetails != "object") return;
		if (requestDetails.URL == null || requestDetails.URL == "") return false;
		if (requestDetails.id == null) requestDetails.id = getID();
		requestDetails.scriptTag = document.createElement("script");
		requestDetails.scriptTag.type = "text/javascript";
		requestDetails.scriptTag.src = requestDetails.URL + (requestDetails.URL.indexOf("?") > -1 ? "&" : "?") + "uqid=" + (new Date()).getTime() + "&rid=" + requestDetails.id;
		if (requestDetails.isJSONP) {
			requestDetails.scriptTag.src += "&" + requestDetails.JSONPParam + "=" + requestDetails.id;
			generateJSONPFunction(requestDetails.id);
		}
		if (headTag == null)
			headTag = document.getElementsByTagName("head")[0];
		headTag.appendChild(requestDetails.scriptTag);
		Requests[requestDetails.id] = requestDetails;
	}
	/**
	* Handles the ADIJ response.
	* @function
	* @name handleResponse
	* @memberOf J2.ADIJ.prototype
	* @param {Number} id The id of the ADIJ request being handled
	* @param {Object} json The JSON object returned from the request
	*/
	this.handleResponse = function(id, json) {
		if (Requests[id] == null) return false;
		Requests[id].json = json;
		if (Requests[id].scriptTag.parentNode)
			Requests[id].scriptTag.parentNode.removeChild(Requests[id].scriptTag);
		if (typeof Requests[id].onSuccess == "function")
			Requests[id].onSuccess.apply(Requests[id].scope || Requests[id].onSuccess, [Requests[id]].concat(Array.prototype.slice.call(arguments, 2)));
	}
});
/**
* @fileOverview JSquared AutoComplete Object
* @name AutoComplete
*/
/**
* Auto complete/filter object for filtering lists based on user input.
* Can be used for making suggest lists on search boxes etc
* @constructor
* @name J2.AutoComplete
* @param {Node} field The field to be managed by the object
* @param {Array} data The data to filter
* @param {Object} [options] The options for the filtering of the list
* @config {Boolean} matchAnyCharacter Defines whether to match any character in the data for filtering, or just from the start of the data.  For example, setting this to true would make "Sq" match JSquared.  Defaults to false.
* @config {Number} minLength The minimum number of characters the user has to enter before the filtering is activated.  Defaults to 1.
* @config {String} objectMemeber If the array of data is an array of objects, define the name of the member of each object to filter the list against
* @config {String} hoverCssClass The CSS class to apply to a filtered list item when the user hovers over it.  Default to "hover".
* @config {Boolean} display Specifies whether to add the filtered list as a set of DOM nodes to the document or not.  Defaults to true.
* @config {Function} onFilteredListDraw An optional callback function to call when the filtered list is added to the document or updated within the document.  The filtered data set is passed as an argument.  Runs in the scope of the root display node (an unordered list).
* @config {Function} onItemBound An optional callback function to call when an item in the original dataset is found to match the filtering characters.  The newly bound data item is passed as an argument.  Runs in the scope of the DOM node representing this data item (a list item).
* @config {Function} onItemSelect An optional callback function to call when an item in the filtered list is selected by the user.  The data item selected is passed as an argument.  Runs in the scope of the DOM node representing the seleced data item (a list item).
*/
J2.AutoComplete = function(field, data, options) {
	options = options || {};
	var objectMember = options.objectMember || null, workWithObjects = typeof objectMember === "string", minLength = options.minLength || 1;
	var rootDisplayNode = document.createElement("ul", {cssClass: "autoCompleteList"} );
	var fullDataSet = new J2.AutoComplete.DataSet(createInitialDataSet(), objectMember, options.matchAnyCharacter || false);
	var active = false;
	var hoverCssClass = options.hoverCssClass || "hover";
	/**
	* Activates the filtering.
	* All events will be bound to the field specified.
	* @function
	* @name activate
	* @memberOf J2.AutoComplete
	* @param {Boolean} [buildList] Specifies whether to immediately show the filtered list on activation
	*/
	this.activate = function(buildList) {
		if (active === false) {
			//add events to the field
			field.addEvent( "keyup", field_onKeyUp );
			field.addEvent( "keypress", field_onKeyPress );
			active = true;
			//display the filtered list if asked to
			if (buildList === true)
				this.filter();
		}
	};
	/**
	* Deactivate the filtering.
	* All events will be removed from the field specified.
	* The filtered list will be removed from the DOM if it is there.
	* @function
	* @name deactivate
	* @memberOf J2.AutoComplete
	*/
	this.deactivate = function() {
		if (active === true) {
			//remove events from field
			field.removeEvent( "keyup", field_onKeyUp);
			field.removeEvent( "keypress", field_onKeyPress );
			active = false;
			//remove the filtered list
			rootDisplayNode.remove();
		}
	};
	/*
	* Updates the root data set.  The new data set must be in exactly the same format as the old.  No other options can be changed from when they were passed into the object to begin with.  The object will be activated by this method.
	* @function
	* @name updateData
	* @memberOf J2.AutoComplete
	* @param {Array} newData The data to filter
	* @param {Boolean} [immediatelyFilter] Specify whether to immediately filter the new data as if a key has been pressed.  Defaults to true.
	*/
	this.updateData = function(newData, immediatelyFilter) {
		this.deactivate();
		tearDown(fullDataSet);
		data = newData;
		fullDataSet = new J2.AutoComplete.DataSet(createInitialDataSet(), objectMember, options.matchAnyCharacter || false);
		this.activate(immediatelyFilter !== false);
	}
	/*
	* Force the filtering to be done and the list to be displayed.  Only call when you want to programatically show the filtered set.
	* @function
	* @name filter
	* @memberOf J2.AutoComplete
	*/
	this.filter = function() {
		buildNodeList(fullDataSet.getFilteredSet(field.value.trim()));
	}
		
	//activate the filtered list object
	this.activate(false);
	
	function tearDown(dataSet) {
		if (!dataSet.nodes) return;
		for (var i = dataSet.nodes.length-1; i>=0; i--) {
			dataSet.nodes[i].purgeEvents(false);
		}
	}
	
	function field_onKeyPress(e) {
		var charCode = e.charCode || e.keyCode;
		//if enter has been pressed
		if (charCode === 13) {
			e.cancelBubble = true;
			//cancel the event
			return !selectHighlightedItem();
		}
	}
	
	function field_onKeyUp(e) {
		var nodeHighlightSuccess = true;
		//if the down arrow has been pressed
		if (e.keyCode === 40) {
			if (options.display !== false && highlightNextNode(1)) return;
			nodeHighlightSuccess = false;
		}
		//if the up arrow has been pressed
		if (e.keyCode === 38) {
			if (options.display !== false && highlightNextNode(-1)) return;
			nodeHighlightSuccess = false;
		}
		//if enter has been pressed
		if (options.display !== false && e.keyCode === 13) {
			e.cancelBubble = true;
			return !selectHighlightedItem();
		}
		//if escape has been pressed
		if (options.display !== false && e.keyCode === 27) {
			//remove the list by asking it to build an empty list - ensures the firing of the onFilteredListDraw event
			buildNodeList(J2.AutoComplete.DataSet.prototype.Empty);
			return true;
		}
		if (this.value.trim().length >= minLength) {	
			buildNodeList(fullDataSet.getFilteredSet(this.value.trim()));
		} else {
			//remove the list by asking it to build an empty list - ensures the firing of the onFilteredListDraw event
			buildNodeList(J2.AutoComplete.DataSet.prototype.Empty);
		}
		//check if the up or down arrow has been pressed and there is another node to highlight then do it
		if (options.display !== false && nodeHighlightSuccess === false) {
			if (e.keyCode === 40)
				highlightNextNode(1);
			if (e.keyCode === 38)
				highlightNextNode(-1);
		}
	}
	function buildNodeList( dataSet ) {
		var filter = field.value.trim();
		rootDisplayNode.removeAllChildren();
		//if there are no nodes to display
		if (dataSet.nodes.length === 0) {
			//remove the root node
			rootDisplayNode.remove();
			var allNodes = fullDataSet.getSet().nodes;
			//remove the hover class from all nodes
			for (var i = allNodes.length-1; i>=0; i--)
				allNodes[i].removeCssClass(hoverCssClass);
			//fire the onfilteredlistdraw event
			if (typeof options.onFilteredListDraw === "function")
				options.onFilteredListDraw.call(rootDisplayNode, dataSet);
			return;
		}
		//if we are to match any character, setup the regular expression to select the portion of the data that matches the filter value
		if (options.matchAnyCharacter === true)
			var regEx = new RegExp(filter, "i");
		var nodeValue;
		for (var i = 0, j = dataSet.nodes.length, node; i<j, node = dataSet.nodes[i]; i++) {
			nodeValue = workWithObjects ? dataSet.values[i][objectMember] : dataSet.values[i];
			//wrap the matching portion of the data in strong tags
			if (options.matchAnyCharacter === true) {
				node.innerHTML = nodeValue.replace(regEx, "<strong>" + nodeValue.match(regEx) + "</strong>");
			} else {
				node.innerHTML = "<strong>" + nodeValue.substr(0, filter.length) + "</strong>" + nodeValue.substr(filter.length);
			}
			//setup alternate row handling
			if (i % 2 === 0) {
				node.addCssClass("alternateRow");
			} else {
				node.removeCssClass("alternateRow");
			}
			//add the node to the root node
			rootDisplayNode.appendChild(node);
			//fire the onitembound event
			if (typeof options.onItemBound === "function")
				options.onItemBound.call(node, dataSet.values[i]);
		}
		//put the root display node into the document
		if (options.display !== false && rootDisplayNode.parentNode != field.parentNode)
			field.parentNode.insertAfter(rootDisplayNode, field);
		//call the onfilteredlistdraw event
		if (typeof options.onFilteredListDraw == "function")
			options.onFilteredListDraw.call(rootDisplayNode, dataSet, options.display);
	}
	//create the initial data set whcih will be used for filtering off of
	function createInitialDataSet() {
		var newDataSet = {};
		newDataSet.values = data;
		var nodeSet = [], node;
		//loop through all data items and build the elements to represent them
		for (var i = 0,j = data.length; i<j; i++) {
			nodeSet[i] = document.createElement("li");
			nodeSet[i].addEvent("mouseover", node_MouseOver);
			nodeSet[i].addEvent("mouseout", node_MouseOut);
			nodeSet[i].addEvent("click", node_Click);
			nodeSet[i].rootValue = workWithObjects ? data[i][objectMember] : data[i];
			nodeSet[i].rootData = data[i];
		}
		newDataSet.nodes = nodeSet;
		return newDataSet;
	}
	//highlight the next node in a particular direction - up or down.
	//used to handle keyboard interactions
	function highlightNextNode(direction) {
		var currentlyHighlightedNode = null;
		var currentNodes = rootDisplayNode.getElementsByTagName("li");
		var nodeToHighlight = null;
		if (currentNodes.length === 0) return false;
		//check if there is a currently highlighted node
		for (var i = currentNodes.length-1; i>=0; i--) {
			if (currentNodes[i].hasCssClass(hoverCssClass)) {
				currentlyHighlightedNode = currentNodes[i];
				break;
			}
		}
		if (currentlyHighlightedNode == null) {
			//if there is no currently highlighted node, select the first or last node depending on direction
			if (direction === 1) {
				nodeToHighlight = currentNodes[0];
			} else {
				nodeToHighlight = currentNodes[currentNodes.length-1];
			}
		} else {
			if (direction === 1) {
				if (currentlyHighlightedNode !== currentNodes[currentNodes.length]) {
					nodeToHighlight = currentlyHighlightedNode.getNextSibling("li");
				} else {
					nodeToHighlight = currentNodes[currentNodes.length];
				}
			} else {
				if (currentlyHighlightedNode !== currentNodes[0]) {
					nodeToHighlight = currentlyHighlightedNode.getPreviousSibling("li");
				} else {
					nodeToHighlight = currentNodes[0];
				}
			}
		}
		
		var allNodes = fullDataSet.getSet().nodes;
		for (var i = allNodes.length-1; i>=0; i--) {
			if (allNodes[i] === nodeToHighlight) {
				allNodes[i].addCssClass(hoverCssClass);
			} else {
				allNodes[i].removeCssClass(hoverCssClass);
			}
		}
		return true;
	}
	//used when the user presses enter on a highlighted node
	function selectHighlightedItem() {
		var currentNodes = rootDisplayNode.getElementsByTagName("li");
		var currentlyHighlightedNode = null;
		if (currentNodes.length === 0) return false;
		for (var i = currentNodes.length-1; i>=0; i--) {
			if (currentNodes[i].hasCssClass(hoverCssClass)) {
				currentlyHighlightedNode = currentNodes[i];
				break;
			}
		}
		if (currentlyHighlightedNode == null) return false;
		selectNode(currentlyHighlightedNode);
		return true;
	}
	function node_MouseOver() {
		var allNodes = fullDataSet.getSet().nodes;
		for (var i = allNodes.length-1; i>=0; i--)
			allNodes[i].removeCssClass(hoverCssClass);
		this.addCssClass(hoverCssClass);
	}
	function node_MouseOut() {
		this.removeCssClass(hoverCssClass);
	}
	function node_Click(e) {
		selectNode(this);
		e.cancelBubble = true;
		return false;
	}
	function selectNode(node) {
		field.value = node.rootValue;
		buildNodeList(J2.AutoComplete.DataSet.prototype.Empty);
		if (typeof options.onItemSelect === "function")
			options.onItemSelect.call(node, node.rootData);
		rootDisplayNode.remove();
	}
}

J2.AutoComplete.DataSet = function(data, objectMember, matchAnyCharacter) {
	var filteredSets = {};
	this.getFilteredSet = function(filter) {
		if (filteredSets[filter] == null)
			filteredSets[filter] = new J2.AutoComplete.DataSet( this.filterSet(filter, data, objectMember, matchAnyCharacter) );
		return filteredSets[filter].getSet();
	}
	this.getSet = function() {
		return data;
	}
}
J2.AutoComplete.DataSet.prototype = {
	Empty: {values:[], nodes:[], isEmpty: true},
	filterSet: function(filter, data, objectMember, matchAnyCharacter) {
		var workWithObjects = typeof objectMember == "string";
		var filteredSet = {values:[], nodes:[]};
		var expression = matchAnyCharacter === true ? filter : "^" + filter + ".*$";
		var regEx = new RegExp(expression, "i"), regExResult = false;
		for (var i = 0, j = data.values.length; i<j; i++) {
			if (workWithObjects) {
				regExResult = regEx.test(data.values[i][objectMember])
			} else {
				regExResult = regEx.test(data.values[i]);
			}
			if (regExResult === true) {
				filteredSet.values.push(data.values[i]);
				filteredSet.nodes.push(data.nodes[i]);
			}
		}
		return filteredSet;
	}
}
/**
* @fileOverview JSquared Cache Object
* @name Cache
*/
//check if J2 namespace exists and if not, create it
if (typeof J2 !== "object") var J2 = {};
/**
* Generic caching object for storing any values.
* @constructor
* @name J2.Cache
*/
J2.Cache = function() {
	var	cache = {},
		me = this;
	/**
	* Puts an item in the cache.  Will overwrite if the item already exists
	* @function
	* @name put
	* @memberOf J2.Cache
	* @param {String} id The name of the cache item
	* @param {Any} value The value of the cache item
	* @param {Number} [time] Defines how long an item should exist in the cache
	*/
	this.put = function(id, value, time) {
		this.remove(id);
		cache[id] = value;
		if (time && !isNaN(time)) {
			cache[id].time = setTimeout( function() { me.remove(id) }, time );
		}
	}
	/**
	* Get an item from the cache
	* @function
	* @name get
	* @memberOf J2.Cache
	* @param {String} id The name of the cache item to get
	* @return {Any or undefined} The value stored in the cache
	*/
	this.get = function(id) {
		return cache[id];
	}
	/**
	* Delete an item from the cache
	* @function
	* @name delete
	* @memberOf J2.Cache
	* @param {String} id The name of the cache item to delete
	*/
	this.remove = function(id) {
		delete cache[id];
	}
}
/**
* @fileOverview JSquared Cookie Object
* @name Cookie
*/
//check if J2 namespace exists and if not, create it
if (typeof J2 !== "object") var J2 = {};
/**
* Cookie object for adding, getting, setting and deleting cookies.
* @constructor
* @name J2.Cookie
* @static
*/
J2.Cookie = new (function() {
	var Collection = null;
	function init() {
		Collection = {};
		var cookies = document.cookie.split(";");
		var cookie;
		for (var i = cookies.length - 1; i >= 0; i--) {
			cookie = cookies[i].split("=");
			if (cookie.length >= 2)
				Collection[cookie[0]] = cookie[1];
		}
		init = function() {};
	}
	/**
	* Set the value of a cookie
	* @function
	* @name set
	* @memberOf J2.Cookie
	* @param {String} name The name of the cookie
	* @param {String} value The value of the cookie
	* @param {Number or Date} [days] The number of days this cookie should last or the date it should expire as a Date object
	*/
	this.set = function(name, value, days) {
		init();
		var expires = "";
		if (days) {
			var date = days;
			if (!(date instanceof Date)) {
				date = new Date()
				date.setDate(date.getDate() + (days || -1));
			}
			expires = "expires=" + date.toGMTString();
		}
		var cookie = name + "=" + value + ";expires=" + expires + ";path=/";
		document.cookie = cookie;
		Collection[name] = value;
	}
	/**
	* Get the value of a cookie
	* @function
	* @name get
	* @memberOf J2.Cookie
	* @param {String} name The name of the cookie to get
	* @return {String} The value of the cookie
	*/
	this.get = function(name) {
		init();
		return Collection[name] || "";
	}
	/**
	* Remove a cookie
	* @function
	* @name remove
	* @memberOf J2.Cookie
	* @param {String} name The name of the cookie to remove
	*/
	this.remove = function(name) {
		init();
		this.set(name, "", -1);
		delete Collection[name];
	}
});
/*
Depends on core library
*/
/**
* @fileOverview JSquared ImageRollover Object
* @name ImageRollover
*/
/**
* Create simple image rollovers
* @constructor
* @name J2.ImageRollover
* @param {Node} node The node to monitor mouse events on
* @param {Node} image The image node to change when mouse events are detected
* @param {String} hoverImagePath The path to the image which is to be treated as the hover image
*/
J2.ImageRollover = function(node, image, hoverImagePath) {
	if (hoverImagePath === "" || hoverImagePath == null || image == null) return;
	var hoverImage = document.createElement("img", {src:hoverImagePath} );
	var nonHoverImagePath = image.src;
	node.addEvent("mouseover", node_onMouseOver);
	node.addEvent("mouseout", node_onMouseOut);
	function node_onMouseOver() {
		image.src = hoverImagePath;
	}
	function node_onMouseOut() {
		image.src = nonHoverImagePath;
	}
};
/**
* @fileOverview JSquared QueryString Object
* @name QueryString
*/
//can support multiple querystring items with the same key
/**
* Object for accessing data on the QueryString of the current document.  Created using the <a href="String.html#unDelimit">unDelimit</a> method on the String prototype
* @constructor
* @name J2.QueryString
* @static
*/
J2.QueryString = location.search.slice(1).unDelimit();
/**
* @fileOverview JSquared TabSet element tool extension
* @name TabSet
*/

/**
* This object no longer exists.  To create a tabset, please see the <a href="J2.Element.Tools.html#makeTabset">makeTabset element tool</a>.
* @constructor
* @static
* @name J2.TabSet
*/

/**
* Create a tabset where only one tab is visible at a time.  On creation, the first tab will be activated.  By default the CSS classes applied are: <br/>Tab is selected: "tabSelected"<br/>Tab content is selected: "tabVisible"<br/>Tab content is unselected: "tabHidden"<br/>By default the tabSetData will be discovered by picking all the anchors with a CSS clas of "tabActivator" below this node.  Each anchor becomes a tab selector.  Its corresponding tab content node will be discovered by selecting from the document an element whos ID matches the hash value of the href of the anchor.<br/>
* This object is only available when and only when the TabSet file is included in the library
* @function
* @name makeTabset
* @memberOf J2.Element.Tools
* @param {Object} [options] Any options to supply the tabset object.  When not provided the default are used.
* @config {Array} [tabSetData] An array of objects where each object contains two members, both nodes, "activator" and "content".  The activator is the node which when clicked will show the specified content node. 
* @config {Object} [tabSetCssData] An object containing the details of the CSS classes which should be applied to the activator nodes when selected and the content nodes when visible or hidden.
*/
(function() {
	var tabSet = function(tabSetData, tabSetCssData) {
		//setup css data
		this.tabSetCssData = tabSetCssData || {
			tabSelected: "tabSelected",
			tabContentSelected: "tabVisible",
			tabContentUnselected: "tabHidden"
		};
		this.currentTab = -1;
		//expose the tabSetData
		this.tabSetData = tabSetData;
		//setup tabSetData
		for (var i = tabSetData.length-1; i>=0; i--) {
			if (tabSetData[i].activator == null || tabSetData[i].content == null) continue;
			J2.Core.bindElementTools(tabSetData[i].activator).addEvent("click", handleTabClick);
			tabSetData[i].activator.tabIndex = i;
			J2.Core.bindElementTools(tabSetData[i].content);
		}
		//set initial state
		this.hideAllTabs(tabSetCssData);
		this.showTab(0, tabSetCssData);
		
		var me = this;
		function handleTabClick(e) {
			var tabIndex = this.tabIndex;
			me.hideTab();
			me.showTab(tabIndex);
		}
	}
	tabSet.prototype = {
		hideAllTabs: function() {
			for (var i = this.tabSetData.length-1; i>=0; i--) {
				this.tabSetData[i].content.removeCssClass(this.tabSetCssData.tabContentSelected);
				this.tabSetData[i].activator.removeCssClass(this.tabSetCssData.tabSelected);
				this.tabSetData[i].content.addCssClass(this.tabSetCssData.tabContentUnselected);
			}
		},
		hideTab: function() {
			this.tabSetData[this.currentTab].content.removeCssClass(this.tabSetCssData.tabContentSelected);
			this.tabSetData[this.currentTab].activator.removeCssClass(this.tabSetCssData.tabSelected);
			this.tabSetData[this.currentTab].content.addCssClass(this.tabSetCssData.tabContentUnselected);
		},
		showTab: function(tabIndex) {
			this.currentTab = tabIndex;
			this.tabSetData[tabIndex].content.removeCssClass(this.tabSetCssData.tabContentUnselected);
			this.tabSetData[tabIndex].content.addCssClass(this.tabSetCssData.tabContentSelected);
			this.tabSetData[tabIndex].activator.addCssClass(this.tabSetCssData.tabSelected);
		}
	}
	
	function createTabSetData(root) {
		var	tabSetData = [],
			activators = root.getElementsByClassName( {cssClass: "tabActivator", tags: "a", callback: addActivator} );
		return tabSetData;
			
		function addActivator() {
			var content = document.getElementById(this.hash.slice(1));
			if (content) {
				tabSetData.push({
					activator: this,
					content: content
				});
			}
		}
	}
	
	J2.Core.addElementTool("makeTabset", function(options) {
		options = options || {};
		new tabSet(options.tabSetData || createTabSetData(this), options.tabSetCssData);
	});
})();
/*
	NOTE:
		Currently working in Firefox, IE 6+, Safari 3 Mac+PC only.
		For IE, add the following code somewhere in the HTML:
			<!--[if IE]>
			<iframe src="iframe.html" width="0" height="0" id="URLFrame" style="visibility:none;" />
			<![endif]-->
		The iframe src needs to point to a real URL, but the page can be completely blank.
	NOTE:
		JSquared Core Library is required
*/

/**
* @fileOverview JSquared URL Object - A browser history manager
* @name URL
*/
//check if J2 namespace exists and if not, create it
if (typeof J2 !== "object") var J2 = {};
/**
* Browser history manager object
* @constructor
* @static
* @name J2.URL
*/
J2.URL = new (function() {
		var delim = ";";
		var members = {};
		var started = false;
		var timeout, timeoutLength = 100;
		/**
		* Set the polling interval to check the URL of the document.  
		* Defaults to 100.
		* Range must be between 35 and 2500
		* @function
		* @name setPollingInterval
		* @memberOf J2.URL
		* @param {Number} length The length of the polling interval in milliseconds
		*/
		this.setPollingInterval = function(length) {
			timeoutLength = length < 35 ? 35 : (length > 2500 ? 2500 : length);
		};
		/**
		* Get a new or existing member object to register with the URL manager.
		* A member manages its own data for a single key.
		* If an existing member with the given key exists, that will be returned.
		* @function
		* @name getMember
		* @memberOf J2.URL
		* @param {String} key The key for this member.  Becomes the name of the data item in the URL
		* @param {Function} callback The function to call when the data item value in the URL changes (when the user presses back or forwards or arrives from a bookmark etc)
		* @param {Object} [options] Options for the member
		* @config {Object} scope The scope for the callback function
		* @config {String} initialValue The initial value of the member
		* @return {J2.URL.Member} The member created or retrieved from the list of members
		*/
		this.getMember = function( key, callback, options ) {
			if (members[key] == null) {
				if (typeof callback !== "function") return null;
				return new Member( key, callback, options, update );
			} else {
				return members[key];
			}
		};
		/**
		* Register a member with the URL manager.
		* Cannot register a member more than once.
		* @function
		* @name register
		* @memberOf J2.URL
		* @param {J2.URL.Member} member The member to register
		* @return {Boolean} Has the member been registered successfully.
		*/
		this.register = function( member ) {
			if (!member instanceof Member) return false;
			//does this member already exist in the list of members?
			if (members[member.key()] != null) return true;
			stopChecking();
			member.registered = true;
			members[member.key()] = member;
			//if the URL object has already been started by its own initialisation then restart the URL monitoring
			if (started)
				startChecking();
			return true;
		};
		
		window.addLoadEvent(function() {
			started = true;
			for (var m in members) {
				if (members[m] instanceof Member) {
					timeoutHandler();
					break;
				}
			}
		}, -1001);
		
		var getBrowserUrl = function() {
			if (document.getElementById("URLFrame")) {
				return function() {
					location.hash = document.frames["URLFrame"].location.search.slice(1);
					return document.frames["URLFrame"].location.search.slice(1);
				};
			} else {
				return function() {
					return location.hash.slice(1);
				};
			}
		}();
		
		var setBrowserUrl = function() {
			if (document.getElementById("URLFrame")) {
				document.frames["URLFrame"].location.replace(document.frames["URLFrame"].location.pathname + "?" + location.hash.slice(1));
				return function(newUrl) {
					document.getElementById("URLFrame").setAttribute("src", document.frames["URLFrame"].location.pathname + "?" + newUrl);
					location.hash = newUrl;
				};
			} else {
				return function(newUrl) {
					location.hash = newUrl;
				};
			}
		}();
		
		function update() {
			stopChecking();
			var newUrl = "";
			for (var key in members) {
				newUrl = newUrl + (newUrl.length === 0 ? "" : delim);
				newUrl = key + "=" + members[key].getValue();
			}
			setBrowserUrl(newUrl);
			startChecking();
		}
		
		function startChecking() {
			timeout = setTimeout(timeoutHandler, timeoutLength);
		}
		function stopChecking() {
			clearTimeout(timeout);
		}
		
		function timeoutHandler() {
			var currentURL = getURLObject(),
				currentURLVal;
			for (var key in members) {
				currentURLVal = currentURL[key] || "";
				if (members[key].getValue() !== currentURLVal) 
					members[key].callback(currentURLVal);
			}
			startChecking();
		}
		function getURLObject() {
			var url = getBrowserUrl(), urlObject = {}, key, value, itemData;
			url = url.split(delim);
			for (var i = url.length-1; i>=0; i--) {
				itemData = url[i].split("=");
				key = itemData[0];
				urlObject[key] = itemData.slice(1).join("=");
			}
			return urlObject;
		}
		/**
		* This constructor cannot be initiated directly.  Call J2.URL.getMember to create.
		* @static
		* @constructor
		* @name J2.URL.Member
		*/
		var Member = function(key, callback, options, update) {
			/**
			* Identify whether this member has already been registered
			* @name registered
			* @memberOf J2.URL.Member
			* @type Boolean
			*/
			this.registered = false;
			var scope = window;
			var currentValue = "";
			if (typeof options === "object") {
				scope = options.scope || scope;
				currentValue = options.initialValue || currentValue;
			}
			/**
			* Get the key for this member
			* @function
			* @name key
			* @memberOf J2.URL.Member
			* @return {String} The key.
			*/
			this.key = function() {
				return key;
			};
			/**
			* Update the value of this member.  This will cause the actual URL of the page to be updated as well.
			* Calling this function will create a history point and update the URL of the page.
			* @function
			* @name updateValue
			* @memberOf J2.URL.Member
			* @param {String} data The new value of this member
			*/
			this.updateValue = function(data) {
				currentValue = data;
				if (typeof update === "function")
					update();
			};
			/**
			* Get the current value of this member
			* @function
			* @name getValue
			* @memberOf J2.URL.Member
			* @return {String} The current value
			*/
			this.getValue = function() {
				return currentValue;
			};
			/**
			* Set the current value without causing the URL of the page to change or creating a history point.
			* Will call the callback function specified for this member indicating a change in value.
			* @function
			* @name callback
			* @memberOf J2.URL.Member
			* @param {String} newValue The new value of this member
			*/
			this.callback = function( newValue ) {
				currentValue = newValue;
				callback.call(scope, {"value": newValue, "key": key});
			};
		};
		
	}
)();
