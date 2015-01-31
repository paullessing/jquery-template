/**
 * Version 0.0.1
 * By Paul Lessing (paul@paullessing.com)
 * Licensed under the MIT license
 */
;(function($) {
	function Template(root) {
		var dom = {};
		var self = this;
		
		function init() {
			dom.root = $(root);
			dom.root.removeClass('template'); // If present
			dom.root.remove();
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
		
		this.newInstance = function(params) {
			var copy = dom.root.clone();
			var copyDom = getDom(copy);
			$.each(params, function(key, value) {
				var $target = copyDom[key];
				if ($target) {
					applyValue($target, value);
				}
			});
			return copy;
		}
		
		function applyValue($target, value) {
			switch (typeof value) {
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
		
		init();
	}
	
	$.fn.extend({
		template: function() {
			if (!$(this).length) {
				return; // Don't create a template from an empty selector
			}
			// Only use the first element found, otherwise we won't be able to consistently return one element.
			return new Template($(this).first());
		}
	});
})(jQuery);