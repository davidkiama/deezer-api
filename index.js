import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "30mb", extended: true }));

app.get("/", (req, res) => {
  res.send("APP IS RUNNING");
});

// Display a list artists
app.get("/artists", async (req, res) => {
  try {
    // Generate 6 random numbers that I will use as IDs
    const generatedIds = new Set();
    while (generatedIds.size !== 6) {
      //I used 40 below to get random randoms from 1-40 . This can be changed
      generatedIds.add(Math.floor(Math.random() * 40) + 1);
    }

    const arrayOfIdS = Array.from(generatedIds);

    const artists = await Promise.all(
      arrayOfIdS.map(async (id) => {
        const response = await fetch(`https://api.deezer.com/artist/${id}`);
        return await response.json();
      })
    );

    return res.status(200).json({ data: artists });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: error });
  }
});

// Get one artist
app.get("/artist/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const dataToRequest = ["albums", "top"];

    const artistData = await Promise.all(
      dataToRequest.map(async (param) => {
        const response = await fetch(`https://api.deezer.com/artist/${id}/${param}`);
        const { data } = await response.json();

        return { [param]: data };
      })
    );

    const response = await fetch(`https://api.deezer.com/artist/${id}`);
    const info = await response.json();

    const [albums, top] = artistData;

    return res.status(200).json({ albums, top, info, id });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: error });
  }
});

app.post("/search", async (req, res) => {
  const { artistName } = req.body;

  try {
    const response = await fetch(`https://api.deezer.com/search/artist?q=${artistName}`);

    const result = await response.json();

    return res.status(200).json({ data: result });
  } catch (error) {
    console.log(error);

    return res.status(404).json({ message: "Something went wrong." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running on Port:${PORT}`));
