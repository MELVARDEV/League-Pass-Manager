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

        public class Account 
        {
            public string region { get; set; }
            public string description { get; set; }
            public string userName { get; set; }
            public string password { get; set; }
        }

        public List<Account> accounts = new List<Account>();
        string password;

        void saveAccounts(string password)
        {
            string jsonList = JsonConvert.SerializeObject(accounts);
            string aeCiphertext = RijndaelEtM.Encrypt(jsonList, password, KeySize.Aes256);
            File.WriteAllText("accounts.txt", aeCiphertext);
        }

        bool readAccounts()
        {
            string jsonString = "";
            try
            {
                jsonString = File.ReadAllText("accounts.txt");
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

        public MainWindow()
        {
            InitializeComponent();
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
                    ShowWindow(hWnd, 3);
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
                    inputSimulator.Keyboard.KeyDown((VirtualKeyCode.TAB));
                    inputSimulator.Keyboard.TextEntry(result.password);
                    inputSimulator.Keyboard.KeyDown((VirtualKeyCode.RETURN));
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
    }
}
