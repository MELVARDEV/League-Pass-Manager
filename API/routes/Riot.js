const router = require("express").Router();
const fetch = require("node-fetch");
const riotApiKey = process.env.riot_api_key;
const Cache = require("../model/leagueApiCache");

function parseRegion(requestRegion) {
  let region = null;

  switch (requestRegion.toUpperCase()) {
    case "BR":
    case "LAN":
    case "LAS":
    case "NA":
    case "OCE":
      region = "americas";
      break;
    case "EUNE":
    case "EUW":
    case "TR":
    case "RU":
      region = "europe";
      break;
    case "JP":
    case "KR":
      region = "asia";
      break;
    default:
      break;
  }
  return region;
}

// parse region but return both region and platform
function parseRegionWithPlatform(requestRegion) {
  let region = parseRegion(requestRegion);
  let platform = null;

  if (!region) {
    return null;
  }



  // parse the platform based on input, basically reverse parseRegion


  switch (requestRegion.toUpperCase()) {
    case "EUW":
      platform = "euw1";
      break;
    case "EUNE":
      platform = "eun1";
      break;
    case "TR":
      platform = "tr1";
      break;
    case "LAN":
      platform = "la1";
      break;
    case "LAS":
      platform = "la2";
      break;
    case "RU":
      platform = "ru";
      break;
    case "JP":
      platform = "jp1";
      break;
    case "KR":
      platform = "kr";
      break;
    case "NA":
      platform = "na1";
      break;
    case "BR":
      platform = "br1";
      break;
    case "OCE":
      platform = "oc1";
      break;
    default:
      break;


  
  }

    // if input is either "americas", "europe", or "asia" then return platform, else return the platform of the region
    if (["americas", "europe", "asia"].includes(region)) {
      return {
        region: region,
        platform: platform
      };
    }

  return {
    region: region,
    platform: platform,
  }
}

router.get("/league/:region/:gameName/:tagLine", async (req, res) => {
  if (!req.params.gameName || !req.params.tagLine) {
    return res.status(400).send("Game name and tag line required");
  }

  if (!req.params.region) {
    return res.status(400).send("Region required");
  }
  
  const region = parseRegion(req.params.region);

  if (!region) {
    return res.status(400).send("Region invalid");
  }

  // The API is caching data to my MongoDB database to lower the amount of requests to Riot Games API which is rate limited.
  try {
    let fetchedCache = await Cache.findOne(
      {
        endPoint: "league",
        region: region,
        gameName: req.params.gameName,
        tagLine: req.params.tagLine,
        timeFetched: {
          $gte: new Date(Date.now() - process.env.CACHE_TIME * 60 * 1000),
        },
      },
      {},
      { sort: { created_at: -1 } }
    );

    if (fetchedCache && fetchedCache.jsonString) {
      console.log(fetchedCache);
      let obj = JSON.parse(fetchedCache.jsonString);

      obj.cached = true;
      delete obj.gameName;
      delete obj.tagLine;
      return res.status(200).send(obj);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Fetching cache failed");
  }

  fetch(
    `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${req.params.gameName}/${req.params.tagLine}?api_key=${riotApiKey}`
  )
    .then((response) => response.json())
    .then((account) => {
      fetch(
        `https://${parseRegionWithPlatform(req.params.region).platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}?api_key=${riotApiKey}`,
      )
        .then((response) => response.json())
        .then((account) => {
          console.log(account)
          fetch(
            `https://${parseRegionWithPlatform(req.params.region).platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${account.id}?api_key=${riotApiKey}`,
          ).then((res) => res.json()).then((league) => {
            console.log(league)
            let obj = league.find((x) => x.queueType == "RANKED_SOLO_5x5");
  
  
            let cache = new Cache({
              jsonString: JSON.stringify({...obj,...account, tagLine: req.params.tagLine, gameName: req.params.gameName}),
              timeFetched: Date.now(),
              endPoint: "league",
              region: region,
              gameName: req.params.gameName,
              tagLine: req.params.tagLine,
            });
  
            cache.save();
  
            return res.status(200).send({...obj, ...account, tagLine: req.params.tagLine, gameName: req.params.gameName});
          })

         
        })
        .catch((err) => {
          console.trace(err);
          let cache = new Cache({
            jsonString: null,
            timeFetched: Date.now(),
            endPoint: "league",
            region: region,
            gameName: req.params.gameName,
            tagLine: req.params.tagLine,
          });

          cache.save();
          return res.status(400).send("error");
        });
    })
    .catch((err) => {
      console.trace(err);
      return res.status(400).send("error");
    });
});



module.exports = router;
