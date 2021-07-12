using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace LeaguePassManager
{
    public class LolAccount
    {
        public LolAccount()
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
                }
                else if (!string.IsNullOrEmpty(this.Tier))
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
}
