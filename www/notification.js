/*
Copyright 2015 Intel Corporation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file 
except in compliance with the License. You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the 
License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
either express or implied. See the License for the specific language governing permissions 
and limitations under the License
*/

var exec = require('cordova/exec');

/**
 * Provides access to the various notification features on the device.
 */

module.exports = {

	/**
	 * Open a native alert dialog, with a customizable title and button text.
	 * @param {String} message Message to print in the body of the alert
	 * @param {String} title Title of the alert dialog (default: Alert)
	 * @param {String} button Label of the close button (default: OK)
	 */
	alert: function(message, title, button) {
	    // if (intel.xdk.available)
	    //     Notification.alert(message, title, button);
	    // else
	    //     alert(message);
		exec(null, null, "IntelXDKNotification", "alert", [message, title, button]);
	},

	/**
	 * Open a native confirmation dialog, with a customizable title and button text.
	 * @param {String} message The confirmation message to show in the alert box
	 * @param {String} id Used to identify which confirm message to process when a confirm event is dispatched.
	 * @param {String} title The title to put across the top of the alert box.
	 * @param {String} ok The text to put on the button that confirms the action shown in the alert box.
	 * @param {String} cancel The text to put on the button that dismisses the action shown in the alert box.
	 *
	 * Upon completion, this method will fire the intel.xdk.notification.confirm event that includes a "success", "answer", and "id" properties. 
	 * If success, "answer" will be set to "true" for confirmation and "id" contains the value of the id parameter provided in the function call.
	 */
	confirm: function(message, id, title, ok, cancel) {
		exec(null, null, "IntelXDKNotification", "confirm", [message, id, title, ok, cancel]);
	},

	/**
	 * Causes the device to vibrate.
	 */
	vibrate: function() {
		exec(null, null, "IntelXDKNotification", "vibrate", []);
	},

	/**
	 * Causes the device to beep.
	 * @param {Integer} count The number of beeps.
	 */
	beep: function(count) {
		exec(null, null, "IntelXDKNotification", "beep", [count]);
	},

	/**
	 * Causes the device to show a spinner in the notification area.
	 */
	showBusyIndicator: function() {
		exec(null, null, "IntelXDKNotification", "showBusyIndicator", []);
	},

	/**
	 * Causes the device to stop showing a spinner in the notification area.
	 */
	hideBusyIndicator: function() {
		exec(null, null, "IntelXDKNotification", "hideBusyIndicator", []);
	},

}