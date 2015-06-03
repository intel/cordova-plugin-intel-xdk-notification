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

using Microsoft.Devices;
using Microsoft.Xna.Framework.Audio;
using Microsoft.Xna.Framework.GamerServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using WPCordovaClassLib.Cordova;
using WPCordovaClassLib.Cordova.Commands;
using WPCordovaClassLib.CordovaLib;

namespace Cordova.Extension.Commands
{
    public class IntelXDKNotification : BaseCommand
    {
        #region Private Variables
#if NETFX_CORE
        // code for Windows 8
        private Dictionary<string, MediaElement> soundPool = new Dictionary<string, MediaElement>();
#else
        // code for Windows Phone 8
        private Dictionary<string, SoundEffectInstance> soundPool = new Dictionary<string, SoundEffectInstance>();
#endif
        private const string BEEP = "notification/beep.wav";
        private const int VIBRATE = 500;
        private bool confirmBusy = false;
        private bool busy = false;

        private string spinnerContainer = null;
        #endregion

        #region constructor
        /// <summary>
        /// 
        /// </summary>
        /// <param name="intelDelegate"></param>
        /// <param name="webview"></param>
        public IntelXDKNotification()
        {
        }
        #endregion

        #region appMobi.js public methods
        /// <summary>
        /// 
        /// </summary>
        /// <param name="parameters"></param>
        /// Part of the code was derived from:
        /// http://stackoverflow.com/questions/6731346/howto-create-a-confirm-dialog-in-windows-phone-7
        public void alert(string parameters)
        {
            string[] args = WPCordovaClassLib.Cordova.JSON.JsonHelper.Deserialize<string[]>(parameters);

            if (args.Length < 1 || args[0] == null)
            {
                string js = (string.Format("javascript:var ev = document.createEvent('Events');" +
                        "ev.initEvent('intel.xdk.notification.confirm',true,true);ev.success=false;" +
                        "ev.filename='{0}';ev.message='{1}';document.dispatchEvent(ev);", "", "Wrong number of parameters"));
                InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true);
                return;
            }

            string message = Uri.UnescapeDataString(args[0]);
            string title = (args.Length > 1 && args[1] != null) ? Uri.UnescapeDataString(args[1]) : "Alert";
            string button = (args.Length > 2 && args[2] != null) ? Uri.UnescapeDataString(args[2]) : "ok";

#if NETFX_CORE
            var messageDialog = new MessageDialog(message);

            messageDialog.Title = title;

            messageDialog.Commands.Add(new UICommand(button, (command) =>
            {
                    
            }));

            try
            {
                await Windows.ApplicationModel.Core.CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(new CoreDispatcherPriority(), () =>
                {
                    messageDialog.ShowAsync();
                });
            }
            catch (Exception ex) {
            }
#else
            //*
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                // need this to offset the callback handlers.
                InvokeCustomScript(new ScriptCallback("eval", new string[] { "var ryan = \"\";" }), true);
                MessageBox.Show(message, title, MessageBoxButton.OK);
            });
            //*/

            /*
            // this method works but throws an exception if you try to
            // show two message boxes at the same time. You could make
            // a custom one like the guy did at this URL.
            // http://www.visuallylocated.com/post/2011/11/13/Creating-a-Custom-MessageBox-for-Windows-Phone-Applications.aspx
            using (var mre = new ManualResetEvent(false))
            {
                string[] buttons;
                buttons = new string[] { button };

                Guide.BeginShowMessageBox(
                    title,
                    message,
                    buttons,
                    0, // can choose which button has the focus
                    MessageBoxIcon.None, // can play sounds
                    result =>
                    {

                    }, null);

                mre.WaitOne();
            }
            //*/
#endif

        }
        
        /// <summary>
        /// 
        /// </summary>
        /// <param name="parameters"></param>
        /// Part of the code was derived from:
        /// http://stackoverflow.com/questions/6731346/howto-create-a-confirm-dialog-in-windows-phone-7
        public void confirm(string parameters)
        {
            string[] args = WPCordovaClassLib.Cordova.JSON.JsonHelper.Deserialize<string[]>(parameters);

            if (args.Length < 5)
            {
                var js = (string.Format("javascript:var ev = document.createEvent('Events');" +
                        "ev.initEvent('intel.xdk.notification.confirm',true,true);ev.success=false;" +
                        "ev.filename='{0}';ev.message='{1}';document.dispatchEvent(ev);", "", "Wrong number of parameters"));
                InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true);
                return;
            }

            string messageBoxText = HttpUtility.UrlDecode(args[0]);
            string id = args[1];
            string caption = HttpUtility.UrlDecode(args[2]);
            string button1 = args[3];
            string button2 = args[4];

            if (confirmBusy)
            {
                string js = "var e = document.createEvent('Events');e.initEvent('intel.xdk.notification.confirm.busy',true,true);e.success=false;e.message='busy';e.id='" + id + "';document.dispatchEvent(e);";
                //InjectJS(js);
                InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true); 
                return;
            }

            confirmBusy = true;

#if NETFX_CORE

            var messageDialog = new MessageDialog(message);

            if (!string.IsNullOrEmpty(id))
            {
                messageDialog.Title = id;
            }

            if (!string.IsNullOrEmpty(button1))
            {
                messageDialog.Commands.Add(new UICommand(button1, (command) =>
                {
                    string answer = "true";

                    string js = "var e = document.createEvent('Events');e.initEvent('intel.xdk.notification.confirm',true,true);e.success=true;e.answer=" + answer + ";e.id='" + id + "';document.dispatchEvent(e);";
                    InjectJS(js);
                    confirmBusy = false;
                }));
            }

            if (!string.IsNullOrEmpty(button2))
            {
                messageDialog.Commands.Add(new UICommand(button2, (command) =>
                {
                    string answer = "false";

                    string js = "var e = document.createEvent('Events');e.initEvent('intel.xdk.notification.confirm',true,true);e.success=true;e.answer=" + answer + ";e.id='" + id + "';document.dispatchEvent(e);";
                    InjectJS(js);
                    confirmBusy = false;
                }));
            }

            try
            {
                await Windows.ApplicationModel.Core.CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(new CoreDispatcherPriority(), () =>
                {
                    messageDialog.ShowAsync();
                });
            }
            catch (Exception ex)
            {
            }
#else
            int? returned = null;
            using (var mre = new ManualResetEvent(false))
            {
                string[] buttons;
                if (button2 == null)
                    buttons = new string[] { button1 };
                else
                    buttons = new string[] { button1, button2 };

                Guide.BeginShowMessageBox(
                    caption,
                    messageBoxText,
                    buttons,
                    0, // can choose which button has the focus
                    MessageBoxIcon.None, // can play sounds
                    result =>
                    {
                        string answer = "false";
                        returned = Guide.EndShowMessageBox(result);
                        if (returned == 0)   // yes
                            answer = "true";

                        string js = "var e = document.createEvent('Events');e.initEvent('intel.xdk.notification.confirm',true,true);e.success=true;e.answer=" + answer + ";e.id='" + id + "';document.dispatchEvent(e);";
                        //InjectJS(js);
                        InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true); 

                        confirmBusy = false;

                    }, null);

                mre.WaitOne();
            }
#endif
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="count"></param>
        public void beep(string parameters)
        {
            string[] args = WPCordovaClassLib.Cordova.JSON.JsonHelper.Deserialize<string[]>(parameters);

            int playTimes = 0;
            int.TryParse(args[0], out playTimes);

            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                PlaySound(playTimes);
            });
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="parameters"></param>
        public void vibrate(string parameters)
        {
            VibrateController.Default.Start(TimeSpan.FromMilliseconds(VIBRATE));
        }

        /// <summary>
        /// Propmt handler.
        /// </summary>
        /// <param name="parameters"></param>
        public void prompt(string parameters)
        {
            alert("[\"Prompt is not supported in IE10\",\"Prompt Alert!\",\"ok\"]");
        }

        public void showBusyIndicator(string parameters)
        {
            if (busy) {
                string js = "var e = document.createEvent('Events');e.initEvent('intel.xdk.notification.busy',true,true);e.success=false;e.message='busy';document.dispatchEvent(e);";
                //InjectJS(js);
                InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true); 
                return;
            }

            busy = true;

            if (spinnerContainer == null) {

                var js = "(function() {var spinnerLoc=1; var spinners = [\"spinner_n.png\", \"spinner_ne.png\", \"spinner_e.png\", \"spinner_se.png\", \"spinner_s.png\", \"spinner_sw.png\", \"spinner_w.png\", \"spinner_nw.png\", ]; " + 
                "window.spinnerContainer = document.createElement(\"div\");" +
                "spinnerContainer.style.textAlign = \"center\";" + 
                "spinnerContainer.style.position = \"relative\";" +
                "spinnerContainer.style.margin = \"0 auto\";" +
                "spinnerContainer.style.top = ((this.innerHeight / 2) - 12.5) + \"px\";" +

                "var spinner = document.createElement(\"img\");" +
                "spinner.id = \"imgSpinner\";" +
                "spinner.src = \"/notification/\" + spinners[0];" +
                "spinnerContainer.appendChild(spinner);" +

                "document.body.appendChild(spinnerContainer);" +

                "window.spinnerInterval = window.setInterval(function () {" +
                "var spinner = document.getElementById(\"imgSpinner\");" +
                "spinner.src = \"/notification/\" + spinners[spinnerLoc];" +
                "spinnerLoc++;" +
                "if (spinnerLoc > 6)" +
                "    spinnerLoc = 0;" +
                "}, 150);})();";
                InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true);
            }


        }

        public void hideBusyIndicator(string parameters)
        {
            busy = false;
            var js = "(function() {" +
                "if (window.spinnerContainer) {" +
                    "window.clearInterval(spinnerInterval);" +
                    "document.body.removeChild(spinnerContainer);" +
                "}" +
                "})();";
                InvokeCustomScript(new ScriptCallback("eval", new string[] { js }), true);
        }
        #endregion


        #region Private Methods
#if NETFX_CORE
        private async Task PlaySound(int playTimes)
        {
            MediaElement sound;

            if (!soundPool.Keys.Contains(BEEP))
            {
                sound = new MediaElement();

                StorageFolder folder = await Package.Current.InstalledLocation.GetFolderAsync(Path.GetDirectoryName(BEEP));
                StorageFile file = await folder.GetFileAsync(Path.GetFileName(BEEP));
                var stream = await file.OpenAsync(FileAccessMode.Read);

                sound.SetSource(stream, file.ContentType);
                soundPool.Add(BEEP, sound);
            }
            else
            {
                sound = soundPool[BEEP];
            }

            try
            {
                if (sound != null)
                {
                    do
                    {
                        sound.Play();
                        await Task.Delay(500);
                    }
                    while (--playTimes > 0);
                }

            }
            catch (Exception ex)
            {
            }
        }
#else
        private void PlaySound(int playTimes)
        {
            SoundEffectInstance sound;

            if (!soundPool.Keys.Contains(BEEP))
            {
                sound = SoundEffect.FromStream(Application.GetResourceStream(new Uri(BEEP, UriKind.Relative)).Stream).CreateInstance();
                sound.IsLooped = false;
                soundPool.Add(BEEP, sound);
            }
            else
            {
                sound = soundPool[BEEP];
            }

            try
            {
                if (sound != null)
                {
                    do
                    {
                        sound.Play();
                        Thread.Sleep(TimeSpan.FromMilliseconds(500));
                    }
                    while (--playTimes > 0);
                }
            }
            catch (Exception ex)
            {
            }

        }
#endif
        #endregion
    }
}
