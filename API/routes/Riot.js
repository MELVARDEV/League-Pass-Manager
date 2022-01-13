const router = require("express").Router();
const fetch = require("node-fetch");
const riotApiKey = process.env.riot_api_key;
const Cache = require("../model/leagueApiCache");

function parseRegion(requestRegion) {
  let region = null;

  switch (requestRegion.toUpperCase()) {
    case "BR":
      region = "BR1";
      break;
    case "EUNE":
      region = "EUN1";
      break;
    case "EUW":
      region = "EUW1";
      break;
    case "LAN":
      region = "LA1";
      break;
    case "LAS":
      region = "LA2";
      break;
    case "NA":
      region = "NA1";
      break;
    case "OCE":
      region = "OC1";
      break;
    case "RU":
      region = "RU1";
      break;
    case "TR":
      region = "TR1";
      break;
    case "JP":
      region = "JP1";
      break;
    case "KR":
      region = "KR";
      break;
    case "PBE":
      region = "PBE";
      break;
    default:
      break;
  }
  return region;
}

router.get("/league/:region/:name", async (req, res) => {
  if (!req.params.name) {
    return res.status(400).send("Name required");
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
        name: req.params.name,
        timeFetched: {
          $gte: new Date(Date.now() - process.env.CACHE_TIME * 60 * 1000),
        },
      },
      {},
      { sort: { created_at: -1 } }
    );

    if (fetchedCache) {
      let obj = JSON.parse(fetchedCache.jsonString);

      obj.cached = true;
      delete obj.summonerName;

      return res.status(200).send(obj);
    }
  } catch (error) {
    return res.status(400).send("Fetching cache failed");
  }

  fetch(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${req.params.name}?api_key=${riotApiKey}`
  )
    .then((response) => response.json())
    .then((summoner) => {
      fetch(
        `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
        {
          method: "GET",
          headers: { "X-Riot-Token": riotApiKey },
        }
      )
        .then((response) => response.json())
        .then((league) => {
          let obj = league.find((x) => x.queueType == "RANKED_SOLO_5x5");

          console.log(region, req.params.name, summoner, league);

          let cache = new Cache({
            jsonString: JSON.stringify(obj),
            timeFetched: Date.now(),
            endPoint: "league",
            region: region,
            name: req.params.name,
          });

          cache.save();
          delete obj.summonerName;
          obj.cached = false;

          return res.status(200).send(obj);
        })
        .catch((err) => {
          console.trace(err);
          let cache = new Cache({
            jsonString: null,
            timeFetched: Date.now(),
            endPoint: "league",
            region: region,
            name: req.params.name,
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

router.get("/summoner/:region/:name", async (req, res) => {
  if (!req.params.name) {
    return res.status(400).send("Name required");
  }

  if (!req.params.region) {
    return res.status(400).send("Region required");
  }

  const region = parseRegion(req.params.region);

  if (!region) {
    return res.status(400).send("Region invalid");
  }

  try {
    let fetchedCache = await Cache.findOne(
      {
        endPoint: "summoner",
        region: region,
        name: req.params.name,
        timeFetched: {
          $gte: new Date(Date.now() - process.env.CACHE_TIME * 60 * 1000),
        },
      },
      {},
      { sort: { created_at: -1 } }
    );

    if (fetchedCache) {
      let obj = JSON.parse(fetchedCache.jsonString);

      obj.cached = true;

      return res.status(200).send(obj);
    }
  } catch (error) {
    return res.status(400).send("Fetching cache failed");
  }

  fetch(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${req.params.name}?api_key=${riotApiKey}`
  )
    .then((response) => response.json())
    .then((summoner) => {
      console.log(summoner);
      if (!summoner.accountId) {
        throw new Error("Not found");
      }

      let cache = new Cache({
        jsonString: JSON.stringify(summoner),
        timeFetched: Date.now(),
        endPoint: "summoner",
        region: region,
        name: req.params.name,
      });

      cache.save();

      summoner.cached = false;
      res.status(200).send(summoner);
    })
    .catch((err) => {
      console.trace(err);
      let cache = new Cache({
        jsonString: null,
        timeFetched: Date.now(),
        endPoint: "summoner",
        region: region,
        name: req.params.name,
      });

      cache.save();

      return res.status(400).send("error");
    });
});

module.exports = router;
