using System.ComponentModel.DataAnnotations;
using System.Diagnostics;

using FlaUI;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Conditions;
using FlaUI.UIA3;


namespace autofill {

  internal class Program {
    public static void ClickRestoreMousePosition(AutomationElement el) {
      var mousePosition = System.Windows.Forms.Cursor.Position;
      el.Click();
      System.Windows.Forms.Cursor.Position = mousePosition;
    }

    public static string ClientPath = "C:\\Riot Games\\Riot Client\\RiotClientServices.exe";
    public static string LaunchArgs = "--launch-product=valorant --launch-patchline=live";

    public static Process leagueClientProcess { get; set; }

    public static FlaUI.Core.Application app { get; set; }

    static string UserName { get; set; }
    static string Password { get; set; }
    static bool RememberMe { get; set; }

    // game type parameter, enforce possible values: "valorant", "league_of_legends", "lor", "tft"

    [System.ComponentModel.DefaultValue("league_of_legends"), RegularExpression("^(valorant|league_of_legends|lor|tft)$")]
    static string GameType { get; set; }

    public static void ValidateArgs(string[] args) {
      if (args.Length == 0) {
        throw new ArgumentException("No arguments provided");
      }

      try {
        foreach (var arg in args) {
          if (arg.Contains("--username=")) {
            UserName = arg.Split("=")[1];
          } else if (arg.Contains("--password=")) {
            Password = arg.Split("=")[1];
          } else if (arg.Contains("--remember-me=")) {
            RememberMe = bool.Parse(arg.Split("=")[1]);
          } else if (arg.Contains("--game-type=")) {
            GameType = arg.Split("=")[1];
          }
        }
      } catch (System.Exception) {

        throw;
      }


      if (UserName == null || Password == null) {
        throw new ArgumentException("Username and password are required");
      }

      if (GameType == null) {
        throw new ArgumentException("Game type is required");
      }
    }

    static void Main(string[] args) {
      ValidateArgs(args);

      // launch the client
      try {
        leagueClientProcess = Process.Start(ClientPath, $"--launch-product={GameType} --launch-patchline=live");
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


      // get sign in button by name "Sign in" and control type "Button"
      var signInButton = mainWindow.FindFirstDescendant(cf.ByName("Sign in").And(cf.ByControlType(FlaUI.Core.Definitions.ControlType.Button))).AsButton();

      userNameField.Text = "useruuuname";
      passwordField.Text = "passworssssd";

      // wait for sign in button to be enabled
      while (!signInButton.AsButton().IsEnabled) {
        System.Threading.Thread.Sleep(200);
      }

      signInButton.Invoke();

    }
  }


}
