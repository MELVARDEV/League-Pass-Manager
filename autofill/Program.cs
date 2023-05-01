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

namespace autofill {
  internal class Program {
    public static string ClientPath = "C:\\Riot Games\\Riot Client\\RiotClientServices.exe";
    public static string LaunchArgs = "--launch-product=league_of_legends --launch-patchline=live";

    public static Process leagueClientProcess { get; set; }

    public static FlaUI.Core.Application app { get; set; }

    static void Main(string[] args) {

      // launch the client
      try {
        leagueClientProcess = Process.Start(ClientPath, "--launch-product=league_of_legends --launch-patchline=live");
      } catch (Exception ex) {
        Console.WriteLine(ex.Message);
      }

      // prepare the window/process for automation
      Process[] pname = Process.GetProcessesByName("RiotClientUx");
      while (pname.Length == 0) {
        pname = Process.GetProcessesByName("RiotClientUx");
      }

      var mainWindowTitle = pname[0].MainWindowTitle;
      while (mainWindowTitle != "Riot Client Main") {
        System.Threading.Thread.Sleep(200);
        Process[] proc = Process.GetProcessesByName("RiotClientUx");
        while (proc.Length == 0) {
          proc = Process.GetProcessesByName("RiotClientUx");
        }
        mainWindowTitle = proc[0].MainWindowTitle;
        if (proc[0].MainWindowTitle == "Riot Client") {
          pname[0] = proc[0];
        }
      }

      var application = FlaUI.Core.Application.Attach(pname[0]);

      var mainWindow = application.GetMainWindow(new UIA3Automation());

      FlaUI.Core.Input.Wait.UntilResponsive(mainWindow.FindFirstChild(), TimeSpan.FromMilliseconds(5000));


      // autofill
      ConditionFactory cf = new ConditionFactory(new UIA3PropertyLibrary());

      var userNameField = mainWindow.FindFirstDescendant(cf.ByAutomationId("username")).AsTextBox();
      var passwordField = mainWindow.FindFirstDescendant(cf.ByAutomationId("password")).AsTextBox();
      var rememberMe = mainWindow.FindFirstDescendant(cf.ByAutomationId("remember-me")).AsCheckBox();

      while (userNameField == null || passwordField == null || rememberMe == null) {
        System.Threading.Thread.Sleep(500);
        userNameField = mainWindow.FindFirstDescendant(cf.ByAutomationId("username")).AsTextBox();
        passwordField = mainWindow.FindFirstDescendant(cf.ByAutomationId("password")).AsTextBox();
        rememberMe = mainWindow.FindFirstDescendant(cf.ByAutomationId("remember-me")).AsCheckBox();
      }

      // workaround for checkbox.IsToggled = true not working. click and restore mouse position
      var mousePosition = System.Windows.Forms.Cursor.Position;
      while (!rememberMe.IsChecked == true) {
        rememberMe.Click();
      }
      System.Windows.Forms.Cursor.Position = mousePosition;


      // get sign in button by name "Sign in"
      var signInButton = mainWindow.FindFirstDescendant(cf.ByName("Sign in")).AsButton();

      userNameField.Text = "useruuuname";
      passwordField.Text = "passworssssd";

      // wait for sign in button to be enabled
      while (!signInButton.AsButton().IsEnabled) {
        System.Threading.Thread.Sleep(500);
      }

      signInButton.Invoke();
    }
  }


}
