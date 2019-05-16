sap.ui.define(['jquery.sap.global', 'sap/ui/core/library'],
    function (jQuery, library1) {
        "use strict";

        sap.ui.getCore().initLibrary({
            name: "com.demo.workOrder",
            dependencies: ["sap.ui.core","sap.m","sap.ui.commons","sap.ui.layout"],
            types: [],
            interfaces: [],
            controls: [
                "com.demo.workOrder.controls.AddressInput"
            ],
            elements: ["com.demo.workOrder.actions.ProcessTasksActions"],
            noLibraryCSS: false,
            version: "${version}"
        });

        return com.demo.workOrder;
    });