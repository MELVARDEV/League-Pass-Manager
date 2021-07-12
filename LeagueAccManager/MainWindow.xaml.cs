using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Newtonsoft.Json;
using Rijndael256;
using System.IO;
using Microsoft.Win32;
using Path = System.IO.Path;
using FlaUI.UIA3;
using FlaUI.Core.Conditions;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;
using Window = System.Windows.Window;
using System.Windows.Interop;
using System.Windows.Media;
using System.Reflection;
using System.Linq;
using System.Collections.ObjectModel;
using HandyControl.Tools;
using System.Net.Http;
using System.Net;
using System.ComponentModel;

namespace LeaguePassManager
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

        [DllImportAttribute("user32.dll")]
        public static extern bool ReleaseCapture();

        private void WindowDrag(object sender, MouseButtonEventArgs e) // MouseDown
        {
            ReleaseCapture();
            SendMessage(new WindowInteropHelper(this).Handle,
                0xA1, (IntPtr)0x2, (IntPtr)0);
        }
        private void WindowResize(object sender, MouseButtonEventArgs e) //PreviewMousLeftButtonDown
        {
            HwndSource hwndSource = PresentationSource.FromVisual((Visual)sender) as HwndSource;
            SendMessage(hwndSource.Handle, 0x112, (IntPtr)61448, IntPtr.Zero);
        }

        protected override void OnMouseLeftButtonDown(MouseButtonEventArgs e)
        {
            base.OnMouseLeftButtonDown(e);

            Point pt = e.GetPosition(titleBar);

            Debug.WriteLine(pt.Y);

            if (pt.Y < titleBar.ActualHeight)
            {
                DragMove();
            }
        }

        //Globals
        public Settings settings = new Settings();
        public List<LolAccount> accounts = new List<LolAccount>();
        string password;
        public List<Task> tasks = new List<Task>();
        // end globals


        //League of Legends accounts functions
        void saveLolAccounts(string password)
        {
            Task t = Task.Run(() =>
            {

                string jsonList = JsonConvert.SerializeObject(accounts);
                string aeCiphertext = RijndaelEtM.Encrypt(jsonList, password, KeySize.Aes256);
                try { File.WriteAllText(settings.filePath, aeCiphertext); }
                catch (System.UnauthorizedAccessException ex)
                {
                    MessageBox.Show("You dont have permission to write to " + settings.filePath + Environment.NewLine + "Change account file location in settings or launch the app as an administrator.");
                }

            });
            tasks.RemoveAll(x => x.IsCompleted);
            tasks.Add(t);

        }
        bool readLolAccounts()
        {
            string jsonString = "";
            try
            {
                jsonString = File.ReadAllText(settings.filePath);
            }
            catch (Exception e)
            {
                MessageBox.Show("Account file doesn't exist yet and will be created now. Double check your encryption key and memorize it or write it down. You won't be able to access your account data without it!" + Environment.NewLine + Environment.NewLine + "Your encryption key: " + password, "WARNING", MessageBoxButton.OK, MessageBoxImage.Exclamation);
                return true;
            }

            string plaintext = "";
            try
            {
                plaintext = RijndaelEtM.Decrypt(jsonString, password, KeySize.Aes256);
            }
            catch (Exception e)
            {
                MessageBox.Show("Wrong decryption phrase");
                return false;
            }
            try
            {



                accounts = JsonConvert.DeserializeObject<List<LolAccount>>(plaintext);

                //getApiAccountData(ref accounts);


            }
            catch (Exception e)
            {
                MessageBox.Show("Accounts file corrupted!");
                return false;
            }
            return true;
        }
        // end



        public MainWindow()
        {

            InitializeComponent();

            //Set up encryption key startup window
            tabControl.Visibility = Visibility.Hidden;
            this.ResizeMode = ResizeMode.NoResize;
            passwordPromptGrid.Visibility = Visibility.Visible;
            Application.Current.MainWindow.Height = 133;
            Application.Current.MainWindow.Width = 260;
            // -------------------


            Settings.load(settings);
          


            // Show loading indicator if any taks are running
            Task.Run(async () =>
            {

                while (true)
                {
                    this.Dispatcher.Invoke(() =>
                    {
                        tasks.RemoveAll(x => x.IsCompleted);
                    });

                    if (tasks.Count == 0)
                    {

                        this.Dispatcher.Invoke(() =>
                        {
                            loadingIndicator.Visibility = Visibility.Hidden;
                        });
                    }
                    else
                    {
                        this.Dispatcher.Invoke(() =>
                        {
                            loadingIndicator.Visibility = Visibility.Visible;
                        });
                    }

                    await Task.Delay(600);
                }
            });

        }

    

 

        private async void fillButton_Click(object sender, RoutedEventArgs e)
        {

            LolAccount selectedAccount = new LolAccount();
            try
            {
                selectedAccount = (LolAccount)datagrid1.SelectedItem;
                LolAccount result = accounts.Find(x => x.UserName == selectedAccount.UserName);
            }
            catch (Exception exce)
            {
                MessageBox.Show("You need to select an account first!");
                return;
            }


            if (settings.exitAfterFill)
            {

                this.Hide();

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
                AutoFill.lol(leagueClientProcess);
            }
            else if (settings.autoOpenClient)
            {
                string sessionFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Riot Games" + Path.DirectorySeparatorChar + "Riot Client" + Path.DirectorySeparatorChar + "Data" + Path.DirectorySeparatorChar + "RiotClientPrivateSettings.yaml");

                try
                {
                    File.Delete(sessionFilePath);
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Cannot Delete");
                    this.Show();
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
                    if (proc[0].MainWindowTitle == "Riot Client")
                    {
                        pname[0] = proc[0];
                    }
                }
                await Task.Delay(settings.launchDelay);
                // MessageBox.Show(pname[0].MainWindowTitle);
                AutoFill.lol(pname[0]);
            }
            else
            {
                MessageBox.Show("League of Legends login screen not found...");

                this.Show();
            }



        }


        private async void datagrid1_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {

            saveLolAccounts(password);
            try
            {
                Task t = Task.WhenAll(tasks.ToArray());
                await t;
                datagrid1.Items.Refresh();
            }
            catch (Exception ex) { }

        }

        private void unlockButton_Click(object sender, RoutedEventArgs e)
        {
            password = encryptionKey.Password;

            if (readLolAccounts())
            {
                datagrid1.ItemsSource = null;
                datagrid1.ItemsSource = accounts;
                datagrid1.Items.Refresh();
                this.ResizeMode = ResizeMode.CanResize;

                passwordPromptGrid.Visibility = Visibility.Hidden;
                Application.Current.MainWindow.Height = 500;
                Application.Current.MainWindow.Width = 846;

                tabControl.Visibility = Visibility.Visible;
            }

        }

        private async void datagrid1_RowEditEnding(object sender, DataGridRowEditEndingEventArgs e)
        {

            //saveAccounts(password);

            try
            {
                Task t = Task.WhenAll(tasks.ToArray());
                await t;
                datagrid1.Items.Refresh();
            }
            catch (Exception ex) { }
            // MessageBox.Show("Row edit ending");
        }

        private void removeButton_Click(object sender, RoutedEventArgs e)
        {
            LolAccount selectedAccount = new LolAccount();
            try
            {
                selectedAccount = (LolAccount)datagrid1.SelectedItem;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Select an account first!");
                return;
            }

            if (MessageBox.Show("Are you sure you want to remove this account: " + selectedAccount.UserName + "?", "Remove Account", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
            {
                accounts.RemoveAll(a => a == selectedAccount);
                datagrid1.Items.Refresh();
            }
        }

        private void datagrid1_CurrentCellChanged(object sender, EventArgs e)
        {


            saveLolAccounts(password);

        }

        private void copyDataToClipboardBtn_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("Are you sure you want to copy all data in PLAIN TEXT to the clipboard?", "Warning", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
            {
                string jsonString = JsonConvert.SerializeObject(accounts);

                Clipboard.SetText(jsonString);
                MessageBox.Show("Data copied to clipboard.");
            }
        }


        // Change encryption key
        private void changeEncryptionKey_Click(object sender, RoutedEventArgs e)
        {
            if (String.IsNullOrWhiteSpace(newEncryptionKey.Text))
            {
                MessageBox.Show("New encryption key input is empty. Please enter new encryption key!");
                return;
            }
            else
            {
                password = newEncryptionKey.Text;
                Task.Run(() =>
                {
                    saveLolAccounts(password);
                });
                newEncryptionKey.Text = "";
                MessageBox.Show("Encryption key changed successfully.");
            }
        }

        //Change pass file directory
        private void changeAccountLocation_Click(object sender, RoutedEventArgs e)
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
                }
                catch (Exception excep)
                {

                }
                settings.filePath = saveFileDialog.FileName;
                passFileLocation.Text = saveFileDialog.FileName;
                settings.save();

                MessageBox.Show("New path saved.");
            }
        }

        private void passFileLocation_TextChanged(object sender, TextChangedEventArgs e)
        {

        }

        private void datagrid1_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

        }


        private void exitAfterFillingSwitch_Unchecked(object sender, RoutedEventArgs e)
        {
            settings.exitAfterFill = false;
            settings.save();
        }
        private void exitAfterFillingSwitch_Checked(object sender, RoutedEventArgs e)
        {
            settings.exitAfterFill = true;
            settings.save();
        }

        private void autoOpenClientSwitch_Checked(object sender, RoutedEventArgs e)
        {

            if (String.IsNullOrWhiteSpace(settings.leagueClientPath) && tabControl.SelectedIndex == 1 && autoOpenClientSwitch.IsChecked == true)
            {

                OpenFileDialog openFileDialog = new OpenFileDialog();
                openFileDialog.AddExtension = true;
                openFileDialog.DefaultExt = "exe";
                openFileDialog.Filter = "RiotClientServices.exe|RiotClientServices.exe";
                if (openFileDialog.ShowDialog() == true)
                {

                    settings.leagueClientPath = openFileDialog.FileName;
                    settings.autoOpenClient = true;
                    autoOpenClientSwitch.IsChecked = true;

                }
                else
                {
                    settings.autoOpenClient = false;
                    autoOpenClientSwitch.IsChecked = false;
                }
            }
            else
            {
                settings.autoOpenClient = (bool)autoOpenClientSwitch.IsChecked;

            }

            settings.save();
        }

        private void autoOpenClientSwitch_Unchecked(object sender, RoutedEventArgs e)
        {
            settings.autoOpenClient = false;
            settings.save();
        }

        /*private void delaySlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (tabControl.SelectedIndex == 1)
            {
                settings.launchDelay = Convert.ToInt32(delaySlider.Value);
                launchDelayLabel.Content = String.Concat(settings.launchDelay.ToString(), " ms");
            }

        }*/

        private void delaySlider_MouseUp(object sender, MouseButtonEventArgs e)
        {
            settings.save();
        }

        private void delaySlider_DragCompleted(object sender, System.Windows.Controls.Primitives.DragCompletedEventArgs e)
        {
            settings.save();
        }

        private void staySignedInSwitch_Checked(object sender, RoutedEventArgs e)
        {
            settings.staySignedIn = true;
            settings.save();
        }
        private void staySignedInSwitch_Unchecked(object sender, RoutedEventArgs e)
        {
            settings.staySignedIn = false;
            settings.save();
        }

        private void closeButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

        private void minimizeButton_Click(object sender, RoutedEventArgs e)
        {
            this.WindowState = WindowState.Minimized;
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            this.Visibility = Visibility.Hidden;
            tasks.RemoveAll(x => x.IsCompleted);
            Task.WaitAll(tasks.ToArray());
        }


    }
}
