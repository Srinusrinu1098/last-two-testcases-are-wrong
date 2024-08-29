const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const dbToServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db Error : ${e.message}`);
    process.exit(1);
  }
};
dbToServer();

//get all players

app.get("/players/", async (request, response) => {
  const getAllPlayersList = `
    SELECT player_id as playerId,player_name as playerName FROM player_details;`;
  const dbResponse = await db.all(getAllPlayersList);
  response.send(dbResponse);
});

//get a specific player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayersList = `
    SELECT player_id as playerId,player_name as playerName FROM player_details WHERE player_id =${playerId};`;
  const dbResponse = await db.get(getAllPlayersList);
  response.send(dbResponse);
});

// update

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const dbDetails = request.body;
  const { playerName } = dbDetails;
  const updateSql = `
  UPDATE player_details SET player_name = '${playerName}';`;
  const dbResponse = await db.run(updateSql);
  response.send("Player Details Updated");
});

//get match details

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getOneMatchList = `
    SELECT match_id as matchId,match,year FROM match_details WHERE match_id =${matchId};`;
  const dbResponse = await db.get(getOneMatchList);
  response.send(dbResponse);
});

//get all matches of a player

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayersList = `
    SELECT match_id as matchId,match,year FROM match_details NATURAL JOIN player_match_score WHERE player_id =${playerId};`;
  const dbResponse = await db.all(getAllPlayersList);
  response.send(dbResponse);
});

//get a list of players of the match

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getAllMatchesList = `
    SELECT player_id as playerId ,player_name as playerName FROM match_details NATURAL JOIN player_details WHERE match_id =${matchId};`;
  const dbResponse = await db.all(getAllMatchesList);
  response.send(dbResponse);
});

//get total scores
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayersList = `
    SELECT player_id as playerId, player_name as playerName,SUM(score) as totalScores,SUM(fours) as totalFours,SUM(sixes) as totalSixes FROM player_details NATURAL JOIN player_match_score WHERE player_id =${playerId};`;
  const dbResponse = await db.get(getAllPlayersList);
  response.send(dbResponse);
});

module.exports = app;
