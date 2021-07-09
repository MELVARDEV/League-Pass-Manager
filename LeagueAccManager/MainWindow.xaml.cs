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







        public class Settings
        {

            public string filePath { get; set; } = "accounts.txt";
            public bool exitAfterFill { get; set; } = false;
            public string leagueClientPath { get; set; } = null;
            public bool autoOpenClient { get; set; } = false;
            public bool staySignedIn { get; set; } = true;
            public int launchDelay { get; set; } = 0;
        }

        public class Region
        {
            public string Name { get; set; }
        }

        public class Account
        {
            public Account()
            {
                getApiData();
            }


            private string _region = "...";
            public string Region
            {
                get { return _region; }
                set
                {
                    _region = value;
                    getApiData();
                    Raise("Region");
                }

            }


            private string _description;
            public string Description
            {
                get { return _description; }
                set
                {
                    _description = value;
                    Raise("Description");

                }
            }

            private string _userName;
            public string UserName
            {
                get { return _userName; }
                set
                {
                    _userName = value;
                    Raise("UserName");
                }
            }

            private string _password;
            public string Password
            {
                get { return _password; }
                set
                {
                    _password = value;
                    Raise("Password");
                }
            }

            private string _tier;
            public string Tier
            {
                get { return _tier; }
                set
                {
                    _tier = value;
                    Raise("Tier");
                }
            }

            private string _rank;
            public string Rank
            {
                get { return _rank; }
                set
                {
                    _rank = value;
                    Raise("Rank");
                }
            }

            private string _profileIconId = "1";
            public string ProfileIconId
            {
                get { return _profileIconId; }
                set
                {
                    _profileIconId = value;
                    getIcon();
                    Raise("ProfileIconId");
                }
            }

            private string _summonerName;
            public string SummonerName
            {
                get { return _summonerName; }
                set
                {
                    _summonerName = value;
                    getApiData();
                    Raise("SummonerName");
                }
            }

            private int _leaguePoints;
            public int LeaguePoints
            {
                get { return _leaguePoints; }
                set
                {
                    _leaguePoints = value;
                    Raise("LeaguePoints");
                }
            }

            private int _summonerLevel;
            public int SummonerLevel
            {
                get { return _summonerLevel; }
                set
                {
                    _summonerLevel = value;
                    Raise("SummonerLevel");

                }
            }

            public string getIcon()
            {
                if (string.IsNullOrEmpty(ProfileIconId))
                {
                    this.ProfileIconId = "1";
                }



                try
                {
                    Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "assets"));
                }
                catch (Exception e)
                {
                    MessageBox.Show(e.Message);
                }

                string path = Path.Combine("assets", $"{ this.ProfileIconId}.jpg");
                if (File.Exists(path))
                {
                    return Path.GetFullPath(path);
                }
                else
                {
                    using (WebClient myWebClient = new WebClient())
                    {

                        // Download the Web resource and save it into the current filesystem folder.
                        myWebClient.DownloadFile($"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/{this.ProfileIconId}.jpg", path);
                    }
                    return Path.GetFullPath(path);
                }

            }

            private string _iconPath;
            public string iconPath
            {
                get
                {

                    string path = getIcon();
                    Raise("iconPath");



                    return path;


                }
                set
                {
                    Raise("iconPath");
                }
            }

            private string _divPath;
            public string divPath
            {
                get
                {
                    if (!string.IsNullOrEmpty(this.Tier))
                    {
                        string path = $"assets/Emblem_{this.Tier}.png";
                        return path;
                    }
                    else
                    {
                        return null;
                    }
                }
                set { }
            }

            private string _divString;
            public string divString
            {
                get
                {
                    if (!string.IsNullOrEmpty(this.Tier) && !string.IsNullOrEmpty(this.Rank) && !string.IsNullOrEmpty(this.LeaguePoints.ToString()))
                    {
                        string div = $"{this.Tier} {this.Rank} {this.LeaguePoints}LP";
                        return div;
                    }else if (!string.IsNullOrEmpty(this.Tier))
                    {
                        return this.Tier;
                    }
                    else
                    {
                        return null;
                    }
                }
                set { }
            }

            private void getApiData()
            {
                if (!string.IsNullOrEmpty(this.SummonerName) && !string.IsNullOrEmpty(this.Region) && this.Region != "...")
                {
                    Task t = Task.Run(async () =>
                    {
                        try
                        {
                            HttpClient leagueReq = new HttpClient();
                            var leagueContent = await leagueReq.GetAsync($"https://express-tp4i3olaqq-ez.a.run.app/riot/league/{this.Region}/{this.SummonerName}");

                            JsonConvert.PopulateObject(await leagueContent.Content.ReadAsStringAsync(), this);

                        }
                        catch (Exception ex)
                        {

                            this.Tier = "Unranked";


                        }

                        try
                        {
                            HttpClient summonerReq = new HttpClient();
                            var summonerContent = await summonerReq.GetAsync($"https://express-tp4i3olaqq-ez.a.run.app/riot/summoner/{this.Region}/{this.SummonerName}");



                            JsonConvert.PopulateObject(await summonerContent.Content.ReadAsStringAsync(), this);

                        }
                        catch (Exception ex)
                        {

                        }





                        getIcon();
                        Raise("IconPath");




                    });

                    foreach (Window window in Application.Current.Windows)
                    {
                        if (window.GetType() == typeof(MainWindow))
                        {
                            (window as MainWindow).tasks.Add(t);
                        }
                    }
                }
            }

            public event PropertyChangedEventHandler PropertyChanged;
            public void Raise(string propertyName)
            {
                if (PropertyChanged != null)
                    PropertyChanged(this, new PropertyChangedEventArgs(propertyName));

            }

        }

        public Settings settings = new Settings();

        public List<Account> accounts = new List<Account>();




        string password;

        bool AllNullOrEmpty(object myObject)
        {
            Console.WriteLine("Properties: {0}", myObject.GetType().GetProperties().Count());
            int nullProperties = 0;
            int amountOfProperties = myObject.GetType().GetProperties().Count();
            foreach (PropertyInfo pi in myObject.GetType().GetProperties())
            {
                if (pi.PropertyType == typeof(string))
                {
                    string value = (string)pi.GetValue(myObject);
                    if (string.IsNullOrEmpty(value))
                    {
                        nullProperties++;

                    }
                }
            }
            if (nullProperties >= amountOfProperties)
            {
                return true;
            }
            else
            {
                return false;
            }

        }
        public List<Task> tasks = new List<Task>();

        void saveAccounts(string password)
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


        bool readAccounts()
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



                accounts = JsonConvert.DeserializeObject<List<Account>>(plaintext);

                //getApiAccountData(ref accounts);


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
            catch (Exception e)
            {
                saveSettings();
                settingsJson = File.ReadAllText("settings.json");
                settings = JsonConvert.DeserializeObject<Settings>(settingsJson);

            }

            autoOpenClientSwitch.IsChecked = settings.autoOpenClient;
            exitAfterFillingSwitch.IsChecked = settings.exitAfterFill;
            staySignedInSwitch.IsChecked = settings.staySignedIn;
            //delaySlider.Value = Convert.ToDouble(settings.launchDelay);
            //launchDelayLabel.Content = settings.launchDelay.ToString() + " ms";
        }


        public MainWindow()
        {

            InitializeComponent();
            tabControl.Visibility = Visibility.Hidden;
            this.ResizeMode = ResizeMode.NoResize;
            passwordPromptGrid.Visibility = Visibility.Visible;
            Application.Current.MainWindow.Height = 133;
            Application.Current.MainWindow.Width = 260;


            //settings.filePath = "accounts.txt";
            loadSettings();
            passFileLocation.Text = settings.filePath;



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
                this.Show();
                return;
            }



            Account result = accounts.Find(x => x.UserName == selectedAccount.UserName);

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



        }

        private async void fillButton_Click(object sender, RoutedEventArgs e)
        {

            Account selectedAccount = new Account();
            try
            {
                selectedAccount = (Account)datagrid1.SelectedItem;
                Account result = accounts.Find(x => x.UserName == selectedAccount.UserName);
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


                simulateFill(leagueClientProcess);

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
                simulateFill(pname[0]);
            }
            else
            {
                MessageBox.Show("League of Legends login screen not found...");

                this.Show();
            }



        }


        private async void datagrid1_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {

            saveAccounts(password);
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

            if (readAccounts())
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
            Account selectedAccount = new Account();
            try
            {
                selectedAccount = (Account)datagrid1.SelectedItem;
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


            saveAccounts(password);

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
                    saveAccounts(password);
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


        private void exitAfterFillingSwitch_Unchecked(object sender, RoutedEventArgs e)
        {
            settings.exitAfterFill = false;
            saveSettings();
        }
        private void exitAfterFillingSwitch_Checked(object sender, RoutedEventArgs e)
        {
            settings.exitAfterFill = true;
            saveSettings();
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

            saveSettings();
        }

        private void autoOpenClientSwitch_Unchecked(object sender, RoutedEventArgs e)
        {
            settings.autoOpenClient = false;
            saveSettings();
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

            saveSettings();
        }

        private void delaySlider_DragCompleted(object sender, System.Windows.Controls.Primitives.DragCompletedEventArgs e)
        {
            saveSettings();
        }

        private void staySignedInSwitch_Checked(object sender, RoutedEventArgs e)
        {
            settings.staySignedIn = true;
            saveSettings();
        }
        private void staySignedInSwitch_Unchecked(object sender, RoutedEventArgs e)
        {
            settings.staySignedIn = false;
            saveSettings();
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
