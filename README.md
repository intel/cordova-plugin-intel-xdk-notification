DISCONTINUATION OF PROJECT.  This project will no longer be maintained by Intel.  Intel will not provide or guarantee development of or support for this project, including but not limited to, maintenance, bug fixes, new releases or updates.  Patches to this project are no longer accepted by Intel.  In an effort to support the developer community, Intel has made this project available under the terms of the Apache License, Version 2. If you have an ongoing need to use this project, are interested in independently developing it, or would like to maintain patches for the community, please create your own fork of the project.

intel.xdk.notification
======================

Alert the application's user about the application's state using a variety of
methods.

>   _This Intel XDK Cordova plugin and API has been deprecated. Please use the
>   equivalent standard Cordova
>   [dialogs](https://github.com/apache/cordova-plugin-dialogs) and
>   [vibration](https://github.com/apache/cordova-plugin-vibration) plugins
>   instead._

Description
-----------

The notification object allows the developer to alert the user using
device-specific capabilities.

###  Methods

-   [alert](#alert) — This method will display a modal alert box
-   [beep](#beep) — This method will cause the device to beep.
-   [confirm](#confirm) — This method will display a modal alert box with
    confirmation options.
-   [hideBusyIndicator](#hidebusyindicator) — This method will turn off the
    "working" or "busy" state graphics started by the
    intel.xdk.notification.showBusyIndicator method.
-   [showBusyIndicator](#showbusyindicator) — This method will turn on the
    device's "working" or "busy" state graphics such as a spinner or an
    hourglass.
-   [vibrate](#vibrate) — This method will make the device to vibrate.

Methods
-------

### alert

This method will display a modal alert box.

```javascript
intel.xdk.notification.alert(message,title,buttontext);
```

#### Description

This method will display a modal alert box. The message, alert box title, and
the text on the confirm button are all defined by the parameters passed to this
method.

#### Platforms

-   Apple iOS
-   Google Android

#### Parameters

-   **message:** The message to show in the alert box
-   **title:** The title to put across the top of the alert bo.
-   **buttontext:** The text to put on the button that dismisses the alert box

#### Example

```javascript
 intel.xdk.notification.alert("Hammertime!","STOP","Can\'t Touch This");
```

### beep

This method will cause the device to beep.

```javascript
intel.xdk.notification.beep(count);
```

#### Description

This method will force the device to beep. Passing a numeric value will cause it
to beep several times in succession. If no parameters are passed, the number of
beeps defaults to 1.

#### Available Platforms

-   Apple iOS
-   Google Android
-   Microsoft Windows 8 - BETA
-   Microsoft Windows Phone 8 - BETA

#### Parameters

**count:** The number of times the device should beep in succession.

#### Example

```javascript
intel.xdk.notification.beep(1);
```

### confirm

This method will display a modal alert box with confirmation options.

```javascript
intel.xdk.notification.confirm(message, confirmEventID, title,
    confirmButtonText, dismissButtonText);
```

#### Description

This method will display a modal alert box that allows the user to confirm or
ignore the message. The message text, function to execute on confirmation event
being thrown, title, and the text for the confirm and dismiss buttons are all
defined by the parameters passed to this method.

#### Platforms

-   Apple iOS
-   Google Android

#### Parameters

-   **message:** The confirmation message to show in the alert box.
-   **confirmEventID:** Event ID of the confirmation. Used to identify which
    confirm message to process when event a confirm event is thrown.
-   **title:** The title to put across the top of the alert box.
-   **confirmbuttontext:** The text to put on the button that confirms the
    action shown in the alert box.
-   **dismissbuttontext:** The text to put on the button that dismisses the
    action shown in the alert box.

#### Events

-   **intel.xdk.notification.confirm:** Upon completion, this method will fire
    the intel.xdk.notification.confirm event that includes a "success",
    "answer", and "id" properties. If success, "answer" will be set to "true"
    for confirmation, and "id" contains the value of the confirmEventID
    parameter provided in the function call.

#### Example

```javascript
//  Set up confirmation event listener
document.addEventListener('intel.xdk.notification.confirm', receiveConfirm,
    false);

//  Display the confimation alert message
intel.xdk.notification.confirm("Launch native maps?", 'launchMaps', 
    "Show A Map", "Yes", "No");

//Process the event for the confirmed message
function receiveConfirm(e)
{
    if( e.id == 'launchMaps' )
    {
        if( e.success == true && e.answer == true )
        {
            var url = "http://google.com/maps?saddr=35+East+Orange+St+Lancaster,+Harrisburg,+PA+17602&daddr=1600+Pennsylvania+Ave+Washington,+DC+20006";
            //alert(url);
            //console.log(url);
            intel.xdk.device.launchExternal(url);
        }
    }
}
```

### hideBusyIndicator

This method will turn off the "working" or "busy" state graphics started by the
intel.xdk.notification.showBusyIndicator method

```javascript
intel.xdk.notification.hideBusyIndicator();
```

#### Platforms

-   Apple iOS
-   Google Android

#### Example

```javascript
intel.xdk.notification.hideBusyIndicator();
```

### showBusyIndicator

This method will turn on the device's "working" or "busy" state graphics such as
a spinner or an hourglass.

```javascript
intel.xdk.notification.showBusyIndicator();
```

#### Description

This method will turn on the device's "working" or "busy" state graphics such as
a spinner or an hourglass. Turn this off using the
intel.xdk.notification.hideBusyIndicator command.

#### Platforms

-   Apple iOS
-   Google Android

#### Example

```javascript
intel.xdk.notification.showBusyIndicator();
```

### vibrate

This method will make the device to vibrate

```javascript
intel.xdk.notification.vibrate();
```

#### Platforms

-   Apple iOS
-   Google Android

#### Example

```javascript
intel.xdk.notification.vibrate();
```

