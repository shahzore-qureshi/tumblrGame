/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License v. 2.0 as published by Mozilla.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Mozilla Public License v. 2.0 for more details.

 * You should have received a copy of the Mozilla Public License v. 2.0
 * along with the Game Closure SDK.  If not, see <http://mozilla.org/MPL/2.0/>.
 */
import event.Emitter as Emitter;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._defaultOpts = opts.defaultOpts || {};
		this._items = [];
		this._itemsUsed = 0;

		this.length = 0;
	};

	/**
	 * Find an item in the pool which is not used, if there are no free items then create a new item
	 */
	this._allocItem = function (ctor, type) {
		var found = false;
		var itemsUsed = this._itemsUsed;

		type = type || 0;

		while (!found) {
			if (itemsUsed >= this._items.length) {
				var defaultOpts = {};
				for (var i in this._defaultOpts) {
					defaultOpts[i] = this._defaultOpts[i];
				}

				var item = new ctor(defaultOpts);
				this._items.push(item);
				found = true;

				// It's possible that the items before itemsUsed are not of the same type
				// and that itemsUsed is higher than this._itemsUsed.
				//
				// Swap the item with the last used item in the list to make sure that
				// the new item is the last item in the list!
				var temp = this._items[this._itemsUsed];
				this._items[this._itemsUsed] = this._items[this._items.length - 1];
				this._items[this._items.length - 1] = temp;
			} else {
				var item = this._items[itemsUsed];
				if (item.type === type) {
					// Make sure that the item is the last item in the list!
					this._items[itemsUsed] = this._items[this._itemsUsed];
					this._items[this._itemsUsed] = item;
					found = true;
				} else {
					itemsUsed++;
				}
			}
		}

		item.type = type;

		this._itemsUsed++;
		return item;
	};

	this.clear = function () {
		var items = this._items;
		var i = items.length;

		while (i) {
			items[--i].destroy();
		}

		this._items = [];
		this._itemsUsed = 0;
	};

	this.reset = function () {
		this.clear();
	};

	/**
	 * Call tick in all models in the pool, if the function returns true then remove the item from the pool
	 */
	this.tick = function (dt) {
		var items = this._items;
		var i = 0;
		var j = this._itemsUsed;

		this.length = this._itemsUsed;
		while (i < j) {
			var item = items[i];

			if (item.tick(dt)) {
				item.destroy();
				this._itemsUsed--;
				j--;

				items[i] = items[this._itemsUsed];
				items[this._itemsUsed] = item;
			} else {
				i++;
			}
		}
	};

	this.getItems = function () {
		return this._items;
	};
});