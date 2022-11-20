"use strict";
var srvsys;
(function (srvsys) {
    /*
    This a test form script for Pull Request #63325
    This PR fixes 3 issues.
    1. Incorrect casing on the Process Status Type so that it matches that returned by context.getEventArgs().getStatus()
    2. Incorrec type of the handler parameter addOnStageSelected (Line 4671)
    3. Added namespaced Enums to deal with the two different return values
    To use, compile and add the js as a web resource to dynamics, add to the Lead form and add eventhandler srvsys.onLoad, passing execution context as 1st param.
    */
    function onLoad(context) {
        const formContext = context.getFormContext();
        formContext.data.process.addOnPreProcessStatusChange(onPreProcessStatusChange);
        formContext.data.process.addOnProcessStatusChange(onProcessStatusChange);
        console.log("Loaded Test WebResource");
        /*
        Pre-PR #63325 The next line would throw this error:
        Argument of type '(context: StageSelectedEventContext) => Promise<void>' is not assignable to parameter of type 'ContextSensitiveHandler'.
        Types of parameters 'context' and 'context' are incompatible.
        Property 'getEventArgs' is missing in type 'EventContext' but required in type 'StageSelectedEventContext'.
        Post PR: Expected behaviour. This will not throw the error
        */
        formContext.data.process.addOnStageSelected(onStageSelected);
        //Test Enums
        console.log("Process Status Enum (Original): " + "finished" /* XrmEnum.ProcessStatus.Finished */); // this will return lowercase and is not changed (currently) in the PR
        /* New Enums. Note the namespaced approach. Still need to discuss this with other contributors.
        I would prefer a namespace of "ProcessStatus" then 2 enums, such as ProcessStatus.EventArgsStatus and ProcessStatus.FormContextStatus
        as this is more intuitive. But it would break existing code.
        To test with new PR, see sconsole output, or check the compiled js - not strictly necessary to run
        */
        console.log("EventArgsEnumStatus: " + "Active" /* XrmEnum.EventArgsStatus.ProcessStatus.Active */); //should return "Active"
        console.log("FormContextEnumStatus: " + "active" /* XrmEnum.FormContextStatus.ProcessStatus.Active */); //should return "active"
    }
    srvsys.onLoad = onLoad;
    function onPreProcessStatusChange(context) {
        console.log("Running onPreProcessingStatusChange event handler");
        /* This transpiles directly to context.getEventArgs().getStatus() and will return A Pascal case status e.g. Active */
        console.log("GetEventArgs Status: " + context.getEventArgs().getStatus());
        const receivedStatus = context.getEventArgs().getStatus();
        /* pre-PR this condition won't work since the type is lowercase. And can't "force" PascalCase (eg "Finished" ) as it contravenes the literal type
        post-PR, with the comparison string as "Finished", the compiler should be happy and the condition should work
        */
        if (receivedStatus == "Finished") {
            console.log("Match successful !!");
        }
        else {
            console.log("Match unsuccessful");
        }
        //Test that we haven't broken the other method for getting the status. In this handler it should return the current status (e.g. "active")
        console.log("GetFormsContext Status: " + context.getFormContext().data.process.getStatus());
    }
    function onProcessStatusChange(context) {
        console.log("Running onPreProcessingStatusChange event handler");
        /* This transpiles directly to context.getEventArgs().getStatus() and will return A Pascal case status e.g. Active */
        console.log("GetEventArgs Status: " + context.getEventArgs().getStatus());
        const receivedStatus = context.getEventArgs().getStatus();
        /* pre-PR this condition won't work since the type is lowercase. And can't "force" PascalCase (eg Finished) as it contravenes the literal type
        post-PR, with the comparison string as "Finished", the compiler should be happy and the condition should work
        */
        if (receivedStatus == "Finished") {
            console.log("Match successful !!");
        }
        else {
            console.log("Match unsuccessful");
        }
        //Test that we haven't broken the other method for getting the status. In this handler it should return the new status (e.g. "finished")
        console.log("GetFormsContext Status: " + context.getFormContext().data.process.getStatus());
    }
    function onStageSelected(context) {
        console.log("Running onStageSelected Event Handler. Status: " + context.getEventArgs().getStage().getStatus()); //check it fires OK - shoukd return activem or inactive
    }
})(srvsys || (srvsys = {}));
