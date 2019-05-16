sap.ui.define([
		"sap/ui/thirdparty/jquery",
	],
	function (jQuery) {
		"use strict";
		var InterruptedArrayIterator = function(inpArray){
			this._currentIndex = 0;
			this._inArr = inpArray;
		};

		InterruptedArrayIterator.prototype.nextItem = function(callBackFn){
			var clientDefrredControl = new jQuery.Deferred(), that = this;
			var to1 = setTimeout(function () {
				clientDefrredControl.done(function () {
					that._currentIndex++;
					if (that._currentIndex < that._inArr.length) {
						return that.nextItem(callBackFn);
					} else {
						callBackFn.apply(that, [undefined, undefined]);
					}
				});
				clearTimeout(to1);
			});
			return callBackFn.apply(this, [this._inArr[this._currentIndex], clientDefrredControl]);
		};

		return InterruptedArrayIterator;
	});
