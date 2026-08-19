import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import arrivalsRouter from "./routes/arrivals.js";
import stopsRouter from "./routes/stops.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "madrid-bus-backend" });
});

app.use("/api/llegadas", arrivalsRouter);
app.use("/api/paradas", stopsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor proxy escuchando en http://localhost:${PORT}`);
});
