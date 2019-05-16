sap.ui.define([
		'sap/ui/base/ManagedObject',
		"sap/ui/thirdparty/jquery",
		"sap/m/PlanningCalendar",
		"sap/m/PlanningCalendarRow",
		"sap/ui/unified/CalendarAppointment",
		"sap/ui/commons/HorizontalDivider",
		"sap/m/Toolbar",
		"sap/m/ToolbarSpacer",
		"sap/m/Label",
		"sap/m/Dialog",
		"sap/m/Button",
		"com/demo/workOrder/utils/InterruptedArrayIterator",
		"sap/ui/model/json/JSONModel"
	],
	function (ManagedObject, jQuery, PlanningCalendar, PlanningCalendarRow, CalendarAppointment, HorizontalDivider, Toolbar, ToolbarSpacer, Label, Dialog, Button, InterruptedArrayIterator, JSONModel) {
		"use strict";

		var processTasksActions = ManagedObject.extend("com.demo.workOrder.actions.ProcessTasksActions", {
			metadata: {
				library: "com.demo.workOrder",
				properties: {
					mainTask: {type: "object", group: "Behaviour", defaultValue: null},
				},
				events: {
					"slotBookingDone": {
						enableEventBubbling: true
					}
				}
			}
		});

		var rootContainer = sap.ui.core.Component.get("container-booking");
		processTasksActions.prototype.rb = rootContainer.getModel("i18n").getResourceBundle();
		processTasksActions.prototype.rootDataModel = rootContainer.getModel();

		processTasksActions.prototype.processTechnicians = function (currTask, subtaskProcessingDeferredObj) {
			var deferred = new jQuery.Deferred(), that = this, taskToProcess = currTask;
			if (!currTask.name) {
				taskToProcess = currTask.details;
			}

			this._fetchSubTaskDetails(taskToProcess);
			function actualFn(){
				var matchingTechnicians = that._findTechniciansForTaskId(taskToProcess.id);

				var appointementsTempl = new CalendarAppointment({
					startDate:{
						path: "start",
						formatter: function(iStartDate){
							return new Date(iStartDate);
						}
					},
					endDate: {
						path: "end",
						formatter: function(iEndDate){
							return new Date(iEndDate);
						}
					},
					icon: "{pic}",
					title: "{title}",
					text: "{info}",
					type: "{type}",
					tentative: "{tentative}"
				});
				var planningCalTemplate = new PlanningCalendarRow({
					icon: "sap-icon://employee",
					title: "{name}",
					tooltip: "{description}",
					appointments: {
						path: "appointments",
						template: appointementsTempl,
						templateShareable: true
					}
				});
				var currentDate = new Date();
				var minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), "10");
				var id = "pc1";
				if (that._getControlById(id)) {
					id = id + "-taskId" + taskToProcess.id;
				}
				var oPC1 = new PlanningCalendar(that.getId() + "-"+id, {
					stickyHeader: true,
					width: "1200px",
					builtInViews: ["Hour"],
					showIntervalHeaders: false,
					appointmentsVisualization: "Filled",
					intervalSelect: function(oEvent){
						that._handleAddAppointment.call(that, oEvent, taskToProcess, afterAppointmentCreate);
					}.bind(that),
					startDate: minDate,
					minDate: minDate,
					maxDate: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, currentDate.getDate()-1, "18"),
					rows: {
						path: '/technicians',
						template: planningCalTemplate
					}
				});
				var dialog1 = that._addDialogWithContent("calAppointment", oPC1, that.rb.getText("ORDER_SLOTS_SELECT_TEXT")+taskToProcess.name, {"technicians": matchingTechnicians});
				dialog1.attachAfterClose(function () {
					this.destroy();
				});
				function afterAppointmentCreate(relatedTask){
					if (subtaskProcessingDeferredObj) {
						subtaskProcessingDeferredObj.resolve();
					}
					if (!relatedTask || !subtaskProcessingDeferredObj) {
						deferred.resolve(that.getMainTask());
						dialog1.close();
					}
				}
			}
			var to1 = setTimeout(function(){
				actualFn();
				clearTimeout(to1);
			});
			return deferred.promise();
		};

		processTasksActions.prototype._handleAddAppointment = function(oEvent, inpTask, afterAppointmentCreateFn){
			var oPC = oEvent.getSource(), oStartDate = oEvent.getParameter("startDate"), oEndDate = oEvent.getParameter("endDate"), that = this;
			var oRow = oEvent.getParameter("row"), taskIndex = this.rootDataModel.getData().tasks.indexOf(inpTask), technician = oRow.getBindingContext().getObject();
			var technicianIndex = this.rootDataModel.getData().technicians.indexOf(technician), techCopy = {};
			$.extend(techCopy, technician); delete techCopy.appointments; delete techCopy.tasks;
			var taskInModel = this.rootDataModel.getData().tasks[taskIndex];

			var oAppointment = {
				start: new Date(oStartDate.getTime()),
				end: new Date(oEndDate),
				title: inpTask.name,
				technician: techCopy,
				type: "Type09"
			};
			this.rootDataModel.getData().technicians[technicianIndex].appointments.push(oAppointment);
			oPC.getModel().refresh();
			taskInModel.appointment = oAppointment;
			if (jQuery.isArray(taskInModel.inputNeeded) && taskInModel.inputNeeded.length > 0) {
				this._processTaskInput(taskInModel.inputNeeded).done(function(){
					oPC.setBlocked(true);
					oAppointment.inputNeeded = taskInModel.inputNeeded;
					if (taskInModel.subtasks) {
						taskInModel.subtasks.forEach(function (subtask) {
							for (var i = 0; i < subtask.inputFields.length; i++) {
								var inputFromMainTask = findInputFieldWithName(subtask.inputFields[i]);
								subtask.details.inputNeeded[i].value = inputFromMainTask.value;
							}
						});
					} else {
						afterAppointmentCreateFn.call(that, inpTask);
					}
					function findInputFieldWithName(inpFieldName){
						var matchingTasks = taskInModel.inputNeeded.filter(function(inpField){
							if (inpField.name === inpFieldName) {
								return inpField;
							}
						});
						return matchingTasks[0];
					}

					if (jQuery.isArray(inpTask.subtasks) && inpTask.subtasks.length > 0) {
						var subtaskProcessor = new InterruptedArrayIterator(inpTask.subtasks);
						subtaskProcessor.nextItem(function(item, subtaskProcessingDeferredObj){
							if (item) {
								that.processTechnicians(item.details, subtaskProcessingDeferredObj);
							} else {
								afterAppointmentCreateFn.call(that, taskInModel);
							}
						});
					}
				});
			}
			var calData = oPC.getModel().getData();
			oPC.getModel().setData(calData);
		};

		processTasksActions.prototype._processTaskInput = function(taskInpArr){
			var arrayItr = new InterruptedArrayIterator(taskInpArr), deferred = new $.Deferred(), that = this;
			arrayItr.nextItem(function(item, inputProcessingDeferredObj){
				if (item) {
					if ($.isEmptyObject(item.value)) {
						var objType = item.type.replace(/\./g, "/");
						sap.ui.require([objType], function (inpType) {
							var cont = new inpType();
							var inpDialog = that._addDialogWithContent("addrInp", cont, item.label);
							inpDialog.attachAfterClose(function () {
								item.value = cont.getValueObject();
								this.destroy();
								if (inputProcessingDeferredObj) {
									inputProcessingDeferredObj.resolve();
								}
							});
						});
					} else {
						if (inputProcessingDeferredObj) {
							inputProcessingDeferredObj.resolve();
						}
					}
				} else {
					deferred.resolve();
				}
			});
			return deferred.promise();
		};

		processTasksActions.prototype._findTechniciansForTaskId = function (id) {
			var matchingTechnicians = this.rootDataModel.getData().technicians.filter(function (currTech) {
				if (currTech.tasks.indexOf(id) > -1) {
					return currTech;
				}
			});
			return matchingTechnicians;
		};

		processTasksActions.prototype._addDialogWithContent = function(sId, oContent, titleText, data){
			var oModel = new JSONModel();
			oModel.setData(data);
			var oDialog1 = this._getControlById(sId);
			if (oDialog1) {
				oDialog1.addContent(new HorizontalDivider({
					width: "0px",
					height: "Large"
				}));
				oDialog1.addContent(new Toolbar({
					content: [new ToolbarSpacer(),
						new Label({
							text: titleText
						}),
						new ToolbarSpacer()]
				}));
				oDialog1.addContent(oContent.setModel(oModel));
			} else {
				oDialog1 = new Dialog(this.getId() + "-" + sId, {
					title: titleText,
					content: [
						oContent.setModel(oModel)
					],
					buttons: [
						new Button({
							text: "Accept",
							press: function () {
								oDialog1.close();
							}
						}),
						new Button({
							text: "Reject",
							press: function () {
								oDialog1.close();
							}
						})
					]
				});
				oDialog1.open();
			}
			return oDialog1;
		};

		processTasksActions.prototype._fetchSubTaskDetails = function (iTask) {
			var that = this;
			if (jQuery.isArray(iTask.subtasks) && iTask.subtasks.length > 0) {
				iTask.subtasks.forEach(function(task){
					var details = that._fetchTaskDetails(task.id);
					task.details = details;
					var mainTaskCopy = {};
					task.mainTask = $.extend(mainTaskCopy, iTask);
					delete task.mainTask.subtasks;
				});
			}
			return iTask;
		};

		processTasksActions.prototype._fetchTaskDetails = function (iTaskId) {
			var currTask = this.rootDataModel.getData().tasks.filter(function (item) {
				if (item.id === iTaskId) {
					return item;
				}
			});
			this._fetchSubTaskDetails(currTask);
			if (jQuery.isArray(currTask) && currTask.length > 0) {
				currTask = currTask[0];
			}
			return currTask;
		};

		processTasksActions.prototype._getControlById = function (oCtrlId) {
			return sap.ui.getCore().byId(this.getId()+"-"+oCtrlId);
		};

		return processTasksActions;
	});
