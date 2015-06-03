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

#import "XDKNotification.h"
#import <AVFoundation/AVFoundation.h>
#import <AudioToolbox/AudioToolbox.h>

@interface XDKNotification () <AVAudioPlayerDelegate, UIAlertViewDelegate>

// Audio player used by the beep function to play beeps.
@property AVAudioPlayer* beeper;

// Number of beeps to play. (Incremented if the beep function is called
// when the beeper is already playing as a result of a previous beep call.)
@property NSUInteger numBeeps;

// The identifier string for the currently displayed confirm dialog; or nil if there is
// no current confirm dialog.
@property NSString* confirmID;

@end

@implementation XDKNotification

#pragma mark Private

// Send the OK plugin result back to Cordova.
- (void)reportOKWithCommand:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* ok = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:ok callbackId:command.callbackId];
}


// Start the beeper audio player playing numBeeps times.
- (void)playBeeps
{
    if (self.numBeeps != 0) {
        self.beeper.numberOfLoops = self.numBeeps - 1;
        self.numBeeps = 0;
        [self.beeper play];
    }
}

// Cancel any beeping that may be in progress.
- (void)stopBeeps
{
    if (self.beeper.playing) {
        self.numBeeps = 0;
        [self.beeper stop];
    }
}

#pragma mark - AVAudioPlayerDelegate


// Beeper delegate method. When the beeper finishes playing, play any additional beeps
// that have been queued up since it started.
- (void) audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag
{
    [self playBeeps];
}

#pragma mark - UIAlertViewDelegate

// Confirmation delegate method. Report whether the Cancel button or the OK button was
// clicked to dismiss the confirmation alert view.
- (void) alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex
{
    NSString* script = [NSString stringWithFormat:
                        @"var e = document.createEvent('Events');"
                        "e.initEvent('intel.xdk.notification.confirm', true, true);"
                        "e.success = true;"
                        "e.answer = %@;"
                        "e.id = '%@';"
                        "document.dispatchEvent(e);",
                        (buttonIndex == alertView.cancelButtonIndex) ? @"false" : @"true",
                        self.confirmID];
    self.confirmID = nil;
    [self.commandDelegate evalJs:script];
}


#pragma mark - CDVPlugin

- (void)pluginInitialize
{
    [super pluginInitialize];
    
    // Initialize for beep.
    
    NSError* error;
    NSURL* beepSoundFile = [[NSBundle mainBundle] URLForResource: @"beep"
                                                   withExtension: @"wav"];
    self.beeper = [[AVAudioPlayer alloc] initWithContentsOfURL:beepSoundFile error:&error];
    if (!self.beeper) {
        NSLog(@"Failed to initialize beeper audio player\n%@", error);
    }
    [self.beeper prepareToPlay];
    self.numBeeps = 0;
}

- (void)onReset
{
    [self stopBeeps];
    [super onReset];
}

- (void)onAppTerminate
{
    [self stopBeeps];
    [super onAppTerminate];
}


#pragma mark - Plugin Methods

- (void)alert:(CDVInvokedUrlCommand*)command
{
    NSString* messageArg =  [command argumentAtIndex:0];
    NSString* titleArg =    [command argumentAtIndex:1 withDefault:@"Alert"];
    NSString* buttonArg =   [command argumentAtIndex:2 withDefault:@"OK"];
    
    UIAlertView* alert = [[UIAlertView alloc] initWithTitle:titleArg
                                                    message:messageArg
                                                   delegate:nil
                                          cancelButtonTitle:buttonArg
                                          otherButtonTitles:nil];
    [alert show];
    [self reportOKWithCommand:command];
}

- (void)confirm:(CDVInvokedUrlCommand*)command
{
    // (message, id, title, ok, cancel)
    NSString* messageArg =  [command argumentAtIndex:0];
    NSString* idArg =       [command argumentAtIndex:1 withDefault:@"ID"];
    NSString* titleArg =    [command argumentAtIndex:2 withDefault:@"Please confirm"];
    NSString* okArg =       [command argumentAtIndex:3 withDefault:@"OK"];
    NSString* cancelArg =   [command argumentAtIndex:4 withDefault:@"Cancel"];
    
    if (self.confirmID) {
        // We will only put up one confirmation alert at a time, so if there is
        // already one up, just toss a JavaScript error event and return.
        NSString* script = [NSString stringWithFormat:
                            @"var e = document.createEvent('Events');"
                            "e.initEvent('intel.xdk.notification.confirm.busy', true, true);"
                            "e.success = false;"
                            "e.message='busy';"
                            "e.id = '%@';"
                            "document.dispatchEvent(e);",
                            idArg];
        // ???: Webkit Internal Exception
        // In the test program, when the JavaScript listener function catches 
        // the notification.confirm.busy event, it does a JavaScript alert().
        // This results in the console log output
        //      2014-02-26 16:45:01.348 IntelXDKNotificationPluginTest[6955:70b]
        //      *** Assertion failure in -[UIApplication runModal:](), 
        //      /SourceCache/UIKit_Sim/UIKit-2903.23/UIApplication.m:9465
        //      2014-02-26 16:49:45.353 IntelXDKNotificationPluginTest[6955:70b]
        //      *** WebKit discarded an uncaught exception in the
        //      webView:runJavaScriptAlertPanelWithMessage:initiatedByFrame: 
        //      delegate: <NSInternalInconsistencyException> The view passed in
        //      does not have a window.
        // The assertion is deep in the Cocoa Touch runtime, when the JavaScript
        // engine performs the alert() call by creating a UIAlertView. I does
        // not seem to make sense, there is no easy way to debug it, and since
        // WebKit eats the exception, there are no user-visible consequences.
        // Therefore, we are just going to ignore it, at least for now.
        // - Neil Faiman, 26 February 2014
        [self.commandDelegate evalJs:script];
    } else {
        // Put up a confirmation alert. When the user dismisses it, the
        // alertView:didDismissWithButtonIndex: delegate method will be called
        // and will report the result via a JavaScript event.
        self.confirmID = [idArg copy];
        UIAlertView* alert = [[UIAlertView alloc] initWithTitle:titleArg
                                                        message:messageArg
                                                       delegate:nil
                                              cancelButtonTitle:cancelArg
                                              otherButtonTitles:okArg, nil];
        alert.delegate = self;
        [alert show];
    }
    
    [self reportOKWithCommand:command];
}

- (void)vibrate:(CDVInvokedUrlCommand*)command
{
    AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
    [self reportOKWithCommand:command];
}

- (void)beep:(CDVInvokedUrlCommand*)command
{
    NSUInteger countArg = [[command argumentAtIndex:0
                                        withDefault:@1
                                           andClass:[NSNumber class]]
                          unsignedIntegerValue];
    self.numBeeps += countArg;

    // If the beeper is already playing, then when it finishes, the
    // audioPlayerDidFinishPlaying:successfully: delegate method playBeeps will
    // be called and will call playBeeps again to play any beeps that have been
    // accumulated in numBeeps in the meantime.
    if (! self.beeper.playing) {
        [self playBeeps];
    }
    [self reportOKWithCommand:command];
}

- (void)showBusyIndicator:(CDVInvokedUrlCommand*)command
{
    UIApplication* app = [UIApplication sharedApplication];
    app.networkActivityIndicatorVisible = YES;
}

- (void)hideBusyIndicator:(CDVInvokedUrlCommand*)command
{
    UIApplication* app = [UIApplication sharedApplication];
    app.networkActivityIndicatorVisible = NO;
}

@end
