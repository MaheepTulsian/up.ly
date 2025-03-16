import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectdb from "./database/connect.js";

const app = express();
dotenv.config();
const Port = 8000;

//cors middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//connect to database
connectdb();

//regular express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie parser middleware
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(Port, () => {
  console.log(`⚙️Server is running on http://localhost:${Port}`);
});