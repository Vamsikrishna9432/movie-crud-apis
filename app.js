const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
app.use(express.json());

const initializingDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started at port http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializingDBAndServer();

//API 1

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT movie_name
    FROM movie;
    `;
  const myObject = await db.all(getMovieNamesQuery);

  function convertDbObjectToResponseObject(dbObject) {
    return {
      movieName: dbObject.movie_name,
    };
  }

  let my = [];
  myObject.forEach((each) => {
    let value = convertDbObjectToResponseObject(each);
    my.push(value);
  });

  response.send(my);
});

// API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (
        '${directorId}',
        '${movieName}',
        '${leadActor}'
    );`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const singleMovieQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  let movieSingle = await db.get(singleMovieQuery);

  function convertDbObjectToResponseObject(dbObject) {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  }

  let value = convertDbObjectToResponseObject(movieSingle);
  response.send(value);
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie 
    SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = '${movieId}';`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const delteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(delteMovieQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  getDirectorQuery = `
    SELECT director_id, director_name FROM director;`;
  const directorDetails = await db.all(getDirectorQuery);
  function convertCamelCase(result) {
    return {
      directorId: result.director_id,
      directorName: result.director_name,
    };
  }

  let my = [];
  directorDetails.forEach((each) => {
    let value = convertCamelCase(each);
    my.push(value);
  });

  response.send(my);
});

//API 5

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
   SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  let directorMovieDetails = await db.all(getDirectorMovieQuery);
  function convertCamelCase(result) {
    return {
      movieName: result.movie_name,
    };
  }

  let my = [];
  directorMovieDetails.forEach((each) => {
    let value = convertCamelCase(each);
    my.push(value);
  });

  response.send(my);
});

module.exports = app;
