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


    // This try/catch is temporary to maintain backwards compatibility. Will be removed and changed to just 
    // require('cordova/exec/proxy') at unknown date/time.
    var commandProxy;
    try {
        commandProxy = require('cordova/windows8/commandProxy');
    } catch (e) {
        commandProxy = require('cordova/exec/proxy');
    }

    module.exports = {
        busy: false,
        confirmBusy: false,
        queue: [],
        soundPool: [],
        spinners: ["spinner_n.png", "spinner_ne.png", "spinner_e.png", "spinner_se.png", "spinner_s.png", "spinner_sw.png", "spinner_w.png", "spinner_nw.png", ],
        spinnerLoc: 1,
        BEEP: "/notification/beep.wav",
        VIBRATE: 500,
        intervalId: -1,
        confirmResponse: null,
        spinnerContainer: null,
        spinnerInterval: -1,

        alert: function (successCallback, errorCallback, params) {
            if (module.exports.busy) {
                module.exports.queue.push(params);
            } else {
                if (params.count < 1 || typeof(params[0]) == "undefined" ) {
                    var ev = document.createEvent('Events');
                    ev.initEvent('intel.xdk.notification.confirm',true,true);
                    ev.success=false;
                    ev.filename='';
                    ev.message = 'Wrong number of parameters';
                    document.dispatchEvent(ev);
                    return;
                } else {
                    module.exports.busy = true;
                    var message = params[0];
                    var title = (typeof(params[1]) == "undefined" ) ? "Alert" : params[1];
                    var button = (typeof (params[2]) == "undefined") ? "ok" : params[2];

                    var messageDialog = new Windows.UI.Popups.MessageDialog(message, title);
                    messageDialog.commands.append(new Windows.UI.Popups.UICommand(
                        button,
                        function (command, b, c) {
                            module.exports.busy = false;
                            //successCallback(command);
                        }
                    ));
                    messageDialog.defaultCommandIndex = 0;
                    messageDialog.showAsync().done(function () {
                        if (module.exports.queue.length > 0)
                            module.exports.processQueue();
                    });
                }
            }
        },

        prompt: function(params)
        {
            module.exports.alert("Prompt is not supported in IE10", "Prompt Alert!", "ok");
        },

        confirm: function (successCallback, errorCallback, params) {
            if (typeof(params[0])=="Undefined" ||
                typeof(params[1])=="Undefined" ||
                typeof(params[2])=="Undefined" ||
                typeof(params[3])=="Undefined" ||
                typeof (params[4]) == "Undefined") {
                    var ev = document.createEvent('Events');
                    ev.initEvent('intel.xml.notification.confirm',true,true);
                    ev.success=false;
                    ev.filename = '';
                    ev.message = 'Wrong number of parameters';
                    document.dispatchEvent(ev);
                    return;
            }

            if (module.exports.confirmBusy) {
                var e = document.createEvent('Events');
                e.initEvent('intel.xdk.notification.confirm.busy', true, true);
                e.success = false;
                e.message = 'busy';
                e.id = id;
                document.dispatchEvent(e);
                return;
            } else {
                var message = params[0];
                var id = params[1];
                var title = params[2];
                var button1 = params[3];
                var button2 = params[4];

                module.exports.confirmBusy = true;

                var messageDialog = new Windows.UI.Popups.MessageDialog(message, title);
                messageDialog.commands.append(new Windows.UI.Popups.UICommand(
                    button1,
                    function (command) {
                        module.exports.confirmResponse = true;
                    }
                ));
                messageDialog.commands.append(new Windows.UI.Popups.UICommand(
                    button2,
                    function (command) {
                        module.exports.confirmResponse = false;
                    }
                ));
                messageDialog.defaultCommandIndex = 0;
                messageDialog.showAsync().done(function () {
                    module.exports.confirmBusy = false;

                    var e = document.createEvent('Events');
                    e.initEvent('intel.xdk.notification.confirm', true, true);
                    e.success = module.exports.confirmResponse;
                    e.answer = (module.exports.confirmResponse) ? "true" : "false";
                    e.id = id;
                    document.dispatchEvent(e);
                });
            }
        },

        vibrate: function (successCallback, errorCallback, params) {
            intel.xdk.notification.alert("This is not available in Windows 8", "Not Implemented", "ok");
        },

        beep: function(successCallback, errorCallback, params) {
            var count = params[0];
            var me = module.exports;
            var sound;

            if (me.soundPool[me.BEEP] == null)
            {
                sound = new Audio(me.BEEP);
                me.soundPool[me.BEEP] = sound;
            }
            else
            {
                sound = me.soundPool[me.BEEP];
            }

            try
            {
                if (sound != null)
                {
                    sound.play();
                    count--;

                    me.intervalId = window.setInterval(function () {
                        if (count <= 0) {
                            window.clearInterval(me.intervalId);
                        } else {
                            sound.play();
                            count--;
                        }
                    }, 750);
                }

            }
            catch (ex)
            {
            }

        },

        showBusyIndicator: function (successCallback, errorCallback, params) {
            var me = module.exports;

            if (me.busy)
                return;

            me.busy = true;

            if (me.spinnerContainer == null) {
                me.spinnerContainer = document.createElement("div");
                me.spinnerContainer.style.textAlign = "center";
                me.spinnerContainer.style.position = "relative";
                me.spinnerContainer.style.margin = "0 auto";
                me.spinnerContainer.style.top = ((this.innerHeight / 2) - 12.5) + "px";

                var spinner = document.createElement("img");
                spinner.id = "imgSpinner";
                spinner.src = "/notification/" + me.spinners[0];
                me.spinnerContainer.appendChild(spinner);
            }

            document.body.appendChild(me.spinnerContainer);

            me.spinnerInterval = window.setInterval(function () {
                var spinner = document.getElementById("imgSpinner");
                spinner.src = "/notification/" + me.spinners[me.spinnerLoc];
                me.spinnerLoc++;
                if (me.spinnerLoc > 6)
                    me.spinnerLoc = 0;

            }, 150);
        },

        hideBusyIndicator: function (successCallback, errorCallback, params) {
            var me = module.exports;

            window.clearInterval(me.spinnerInterval);
            document.body.removeChild(me.spinnerContainer);

            me.busy = false;
        },

        processQueue: function() {
            var me = module.exports;

            //var params = [].slice.call(module.exports.queue[0]);
            me.alert(null, null, me.queue[0]);
            me.queue.splice(0, 1);
        }
    };

    commandProxy.add('IntelXDKNotification', module.exports);

