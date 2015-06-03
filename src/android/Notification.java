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

package com.intel.xdk.notification;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Vibrator;

/**
 * This class provides access to various notification features on the device.
 */
public class Notification extends CordovaPlugin {

    private static final int BUSY_INDICATOR = 1;//notification id
    private volatile Thread spinner = null;//for show/hideBusyIndicator
    private int SOUND_BEEP;
    private SoundPool soundPool;
    private int beepCount = -1;
    private boolean bConfirmBusy;
    private Activity activity;

    /**
     * Constructor.
     */
    public Notification() {
    }

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        
        //get convenience reference to activity
        activity = cordova.getActivity();
        
        //init sounds
        soundPool = new SoundPool(4, AudioManager.STREAM_MUSIC, 100);
        
        //this is needed so that the sound plays the first time
        soundPool.setOnLoadCompleteListener(
            new SoundPool.OnLoadCompleteListener() {
                public void onLoadComplete(SoundPool soundPool, int sampleId, int status) {
                    if(beepCount != -1 && soundPool == Notification.this.soundPool && sampleId == SOUND_BEEP && status == 0) {
                        beep(beepCount);
                    }
                }
            }
        );
        
        //SOUND_BEEP = soundPool.load(activity, R.raw.beep, 1);
        SOUND_BEEP = soundPool.load(activity, activity.getResources().getIdentifier("xdkbeep", "raw", activity.getPackageName()), 1);
    }

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArray of arguments for the plugin.
     * @param callbackContext   The callback context used when calling back into JavaScript.
     * @return                  True when the action was valid, false otherwise.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("alert")) {
            this.alert(args.getString(0), args.getString(1), args.getString(2));
        }
        else if (action.equals("confirm")) {
            this.confirm(args.getString(0), args.getString(1), args.getString(2), args.getString(3), args.getString(4));
        }
        else if (action.equals("vibrate")) {
            this.vibrate();
        }
        else if (action.equals("beep")) {
            this.beep(args.getInt(0));
        }
        else if (action.equals("showBusyIndicator")) {
            this.showBusyIndicator();
        }
        else if (action.equals("hideBusyIndicator")) {
            this.hideBusyIndicator();
        }
        else {
            return false;
        }

        // All actions are async.
        //callbackContext.success();
        return true;
    }

    //--------------------------------------------------------------------------
    // LOCAL METHODS
    //--------------------------------------------------------------------------
    public void alert(String message, String title, String button) {
        if( button == null || button.length() == 0 || button.equals("undefined") ) button = "OK";
        AlertDialog.Builder alertBldr = new AlertDialog.Builder(activity);
        alertBldr.setMessage(message);
        alertBldr.setTitle( ( title == null || title.length() == 0 || title.equals("undefined") ) ? "Alert":title );
        alertBldr.setPositiveButton(button, new DialogInterface.OnClickListener() { public void onClick(DialogInterface dialog, int which) {} } );
        alertBldr.show();
    }

    public void processConfirm(boolean clickedok, String id)
    {
        String answer = (clickedok == true) ? "true" : "false";
        final String js = "javascript:var e = document.createEvent('Events');e.initEvent('intel.xdk.notification.confirm',true,true);e.success=true;e.answer=" + answer + ";e.id='" + id + "';document.dispatchEvent(e);";
        activity.runOnUiThread(new Runnable() {

            public void run() {
                webView.loadUrl(js);
            }

        });
        
        bConfirmBusy = false;
    }
    
    public void confirm(String message, final String iden, String title, String ok, String cancel)
    {        
        if(bConfirmBusy) {          
            final String js = "javascript:var e = document.createEvent('Events');e.initEvent('intel.xdk.notification.confirm.busy',true,true);e.success=false;e.message='busy';e.id='" + iden + "';document.dispatchEvent(e);";
            activity.runOnUiThread(new Runnable() {

                public void run() {
                    webView.loadUrl(js);
                }

            });
            return;
        }
        bConfirmBusy = true;
        
        if( title == null || title.length() == 0 ) title = "Please confirm";
        if( ok == null || ok.length() == 0 ) ok = "OK";
        if( cancel == null || cancel.length() == 0 ) cancel = "Cancel";     
        
        AlertDialog.Builder alertBldr = new AlertDialog.Builder(activity);
        alertBldr.setCancelable(false);
        alertBldr.setMessage(message);
        alertBldr.setTitle(title);
        alertBldr.setPositiveButton(ok, new DialogInterface.OnClickListener() { public void onClick(DialogInterface dialog, int which) { processConfirm( true, iden ); } } );
        alertBldr.setNegativeButton(cancel, new DialogInterface.OnClickListener() { public void onClick(DialogInterface dialog, int which) { processConfirm( false, iden ); } } );
        alertBldr.show();
    }
    
    public void vibrate(){
        Vibrator vibrator = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
        vibrator.vibrate(500);
    }

    public void beep(int count)
    {
        beepCount = (count > 0 )?count-1 : 0;
        AudioManager mgr = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
        final int streamVolume = mgr.getStreamVolume(AudioManager.STREAM_MUSIC);
        soundPool.play(SOUND_BEEP, streamVolume, streamVolume, 1, beepCount, 1f);
    }
    
    public void showBusyIndicator() {       
        if( spinner != null ) return;
        
        //get a reference to the service
        String ns = Context.NOTIFICATION_SERVICE;
        final NotificationManager mNotificationManager = (NotificationManager) activity.getSystemService(ns);    
        //create the notification instance
        int icon = activity.getResources().getIdentifier("spinner_n", "drawable", activity.getPackageName());//R.drawable.spinner_n;

        PackageManager packageManager = activity.getPackageManager();
        ApplicationInfo applicationInfo = null;
        try {
            applicationInfo = packageManager.getApplicationInfo(activity.getPackageName(), 0);
        } catch (final NameNotFoundException e) {}
        final String title = (String)((applicationInfo != null) ? packageManager.getApplicationLabel(applicationInfo) : "???");

        CharSequence tickerText = title + " is busy...";//activity.getString(R.string.app_name) + " is busy...";
        long when = System.currentTimeMillis();
        final android.app.Notification notification = new android.app.Notification(icon, tickerText, when);
        //initialize latest event info
        Context context = activity.getApplicationContext();
        CharSequence contentTitle = title + " is busy...";//activity.getString(R.string.app_name) + " is busy...";
        CharSequence contentText = "...just a moment please.";
        Intent notificationIntent = new Intent(activity, activity.getClass());
        PendingIntent contentIntent = PendingIntent.getActivity(activity, 0, notificationIntent, 0);
        notification.setLatestEventInfo(context, contentTitle, contentText, contentIntent);
        //make notification non-cancellable
        notification.flags = notification.flags|android.app.Notification.FLAG_NO_CLEAR; 
        //show in status bar
        mNotificationManager.notify(BUSY_INDICATOR, notification);
        //animate the icon
        spinner = new Thread("intel.xdk.notification:showBusyIndicator") {
            public void run() {
                //frame pointer
                int currentFrame = 0;
                //frame array
                //int[] frames = new int[]{R.drawable.spinner_ne, R.drawable.spinner_e, R.drawable.spinner_se, R.drawable.spinner_s, R.drawable.spinner_sw, R.drawable.spinner_w, R.drawable.spinner_nw, R.drawable.spinner_n};
                int[] frames = new int[]{
                        activity.getResources().getIdentifier("spinner_ne", "drawable", activity.getPackageName()),
                        activity.getResources().getIdentifier("spinner_e", "drawable", activity.getPackageName()),
                        activity.getResources().getIdentifier("spinner_se", "drawable", activity.getPackageName()),
                        activity.getResources().getIdentifier("spinner_s", "drawable", activity.getPackageName()),
                        activity.getResources().getIdentifier("spinner_sw", "drawable", activity.getPackageName()),
                        activity.getResources().getIdentifier("spinner_w", "drawable", activity.getPackageName()),
                        activity.getResources().getIdentifier("spinner_nw", "drawable", activity.getPackageName()),
                        activity.getResources().getIdentifier("spinner_n", "drawable", activity.getPackageName())
                };
                Thread thisThread = Thread.currentThread();
                while(spinner == thisThread) {
                    //loop over the frames, updating the icon every 200 ms
                    currentFrame++;
                    currentFrame %= frames.length;
                    notification.icon = frames[currentFrame];
                    mNotificationManager.notify(BUSY_INDICATOR, notification);
                    try {
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                //when looping ends, remove notification from status bar
                mNotificationManager.cancel(BUSY_INDICATOR);
            }
            @Override
            protected void finalize() throws Throwable {
                //in case the process crashes, try to remove notification from status bar
                super.finalize();
                mNotificationManager.cancel(BUSY_INDICATOR);
            }
        };
        spinner.start();
    }
    
    public void hideBusyIndicator() {
        //setting spinner to null makes the worker thread stop looping
        spinner = null;
    }    
}