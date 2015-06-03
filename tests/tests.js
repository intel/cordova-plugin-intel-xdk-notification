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

/*global exports, describe, it, xit, expect, intel, console */

exports.defineAutoTests = function () {
    'use strict';
    
    describe('intel.xdk.notification tests', function () {
        it('intel.xdk.notification should be defined', function () {
            expect(intel.xdk.notification).toBeDefined();
        });
        
        it('should have a alert method', function () {
            expect(intel.xdk.notification.alert).toBeDefined();
        });
        
        
        it('should have a confirm method', function () {
            expect(intel.xdk.notification.confirm).toBeDefined();
        });
        
        
        it('should have a alert method', function () {
            expect(intel.xdk.notification.alert).toBeDefined();
        });
        
        
        it('should have a alert method', function () {
            expect(intel.xdk.notification.alert).toBeDefined();
        });
        
        
        it('should have a vibrate method', function () {
            expect(intel.xdk.notification.vibrate).toBeDefined();
        });
        
        
        it('should have a showBusyIndicator method', function () {
            expect(intel.xdk.notification.showBusyIndicator).toBeDefined();
        });
        
        it('should have a hideBusyIndicator method', function () {
            expect(intel.xdk.notification.hideBusyIndicator).toBeDefined();
        });
    });
};

exports.defineManualTests = function (contentEl, createActionButton) {
    'use strict';
    
    /** object to hold properties and configs */
    var TestSuite = {};
    
    function logMessage(message, color) {
        var log = document.getElementById('info'),
            logLine = document.createElement('div');
        
        if (color) {
            logLine.style.color = color;
        }
        
        logLine.innerHTML = message;
        log.appendChild(logLine);
    }

    function clearLog() {
        var log = document.getElementById('info');
        log.innerHTML = '';
    }
    
    function testNotImplemented(testName) {
        return function () {
            console.error(testName, 'test not implemented');
        };
    }
    
    function init() {}
    
    TestSuite.$markup = '<h3>Beep</h3>' +
        '<div id="buttonBeep_1"></div>' +
        'Expected result: should beep once' +
        '<div id="buttonBeep_5"></div>' +
        'Expected result: should beep five times' +
                           
        '<h3>Vibrate</h3>' +
        '<div id="buttonVibrate"></div>' +
        'Expected result: should vibrate' +
                           
        '<h3>Alert</h3>' +
        '<div id="buttonAlert"></div>' +
        'Expected result: should alert a message' +
        '<div id="buttonBadAlert"></div>' +
        'Expected result: should display a bad alert' +
                           
        '<h3>Confirm</h3>' +
        '<div id="buttonConfirm"></div>' +
        'Expected result: should confirm a message' +
        
        '<h3>Busy Indicator</h3>' +
        '<div id="buttonShowBusyIndicator"></div>' +
        'Expected result: should show busy indicator' +
        '<div id="buttonHideBusyIndicator"></div>' +
        'Expected result: should hide busy indicator';
        
    contentEl.innerHTML = '<div id="info"></div>' + TestSuite.$markup;
    
    createActionButton('beep(1)', function () {
        console.log('execute::intel.xdk.notification.beep');
        intel.xdk.notification.beep(1);
    }, 'buttonBeep_1');
    
    createActionButton('beep(5)', function () {
        console.log('execute::intel.xdk.notification.beep');
        intel.xdk.notification.beep(5);
    }, 'buttonBeep_5');
    
    createActionButton('vibrate()', function () {
        console.log('execute::intel.xdk.notification.vibrate');
        intel.xdk.notification.vibrate();
    }, 'buttonVibrate');
    
    createActionButton('alert()', function () {
        console.log('execute::intel.xdk.notification.alert');
        intel.xdk.notification.alert('message', 'title', 'button');
    }, 'buttonAlert');
    
    createActionButton('bad alert()', function () {
        console.log('execute::intel.xdk.notification.alert');
        intel.xdk.notification.alert();
    }, 'buttonBadAlert');

    createActionButton('confirm()', function () {
        console.log('execute::intel.xdk.notification.confirm');
        intel.xdk.notification.confirm('message', 'id1', 'title1', 'ok', 'cancel');
    }, 'buttonConfirm');
    
    createActionButton('showBusyIndicator()', function () {
        console.log('execute::intel.xdk.notification.showBusyIndicato');
        intel.xdk.notification.showBusyIndicator();
    }, 'buttonShowBusyIndicator');
    
    createActionButton('hideBusyIndicator()', function () {
        console.log('execute::intel.xdk.notification.hideBusyIndicator');
        intel.xdk.notification.hideBusyIndicator();
    }, 'buttonHideBusyIndicator');
    
    document.addEventListener('deviceready', init, false);
};