sap.ui.define([
		'sap/ui/layout/form/SimpleForm',
		'sap/ui/layout/form/SimpleFormRenderer',
		'sap/ui/core/Control',
		'sap/m/library',
		"sap/ui/thirdparty/jquery",
		'sap/ui/core/EnabledPropagator'
	],
	function (
		SimpleForm,
		SimpleFormRenderer,
		Control,
		mLibrary,
		jQuery,
		EnabledPropagator
	) {
		"use strict";

		var addressControl = SimpleForm.extend("com.demo.workOrder.controls.AddressInput", /** @lends sap.ui.layout.form.SimpleForm */ {
			metadata: {
				library: "com.demo.workOrder"
			},
			renderer: SimpleFormRenderer
		});
		var rootContainer = sap.ui.core.Component.get("container-booking");
		addressControl.prototype.rb = rootContainer.getModel("i18n").getResourceBundle();

		EnabledPropagator.call(addressControl.prototype);

		addressControl.prototype.applySettings = function (mSettings) {
			if (jQuery.isEmptyObject(mSettings)) {
				mSettings = {};
			}
			jQuery.extend(mSettings, {
				editable: true,
				layout: "ResponsiveGridLayout",
				adjustLabelSpan: false,
				emptySpanXL: 1,
				emptySpanL: 1,
				emptySpanM: 1,
				emptySpanS: 1,
				labelSpanS: 5,
				singleContainerFullSize: true,
				width: "100%",
				content: [
					new sap.m.Label({
						text: this.rb.getText("ADDRESS_LINE_1")
					}),
					new sap.m.Input(this.getId()+"-adrLine1",{
						maxLength: 50
					}),
					new sap.m.Label({
						text: this.rb.getText("ADDRESS_LINE_2")
					}),
					new sap.m.Input(this.getId()+"-adrLine2",{
						maxLength: 50
					}),
					new sap.m.Label({
						text: this.rb.getText("ADDRESS_ZIP_CODE")
					}),
					new sap.m.Input(this.getId()+"-adrPin",{
						type: mLibrary.InputType.Number,
						maxLength: 6
					}),
					new sap.m.Label({
						text: this.rb.getText("ADDRESS_CITY")
					}),
					new sap.m.Input(this.getId()+"-adrCity",{
						maxLength: 20
					}),
					new sap.m.Label({
						text: this.rb.getText("ADDRESS_STATE")
					}),
					new sap.m.Input(this.getId()+"-adrState",{
						maxLength: 20
					}),
				]
			});
			if (SimpleForm.prototype.applySettings) {
				SimpleForm.prototype.applySettings.call(this, mSettings);
			}

		};

		addressControl.prototype.getValueObject = function () {
			var currId = this.getId()+"-";
			var addressObject = {
				"adrLine1": this._getControlById(currId+"adrLine1").getValue(),
				"adrLine2": this._getControlById(currId+"adrLine2").getValue(),
				"adrPin": this._getControlById(currId+"adrPin").getValue(),
				"adrCity": this._getControlById(currId+"adrCity").getValue(),
				"adrState": this._getControlById(currId+"adrState").getValue()
			};
			return addressObject;
		};
		addressControl.prototype.getValueString = function () {
			var addressObject = this.getValueObject();
			var addrStr = addressObject.adrLine1+", "+addressObject.adrLine2+", "+addressObject.adrPin+", "+addressObject.adrCity+", "+addressObject.adrState;
			return addrStr;
		};

		addressControl.prototype._getControlById = function (id) {
			return sap.ui.getCore().byId(id);
		};

		return addressControl;

	});
