import express from "express";
import routes from "./routes";
import cors from "cors";

// Creating express app
const app = express();

// Adding some useful plugins to app
app.use(cors());
app.use(express.json());
app.use(routes);

// Listen to port 3333
// TODO change to env variable
app.listen(3333);
