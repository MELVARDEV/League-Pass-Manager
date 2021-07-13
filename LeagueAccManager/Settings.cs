using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace LeaguePassManager
{
    public class Settings
    {
        public string lolAccountFilePath { get; set; } = "accounts.txt";
        public string valorantAccountFilePath { get; set; } = "valorant_accounts.txt";
        public bool exitAfterFill { get; set; } = false;
        public string riotClientPath { get; set; } = null;
        public bool autoOpenClient { get; set; } = false;
        public bool staySignedIn { get; set; } = true;
        public bool hideAllValorantOptions { get; set; } = true;
        public int launchDelay { get; set; } = 0;

        public void save()
        {
            File.WriteAllText("settings.json", JsonConvert.SerializeObject(this));
        }

        public static void load(Settings settings)
        {
            string settingsJson = "";

            try
            {

                settingsJson = File.ReadAllText("settings.json");
                settings = JsonConvert.DeserializeObject<Settings>(settingsJson);
            }
            catch (Exception e)
            {
                settings.save();
                settingsJson = File.ReadAllText("settings.json");
                settings = JsonConvert.DeserializeObject<Settings>(settingsJson);

            }

                foreach (Window window in Application.Current.Windows)
                {
                    if (window.GetType() == typeof(MainWindow))
                    {
                        (window as MainWindow).autoOpenClientSwitch.IsChecked = settings.autoOpenClient;
                        (window as MainWindow).exitAfterFillingSwitch.IsChecked = settings.exitAfterFill;
                        (window as MainWindow).staySignedInSwitch.IsChecked = settings.staySignedIn;
                        (window as MainWindow).hideValorantSwitch.IsChecked = settings.hideAllValorantOptions;
                        (window as MainWindow).passFileLocation.Text = settings.lolAccountFilePath;
                        (window as MainWindow).valorantPassFileLocation.Text = settings.valorantAccountFilePath;
                    if (settings.hideAllValorantOptions == true)
                        {
                            (window as MainWindow).valorantAccountDataOptions.Visibility = Visibility.Collapsed;
                            (window as MainWindow).valorantTab.Visibility = Visibility.Collapsed;
                        }
                        else
                        {
                            (window as MainWindow).valorantAccountDataOptions.Visibility = Visibility.Visible;
                            (window as MainWindow).valorantTab.Visibility = Visibility.Visible;
                        }
                    }
                }

          
        }
    }
}
