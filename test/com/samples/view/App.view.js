sap.ui.jsview("com.samples.view.App", {
    getControllerName: function() {
        "use strict";
        return "com.samples.controller.App";
    },
    createContent: function(oController) {
        "use strict";
        this.rb = this.getModel("i18n").getResourceBundle();
		var oLayout1 = new sap.ui.layout.form.ResponsiveLayout();
		var oForm1 = new sap.ui.layout.form.Form(this.createId("appointmentVBox"), {
			title: new sap.ui.core.Title({
				text: this.rb.getText("APPOINTMENT_HEADER_TEXT"),
				emphasized: true
			}),
			editable: false,
			layout: oLayout1
		});
		var workTypeTemplate = new sap.ui.core.Item({
			key: "{id}",
			text: "{name}"
		});
        var taskTypes = new sap.m.ComboBox(this.createId("taskTypes"),{
			showSecondaryValues: true,
			items: {
				path: "/tasks",
				template: workTypeTemplate
			},
			change: [oController.comboChanged, oController]
		});

		var technicianInputsForm = new sap.ui.layout.form.SimpleForm(this.createId("techniciansForm"),{
			editable: false,
			width: "400px",
			layout: "ResponsiveGridLayout",
			adjustLabelSpan: false,
			emptySpanXL: 1,
			emptySpanL: 1,
			emptySpanM: 1,
			emptySpanS: 1,
			labelSpanS : 5,
			labelSpanM: 5,
			labelSpanL: 8,
			labelSpanXL: 8,
			singleContainerFullSize: true,
			content: [
				new sap.m.Label({
					text: this.rb.getText("ORDER_TYPE_LABEL")
				}),
				taskTypes
			]
		});

		var techniciansListTemplate = new sap.m.StandardListItem({
			title: "{name}",
			description: "{description}",
			icon: {
				path: "isFavourite",
				formatter: function(isFav){
					if (isFav) {
						return "sap-icon://favorite";
					}
				}
			},
			iconDensityAware: false,
			iconInset: true
		});

		var techniciansList = new sap.m.List(this.createId("techniciansList"),{
			headerText: this.rb.getText("AVAILABLE_TECHNICIANS_HDR_LBL"),
			items: {
				path: '/technicians',
				sorter: {
					path: 'name' //TODO sorter not working
				},
				template: techniciansListTemplate,
			}
		}).setLayoutData(new sap.ui.layout.GridData({span: "L6 M6 S12", linebreak: true}));
		var techniciansBookingBox = new sap.m.HBox(this.createId("appCont"),{
			items: [technicianInputsForm, techniciansList],
			justifyContent: "SpaceBetween"
		});

		var mainVBox = new sap.m.VBox(this.createId("topVBox"),{
			items: [techniciansBookingBox, oForm1],
			justifyContent: "SpaceBetween"
		}).setLayoutData(new sap.ui.layout.GridData({span: "L6 M6 S12", linebreak: true}));

        var page = new sap.m.Page(this.createId("sampleTodo"), {
            title: this.rb.getText("TITLE"),
            backgroundDesign: "Solid",
            content: [mainVBox],
        });

        var shell = new sap.m.Shell({
            app: page
        });
        return shell;
    }
});
