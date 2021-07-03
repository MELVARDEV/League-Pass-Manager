using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using WindowsInput;
using WindowsInput.Native;
using MahApps.Metro.Controls;
using Newtonsoft.Json;
using Rijndael256;
using System.IO;
using System.ComponentModel;
using Microsoft.Win32;
using Path = System.IO.Path;
using FlaUI.UIA3;
using FlaUI.Core.Conditions;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Tools;
using FlaUI.Core.Definitions;

namespace League_Pass_Manager
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    /// 

    public partial class MainWindow : MetroWindow
    {

        [DllImport("user32.dll")]
        internal static extern IntPtr SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        internal static extern bool ShowWindow(IntPtr hWnd, int nCmdShow); //ShowWindow needs an IntPtr

        [DllImport("user32.dll")]
        static extern bool PostMessage(IntPtr hWnd, UInt32 Msg, int wParam, int lParam);
        [DllImport("user32.dll")]
        static extern byte VkKeyScan(char ch);

        //include SendMessage
        [DllImport("user32.dll")]
        public static extern int SendMessage(IntPtr hWnd, int uMsg, int wParam, string lParam);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool IsWindowVisible(IntPtr hWnd);

        //include FindWindowEx
        [DllImport("user32.dll")]
        public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

        public class Settings
        {

            public string filePath { get; set; } = "accounts.txt";
            public bool exitAfterFill { get; set; } = false;
            public string leagueClientPath { get; set; } = null;
            public bool autoOpenClient { get; set; } = false;
            public bool staySignedIn { get; set; } = true;
            public int launchDelay { get; set; } = 0;
        }

        public class Account 
        {
            public string region { get; set; }
      
            public string description { get; set; }
            public string userName { get; set; }
            public string password { get; set; }

       
        }

        public Settings settings = new Settings();
        
        public List<Account> accounts = new List<Account>();

  
    
     
        string password;

        void saveAccounts(string password)
        {
            string jsonList = JsonConvert.SerializeObject(accounts);
            string aeCiphertext = RijndaelEtM.Encrypt(jsonList, password, KeySize.Aes256);
            try { File.WriteAllText(settings.filePath, aeCiphertext); }
#pragma warning disable CS0168 // Variable is declared but never used
            catch(System.UnauthorizedAccessException ex)
#pragma warning restore CS0168 // Variable is declared but never used
            {
                MessageBox.Show("You dont have permission to write to " + settings.filePath + Environment.NewLine + "Change account file location in settings or launch the app as an administrator.");
            }
   
        }

        bool readAccounts()
        {
            string jsonString = "";
            try
            {
                jsonString = File.ReadAllText(settings.filePath);
            } catch(Exception e)
            {
                MessageBox.Show("Account file doesn't exist yet and will be created now. Double check your encryption key and memorize it or write it down. You won't be able to access your account data without it!" + Environment.NewLine + Environment.NewLine + "Your encryption key: " + password, "WARNING", MessageBoxButton.OK, MessageBoxImage.Exclamation);
                return true;
            }
         
            string plaintext = "";
            try
            {
                plaintext = RijndaelEtM.Decrypt(jsonString, password, KeySize.Aes256);
            } catch (Exception e)
            {
                MessageBox.Show("Wrong decryption phrase");
                return false;
            }
            try
            {
                accounts = JsonConvert.DeserializeObject<List<Account>>(plaintext);
            }
            catch (Exception e)
            {
                MessageBox.Show("Accounts file corrupted!");
                return false;
            }
            return true;
        }

        public void saveSettings()
        {
            File.WriteAllText("settings.json", JsonConvert.SerializeObject(settings));
        }

        public void loadSettings()
        {
            string settingsJson = "";

            try
            {
           
                settingsJson = File.ReadAllText("settings.json");
                settings = JsonConvert.DeserializeObject<Settings>(settingsJson);
            }
            catch(Exception e)
            {
                 saveSettings();
                settingsJson = File.ReadAllText("settings.json");
                settings = JsonConvert.DeserializeObject<Settings>(settingsJson);
      
            }

            autoOpenClientSwitch.IsOn = settings.autoOpenClient;
            exitAfterFillingSwitch.IsOn = settings.exitAfterFill;
            staySignedInSwitch.IsOn = settings.staySignedIn;
            delaySlider.Value = Convert.ToDouble(settings.launchDelay);
            launchDelayLabel.Content = settings.launchDelay.ToString() + " ms";
        }


        public MainWindow()
        {
            InitializeComponent();
            mainGrid.Visibility = Visibility.Hidden;
            passwordPromptGrid.Visibility = Visibility.Visible;
            Application.Current.MainWindow.Height = 103;
            Application.Current.MainWindow.Width = 300;


            //settings.filePath = "accounts.txt";
            loadSettings();
            passFileLocation.Text = settings.filePath;
        }

        public void wait(int milliseconds)
        {
            var timer1 = new System.Windows.Forms.Timer();
            if (milliseconds == 0 || milliseconds < 0) return;

            // Console.WriteLine("start wait timer");
            timer1.Interval = milliseconds;
            timer1.Enabled = true;
            timer1.Start();

            timer1.Tick += (s, e) =>
            {
                timer1.Enabled = false;
                timer1.Stop();
                // Console.WriteLine("stop wait timer");
            };

            while (timer1.Enabled)
            {
                
            }
        }

        void simulateFill(Process pr)
        {
    
            var application = FlaUI.Core.Application.Attach(pr.Id);
                
           
            var mainWindow = application.GetMainWindow(new UIA3Automation());
            //mainWindow.FindFirstDescendant();

            FlaUI.Core.Input.Wait.UntilResponsive(mainWindow.FindFirstChild(), TimeSpan.FromMilliseconds(5000));
    
            // MessageBox.Show(mainWindow.Title);

            ConditionFactory cf = new ConditionFactory(new UIA3PropertyLibrary());
            Account selectedAccount = new Account();

            try
            {
                selectedAccount = (Account)datagrid1.SelectedItem;
            }
            catch (Exception exce)
            {
                MessageBox.Show("You need to select an account first!");
                return;
            }



            Account result = accounts.Find(x => x.userName == selectedAccount.userName);

            bool tryAgain = true;
            if (!String.IsNullOrEmpty(result.userName))
            {
                while (tryAgain)
                {
                    try
                    {
                        mainWindow.FindFirstDescendant(cf.ByName("USERNAME")).AsTextBox().Text = result.userName;
                        
                        tryAgain = false;
                    }
                    catch (Exception e) {}
                }
            }


            tryAgain = true;
            if (!String.IsNullOrEmpty(result.password))
            {
                while (tryAgain)
                {
                    try
                    {
                        mainWindow.FindFirstDescendant(cf.ByName("PASSWORD")).AsTextBox().Text = result.password;
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
                    if (mainWindow.FindFirstDescendant(cf.ByName("Stay signed in")).AsCheckBox().IsToggled != settings.staySignedIn)
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
       

            if (settings.exitAfterFill)
            {

                this.Close();

            }
            return;


            /*IntPtr hWnd = pr.MainWindowHandle;
            //ShowWindow(hWnd, 3);
            SetForegroundWindow(hWnd);
            var inputSimulator = new InputSimulator();
            Account selectedAccount = new Account();
            try
            {
                selectedAccount = (Account)datagrid1.SelectedItem;
            }
            catch (Exception exce)
            {
                MessageBox.Show("You need to select an account first!");
                return;
            }

            Account result = accounts.Find(x => x.userName == selectedAccount.userName);

            if (!String.IsNullOrEmpty(result.userName))
            {
                inputSimulator.Keyboard.TextEntry(result.userName);
            }

            inputSimulator.Keyboard.KeyPress((VirtualKeyCode.TAB));

            if (!String.IsNullOrEmpty(result.password))
            {
                inputSimulator.Keyboard.TextEntry(result.password);
            }

            inputSimulator.Keyboard.KeyPress((VirtualKeyCode.RETURN));

            if (settings.exitAfterFill)
            {

                this.Close();

            }
            return;*/
        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {

            Account selectedAccount = new Account();
            try
            {
                selectedAccount = (Account)datagrid1.SelectedItem;
                Account result = accounts.Find(x => x.userName == selectedAccount.userName);
            }
            catch (Exception exce)
            {
                MessageBox.Show("You need to select an account first!");
                return;
            }



   



            IntPtr hWnd;
            Process[] processRunning = Process.GetProcesses();
            Process leagueClientProcess = null;
            foreach (Process pr in processRunning)
            {
                if (pr.ProcessName == "RiotClientUx")
                {
                    leagueClientProcess = pr;
                } 
            }

            if (leagueClientProcess != null)
            {
               

                simulateFill(leagueClientProcess);
        
            } else if (settings.autoOpenClient)
            {
           

                string sessionFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Riot Games" + Path.DirectorySeparatorChar + "Riot Client" + Path.DirectorySeparatorChar + "Data" + Path.DirectorySeparatorChar + "RiotClientPrivateSettings.yaml");

                try
                {
                    File.Delete(sessionFilePath);
                } catch (Exception ex)
                {
                    MessageBox.Show("Cannot Delete");
                    Console.WriteLine(ex.Message);
                }
              

               


                leagueClientProcess = Process.Start(settings.leagueClientPath, "--launch-product=league_of_legends --launch-patchline=live");


                Process[] pname = Process.GetProcessesByName("RiotClientUx");
                while (pname.Length == 0)
                {
                    await Task.Delay(200);
                    pname = Process.GetProcessesByName("RiotClientUx");
                }



                // MessageBox.Show(leagueClientProcess.Id.ToString());
        

       
                var mainWindowTitle = pname[0].MainWindowTitle;
                while (mainWindowTitle != "Riot Client")
                {
                    await Task.Delay(200);
                    Process[] proc = Process.GetProcessesByName("RiotClientUx");
                    while (proc.Length == 0)
                    {
                        proc = Process.GetProcessesByName("RiotClientUx");
                    }
                    mainWindowTitle = proc[0].MainWindowTitle;
                    if(proc[0].MainWindowTitle == "Riot Client")
                    {
                        pname[0] = proc[0];
                    }
                }
                await Task.Delay(settings.launchDelay);
                // MessageBox.Show(pname[0].MainWindowTitle);
                simulateFill(pname[0]);
            } else
            {
                MessageBox.Show("League of Legends login screen not found...");
            }
         

         
        }


        private void datagrid1_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            saveAccounts(password);
        }

        private void unlockButton_Click(object sender, RoutedEventArgs e)
        {
            password = encryptionKey.Password;

            if (readAccounts())
            {
                datagrid1.ItemsSource = null;
                datagrid1.ItemsSource = accounts;
                datagrid1.Items.Refresh();
                passwordPromptGrid.Visibility = Visibility.Hidden;
                Application.Current.MainWindow.Height = 400;
                Application.Current.MainWindow.Width = 450;

                mainGrid.Visibility = Visibility.Visible;
            }
     
        }

        private void datagrid1_RowEditEnding(object sender, DataGridRowEditEndingEventArgs e)
        {
            saveAccounts(password);
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            Account selectedAccount = new Account();
            try
            {
                selectedAccount = (Account)datagrid1.SelectedItem;
            } catch(Exception ex)
            {
                MessageBox.Show("Select an account first!");
                return;
            }
           
            if (MessageBox.Show("Are you sure you want to remove this account: " + selectedAccount.userName + "?", "Remove Account", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
            {
                accounts.RemoveAll(a => a == selectedAccount);
                datagrid1.Items.Refresh();
            }
        }

        private void datagrid1_CurrentCellChanged(object sender, EventArgs e)
        {
            saveAccounts(password);
        }

        private void copyDataToClipboardBtn_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("Are you sure you want to copy all data in PLAIN TEXT to the clipboard?","Warning", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
            {
                string jsonString = JsonConvert.SerializeObject(accounts);

                Clipboard.SetText(jsonString);
                MessageBox.Show("Data copied to clipboard.");
            }
        }


        // Change encryption key
        private void Button_Click_2(object sender, RoutedEventArgs e)
        {
            if (String.IsNullOrWhiteSpace(newEncryptionKey.Text))
            {
                MessageBox.Show("New encryption key input is empty. Please enter new encryption key!");
                return;
            } else
            {
                password = newEncryptionKey.Text;
                saveAccounts(password);
                newEncryptionKey.Text = "";
                MessageBox.Show("Encryption key changed successfully.");
            }
        }

        //Change pass file directory
        private void Button_Click_3(object sender, RoutedEventArgs e)
        {

            SaveFileDialog saveFileDialog = new SaveFileDialog();
            saveFileDialog.AddExtension = true;
            saveFileDialog.DefaultExt = "txt";
            saveFileDialog.Filter = "Text file (*.txt)|*.txt";
            if (saveFileDialog.ShowDialog() == true)
            {
                try
                {
                    File.Move(settings.filePath, saveFileDialog.FileName);
                } catch (Exception excep)
                {

                }
                settings.filePath = saveFileDialog.FileName;
                passFileLocation.Text = saveFileDialog.FileName;
                saveSettings();
               
                MessageBox.Show("New path saved.");
            }
        }

        private void passFileLocation_TextChanged(object sender, TextChangedEventArgs e)
        {

        }

        private void datagrid1_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

        }

        private void exitAfterFillingSwitch_Toggled(object sender, RoutedEventArgs e)
        {

      
            settings.exitAfterFill = exitAfterFillingSwitch.IsOn;
            saveSettings();
        }

        private void autoOpenClientSwitch_Toggled(object sender, RoutedEventArgs e)
        {
         
            if (String.IsNullOrWhiteSpace(settings.leagueClientPath) && tabControl.SelectedIndex == 1 && autoOpenClientSwitch.IsOn == true)
            {
            
                OpenFileDialog openFileDialog = new OpenFileDialog();
                openFileDialog.AddExtension = true;
                openFileDialog.DefaultExt = "exe";
                openFileDialog.Filter = "RiotClientServices.exe|RiotClientServices.exe";
                if (openFileDialog.ShowDialog() == true)
                {
                  
                    settings.leagueClientPath = openFileDialog.FileName;
                    settings.autoOpenClient = true;
                    autoOpenClientSwitch.IsOn = true;
                   
                } else
                {
                    settings.autoOpenClient = false;
                    autoOpenClientSwitch.IsOn = false;
                }
            }

            saveSettings();
        }

        private void delaySlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if(tabControl.SelectedIndex == 1)
            {
                settings.launchDelay = Convert.ToInt32(delaySlider.Value);
                launchDelayLabel.Content = String.Concat(settings.launchDelay.ToString(), " ms");
            }
          
        }

        private void delaySlider_MouseUp(object sender, MouseButtonEventArgs e)
        {

            saveSettings();
        }

        private void delaySlider_DragCompleted(object sender, System.Windows.Controls.Primitives.DragCompletedEventArgs e)
        {
            saveSettings();
        }

        private void staySignedInSwitch_Toggled(object sender, RoutedEventArgs e)
        {
            settings.staySignedIn = staySignedInSwitch.IsOn;
            saveSettings();
        }

        private void cMenuItemCopy_Click(object sender, RoutedEventArgs e)
        {

            try
            {
                Clipboard.SetText(Path.Join(Path.GetDirectoryName(System.Reflection.Assembly.GetEntryAssembly().Location), settings.filePath));
            }
            catch (Exception ex) { }
          
        }

        private void cMenuItemOpenDir_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string filePath = Path.Join(Path.GetDirectoryName(System.Reflection.Assembly.GetEntryAssembly().Location), settings.filePath);

                if (!File.Exists(filePath))
                {
                    return;
                }

                string argument = "/select, \"" + filePath + "\"";
                System.Diagnostics.Process.Start("explorer.exe", argument);
            }
            catch (Exception ex) { }
        
        }
    }
}
