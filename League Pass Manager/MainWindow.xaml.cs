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
using MingweiSamuel.Camille;
using MingweiSamuel.Camille.SummonerV4;
using MingweiSamuel.Camille.LeagueV4;

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

        //include FindWindowEx
        [DllImport("user32.dll")]
        public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

        public class Settings
        {
            public string filePath { get; set; } = "accounts.txt";
            public string apiKey { get; set; }
        }

        public class Account 
        {
            public string region { get; set; }
      
            public string description { get; set; }
            public string nick { get; set; }
            public string userName { get; set; }
            public string password { get; set; }
            public string level { get; set; } = "-";
            public string tier { get; set; } = "-";
            public string profileIcon { get; set; }
        }

        public Settings settings = new Settings();
        
        public List<Account> accounts = new List<Account>();

 





        string password;

        void saveAccounts(string password)
        {
            string jsonList = JsonConvert.SerializeObject(accounts);
            string aeCiphertext = RijndaelEtM.Encrypt(jsonList, password, KeySize.Aes256);
            try { File.WriteAllText(settings.filePath, aeCiphertext); }
            catch(System.UnauthorizedAccessException ex)
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
                var riotApi = RiotApi.NewInstance(settings.apiKey);
                accounts.ForEach(account =>
                {
                    MingweiSamuel.Camille.Enums.Region region = MingweiSamuel.Camille.Enums.Region.EUNE;
                    if(account.region.ToLower() == "eune")
                    {
                        region = MingweiSamuel.Camille.Enums.Region.EUNE;
                    }

                    if (account.region.ToLower() == "euw")
                    {
                        region = MingweiSamuel.Camille.Enums.Region.EUW;
                    }

                    if (account.region.ToLower() == "na")
                    {
                        region = MingweiSamuel.Camille.Enums.Region.NA;
                    }

                    if (account.region.ToLower() == "kr")
                    {
                        region = MingweiSamuel.Camille.Enums.Region.KR;
                    }

                    if (account.region.ToLower() == "oce")
                    {
                        region = MingweiSamuel.Camille.Enums.Region.OCE;
                    }

                    if (account.region.ToLower() == "jp")
                    {
                        region = MingweiSamuel.Camille.Enums.Region.JP;
                    }

                    if (!String.IsNullOrEmpty(account.nick))
                    {
                        Summoner summoner = riotApi.SummonerV4.GetBySummonerName(region, account.nick);
                        account.level = summoner.SummonerLevel.ToString();
                        LeagueEntry[] league = riotApi.LeagueV4.GetLeagueEntriesForSummoner(region, summoner.Id);
                        LeagueEntry summonerLeague = league.ToList().Find(i => i.QueueType == "RANKED_SOLO_5x5");
                        account.tier = summonerLeague.Tier + " " + summonerLeague.Rank;
                        
                    }
                  
                });
            }
            catch (Exception e)
            {
                MessageBox.Show("Accounts file corrupted!");
                Console.WriteLine(e.Message);
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

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            IntPtr hWnd;
            Process[] processRunning = Process.GetProcesses();
            foreach (Process pr in processRunning)
            {
                if (pr.ProcessName == "RiotClientUx")
                {
                    hWnd = pr.MainWindowHandle;
                    //ShowWindow(hWnd, 3);
                    SetForegroundWindow(hWnd);
                    var inputSimulator = new InputSimulator();
                    Account selectedAccount = new Account();
                    try
                    {
                        selectedAccount = (Account)datagrid1.SelectedItem;
                    } catch (Exception exce)
                    {
                        MessageBox.Show("You need to select an account first!");
                        return;
                    }

                    Account result = accounts.Find(x => x.userName == selectedAccount.userName);
               
                    inputSimulator.Keyboard.TextEntry(result.userName);
                    inputSimulator.Keyboard.KeyPress((VirtualKeyCode.TAB));
                    inputSimulator.Keyboard.TextEntry(result.password);
                    inputSimulator.Keyboard.KeyPress((VirtualKeyCode.RETURN));
                }
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
                Application.Current.MainWindow.Width = 600;

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
    }
}
