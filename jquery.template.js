/**
 * jQuery Template Plugin 0.2.0
 * https://github.com/pingless/jquery-template
 *
 * Copyright 2015 Paul Lessing
 * Licensed under the MIT license
 * 
 * Calling $.template() on a node turns that element into a template, and removes it from the DOM.
 * The returned Template object provides a function, create(),
 * which creates a copy of the template with the given parameters inserted.
 * 
 * The copy can be either manually inserted (it is a DOM node without a parent),
 * or directly inserted as a child of the parent of the original template root.
 */
;(function($) {
	"use strict";

	$.fn.extend({
		template: function(removeFromDom) {
			if (typeof removeFromDom === 'undefined') {
				removeFromDom = true;
			}
			if (!$(this).length) {
				return null; // Don't create a template from an empty selector
			}
			// Only use the first element found, otherwise we won't be able to consistently return one element.
			return new Template($(this).first(), !!removeFromDom);
		}
	});

	function Template(root, removeFromDom) {
		var dom = {};
		var self = this;

		function init() {
			var $root = $(root);
			dom.parent = $root.parent();

			if (removeFromDom) {
				dom.root = $root;
				dom.root.remove();
			} else {
				dom.root = $root.clone();
			}

			dom.root.removeClass('template'); // If present
			dom.root.data('template', self);
		}

		/**
		 * Parses the given DOM root for elements with "data-template" attributes
		 * and creates a DOM structure which can be used to insert content.
		 * 
		 * @param root {object} a copy of the dom.root object.
		 * @return {object} A key-value map where the keys are the values of the data-template attributes,
		 *                  and the values are jQuery objects containing all elements with those attributes.
		 */
		function getDom(root) {
			var thisDom = {};
			root.find('[data-template]').each(function() {
				var $elt = $(this);
				var param = $elt.data('template');
				$elt.removeAttr('data-template');
				if (!thisDom[param]) {
					thisDom[param] = $();
				}
				thisDom[param] = thisDom[param].add($elt);
			});
			return thisDom;
		}

		/**
		 * Create a new copy of the template, inserting the given parameters as content for the matching tags.
		 * 
		 * @param insertInPlace {boolean} (optional) Append the new instance to the parent of the original template
		 * @param params {object} A key-value map of parameters. The following types will be accepted:
		 *                        * String: Plaintext, will be escaped
		 *                        * Function: No-argument function, will be called.
		 *                                    The result has the same rules applied again (e.g. string will be escaped plaintext).
		 *                        * Object: Possible keys:
		 *                          * text: Escaped plaintext, same as passing a string
		 *                          * html: Value will be inserted as HTML (using $.html)
		 *                          * callback: Function taking the jQuery element as parameter.
		 *                                      The function can manipulate the element as required.
		 */
		this.create = function(insertInPlace, data) {
			if (typeof data === 'undefined') {
				data = insertInPlace;
				insertInPlace = false;
			}
			var copy = dom.root.clone();
			var copyDom = getDom(copy);
			$.each(data || {}, // Ensure this loop doesn't break even if create() was called without parameters
					function(key, value) {
				var $target = copyDom[key];
				if ($target) {
					applyValue($target, value);
				}
			});
			if (insertInPlace) {
				dom.parent.append(copy);
			}
			copy.data('template', self);
			return copy;
		}

		function applyValue($target, value) {
			switch (typeof value) {
			case 'boolean': // Fall-through to String
			case 'number': // Fall-through to String
			case 'string':
				$target.text(value);
				break;
			case 'object':
				if (!value) {
					// If null or undefined is passed in we empty the element
					$target.text('');
					break;
				}
				if (value.hasOwnProperty('text')) {
					$target.text(value.text);
				} else if (value.hasOwnProperty('html')) {
					$target.html(value.html);
				} else if (value.hasOwnProperty('callback')) {
					value.callback($target);
				}
				break;
			case 'function':
				// Callback produces a regular value for this function, so recurse
				var newValue = value();
				applyValue($target, newValue);
				break;
			default:
				$target.text('');
			}
		}

		/**
		 * Used for testing
		 */
		this._getTemplateObject = function() {
			return dom.root;
		};

		init();
	}
})(jQuery);