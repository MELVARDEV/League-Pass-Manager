using FlaUI.Core.AutomationElements;
using FlaUI.Core.Conditions;
using FlaUI.Core.Definitions;
using FlaUI.UIA3;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace LeaguePassManager
{
    class AutoFill
    {
        public static void lol(Process pr)
        {
            var application = FlaUI.Core.Application.Attach(pr.Id);

            var mainWindow = application.GetMainWindow(new UIA3Automation());

            FlaUI.Core.Input.Wait.UntilResponsive(mainWindow.FindFirstChild(), TimeSpan.FromMilliseconds(5000));

            ConditionFactory cf = new ConditionFactory(new UIA3PropertyLibrary());
            LolAccount selectedAccount = new LolAccount();

            foreach (System.Windows.Window window in Application.Current.Windows)
            {
                if (window.GetType() == typeof(MainWindow))
                {
                    try
                    {
                        selectedAccount = (LolAccount)(window as MainWindow).datagrid1.SelectedItem;
                    }
                    catch (Exception exce)
                    {
                        MessageBox.Show("You need to select an account first!");
                        (window as MainWindow).Show();
                        return;
                    }
                    LolAccount result = (window as MainWindow).lolAccounts.Find(x => x.UserName == selectedAccount.UserName);


                    bool tryAgain = true;
                    if (!String.IsNullOrEmpty(result.UserName))
                    {
                        while (tryAgain)
                        {
                            try
                            {
                                mainWindow.FindFirstDescendant(cf.ByName("USERNAME")).AsTextBox().Text = result.UserName;
                                tryAgain = false;
                            }
                            catch (Exception e) { }
                        }
                    }

                    tryAgain = true;
                    if (!String.IsNullOrEmpty(result.Password))
                    {
                        while (tryAgain)
                        {
                            try
                            {
                                mainWindow.FindFirstDescendant(cf.ByName("PASSWORD")).AsTextBox().Text = result.Password;
                                tryAgain = false;
                            }
                            catch (Exception e) { }
                        }
                    }

                    tryAgain = true;
                    while (tryAgain)
                    {
                        try
                        {
                            if (mainWindow.FindFirstDescendant(cf.ByName("Stay signed in")).AsCheckBox().IsToggled != (window as MainWindow).settings.staySignedIn)
                            {
                                mainWindow.FindFirstDescendant(cf.ByName("Stay signed in")).AsCheckBox().Toggle();
                            }
                            tryAgain = false;
                        }
                        catch (Exception e) { }
                    }

                    tryAgain = true;
                    while (tryAgain)
                    {
                        try
                        {
                            mainWindow.FindFirstDescendant(cf.ByName("Sign in").And(cf.ByControlType(ControlType.Button))).AsButton().Invoke();
                            tryAgain = false;
                        }
                        catch (Exception e) { }
                    }


                    if ((window as MainWindow).settings.exitAfterFill)
                    {

                        (window as MainWindow).Close();

                    }
                    return;

                }
            }
        }

        public static void valorant(Process pr)
        {
            var application = FlaUI.Core.Application.Attach(pr.Id);

            var mainWindow = application.GetMainWindow(new UIA3Automation());

            FlaUI.Core.Input.Wait.UntilResponsive(mainWindow.FindFirstChild(), TimeSpan.FromMilliseconds(5000));

            ConditionFactory cf = new ConditionFactory(new UIA3PropertyLibrary());
            ValorantAccount selectedAccount = new ValorantAccount();

            foreach (System.Windows.Window window in Application.Current.Windows)
            {
                if (window.GetType() == typeof(MainWindow))
                {
                    try
                    {
                        selectedAccount = (ValorantAccount)(window as MainWindow).dataGridValorant.SelectedItem;
                    }
                    catch (Exception exce)
                    {
                        MessageBox.Show("You need to select an account first!");
                        (window as MainWindow).Show();
                        return;
                    }
                    ValorantAccount result = (window as MainWindow).valorantAccounts.Find(x => x.UserName == selectedAccount.UserName);


                    bool tryAgain = true;
                    if (!String.IsNullOrEmpty(result.UserName))
                    {
                        while (tryAgain)
                        {
                            try
                            {
                                mainWindow.FindFirstDescendant(cf.ByName("USERNAME")).AsTextBox().Text = result.UserName;
                                tryAgain = false;
                            }
                            catch (Exception e) { }
                        }
                    }


                    tryAgain = true;
                    if (!String.IsNullOrEmpty(result.Password))
                    {
                        while (tryAgain)
                        {
                            try
                            {
                                mainWindow.FindFirstDescendant(cf.ByName("PASSWORD")).AsTextBox().Text = result.Password;
                                tryAgain = false;
                            }
                            catch (Exception e) { }
                        }
                    }


                    tryAgain = true;
                    while (tryAgain)
                    {
                        try
                        {
                            if (mainWindow.FindFirstDescendant(cf.ByName("Stay signed in")).AsCheckBox().IsToggled != (window as MainWindow).settings.staySignedIn)
                            {
                                mainWindow.FindFirstDescendant(cf.ByName("Stay signed in")).AsCheckBox().Toggle();
                            }
                            tryAgain = false;
                        }
                        catch (Exception e) { }
                    }


                    tryAgain = true;
                    while (tryAgain)
                    {
                        try
                        {
                            mainWindow.FindFirstDescendant(cf.ByName("Sign in").And(cf.ByControlType(ControlType.Button))).AsButton().Invoke();
                            tryAgain = false;
                        }
                        catch (Exception e) { }
                    }


                    if ((window as MainWindow).settings.exitAfterFill)
                    {
                        (window as MainWindow).Close();
                    }
                    return;

                }
            }
        }
    }
}
