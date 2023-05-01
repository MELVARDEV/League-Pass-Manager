using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using FlaUI;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Conditions;
using FlaUI.UIA3;
using PowerArgs;

namespace autofill
{





    internal class Program
    {
        public static string ClientPath = "C:\\Riot Games\\Riot Client\\RiotClientServices.exe";
        public static string LaunchArgs = "--launch-product=league_of_legends --launch-patchline=live";

        public static Process leagueClientProcess { get; set; }

        public static FlaUI.Core.Application app { get; set; }

        static void Main(string[] args)
        {


            try
            {
                leagueClientProcess = Process.Start(ClientPath, "--launch-product=league_of_legends --launch-patchline=live");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            Process[] pname = Process.GetProcessesByName("RiotClientUx");
            while (pname.Length == 0)
            {

                pname = Process.GetProcessesByName("RiotClientUx");
            }

            var mainWindowTitle = pname[0].MainWindowTitle;
            while (mainWindowTitle != "Riot Client Main")
            {
                // wait 200 ms  
                System.Threading.Thread.Sleep(200);
                Process[] proc = Process.GetProcessesByName("RiotClientUx");
                while (proc.Length == 0)
                {
                    proc = Process.GetProcessesByName("RiotClientUx");
                }
                mainWindowTitle = proc[0].MainWindowTitle;
                if (proc[0].MainWindowTitle == "Riot Client")
                {
                    pname[0] = proc[0];
                }
            }


            var application = FlaUI.Core.Application.Attach(pname[0]);

            var mainWindow = application.GetMainWindow(new UIA3Automation());

            FlaUI.Core.Input.Wait.UntilResponsive(mainWindow.FindFirstChild(), TimeSpan.FromMilliseconds(5000));

            ConditionFactory cf = new ConditionFactory(new UIA3PropertyLibrary());

            // try to find the input field for 10 seconds, retry every 500 ms

            var inputField = mainWindow.FindFirstDescendant(cf.ByAutomationId("username"));

            while (inputField == null)
            {
                System.Threading.Thread.Sleep(500);
                inputField = mainWindow.FindFirstDescendant(cf.ByAutomationId("username"));
            }

            // set the input field to the username
            inputField.AsTextBox().Text = "username";






        }
    }


}
