sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/Panel",
	"sap/m/Label",
	"sap/ui/core/Title",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"com/demo/workOrder/actions/ProcessTasksActions"
], function (Controller, JSONModel, Filter, Panel, Label, Title, FormContainer, FormElement, ResponsiveFlowLayoutData, ProcessTasksActions) {
	"use strict";

	return Controller.extend("com.samples.controller.App", {
		processActions: new ProcessTasksActions(),
		comboChanged: function (oEvent) {
			if (!oEvent.getParameter("itemPressed")) {
				return;
			}
			var comboBox = oEvent.getSource(), view = this.getView(), that = this, filters = [];
			// eslint-disable-next-line radix
			var allTasks = this.getAllRelatedTasks(parseInt(comboBox.getSelectedKey()));
			var list = view.byId("techniciansList");
			var oBinding = list.getBinding("items");
			oBinding.filter([]);
			filters.push(new Filter("tasks", function (tasks) {
				for (var i = 0; i < allTasks.length; i++) {
					// eslint-disable-next-line radix
					if (tasks.indexOf(parseInt(allTasks[i].id)) > -1) {
						return true;
					}
				}
			}));
			oBinding.filter(new Filter({filters: filters, and: false}));
			this.processActions.setMainTask(allTasks[0]);
			this.processActions.processTechnicians(allTasks[0]).done(function(oTask){
				var formContainers = that._getAllFormContainers(oTask);
				var appointmentBox = view.byId("appointmentVBox");
				formContainers.forEach(function(currFormContainer){
					appointmentBox.addFormContainer(currFormContainer);
				});

			});
		},

		_getAllFormContainers: function(currTask){
			var view = this.getView(), formContainers = [];
			function createPanelOutOfAppointment(inpTask){
				function addAppointmentsToForm(oPanel, oAppointment) {
					oPanel.addFormElement(new FormElement({
						label: new Label({text:view.rb.getText("APPOINTMENT_START_DATE_TIME"), design: "Bold"}),
						fields: [createLabelForDate(oAppointment.start).setLayoutData(new ResponsiveFlowLayoutData({weight: 5}))],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: true})
					}));
					oPanel.addFormElement(new FormElement({
						label: new Label({text:view.rb.getText("APPOINTMENT_END_DATE_TIME"), design: "Bold"}),
						fields: [createLabelForDate(oAppointment.end).setLayoutData(new ResponsiveFlowLayoutData({weight: 5}))],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: true})
					}));
					oPanel.addFormElement(new FormElement({
						label: new Label({text:view.rb.getText("TECHNICIAN_NAME"), design: "Bold"}),
						fields: [new Label({text: oAppointment.technician.name}).setLayoutData(new ResponsiveFlowLayoutData({weight: 5}))],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: true})
					}));
					oAppointment.inputNeeded.forEach(function(input){
						if (input.value) {
							oPanel.addFormElement(new FormElement({
								label: new Label({text: input.label, design: "Bold"}),
								fields: [new Label({text: input.value.adrLine1 + ", " + input.value.adrLine2 + ", " + input.value.adrCity + ", " + input.value.adrPin + ", " + input.value.adrState}).setLayoutData(new ResponsiveFlowLayoutData({weight: 5}))],
								layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: true})
							}));
						}
					});
					function createLabelForDate(inpDate){
						return new Label({
							text: inpDate.toLocaleDateString()+" "+inpDate.toLocaleTimeString()
						})
					}
				}

				var mainFormContainer = new FormContainer({
					title: new Title({text: inpTask.appointment.title, level: sap.ui.core.TitleLevel.H4, emphasized: true}),
					expandable: true,
					layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false})
				});
				addAppointmentsToForm(mainFormContainer, inpTask.appointment);
				formContainers.push(mainFormContainer);
				if (inpTask.subtasks) {
					inpTask.subtasks.forEach(function(subtask){
						var subtaskFormContainer = new FormContainer({
							title: new Title({text: subtask.details.appointment.title, level: sap.ui.core.TitleLevel.H6, emphasized: true}),
							expandable: true,
							layoutData: new ResponsiveFlowLayoutData({linebreak: false, margin: true})
						});
						addAppointmentsToForm(subtaskFormContainer, subtask.details.appointment);
						formContainers.push(subtaskFormContainer);
					});
				}
				return formContainers;
			}

			return createPanelOutOfAppointment(currTask);
		},

		getAllRelatedTasks: function (oSelectedTaskId) {
			var model = this.getView().getModel();
			var allTasks = model.getProperty("/tasks");
			var selectedTask = allTasks.filter(function (item) {
				if (item.id === oSelectedTaskId) {
					return item;
				}
			});
			selectedTask = selectedTask[0];
			if ($.isArray(selectedTask.subtasks) && selectedTask.subtasks.length > 0) {
				var subtasks = [selectedTask];
				selectedTask.subtasks.forEach(function (task) {
						subtasks.push(task);
					}
				);
				return subtasks;
			} else {
				return [selectedTask]
			}
		}

	});

});
