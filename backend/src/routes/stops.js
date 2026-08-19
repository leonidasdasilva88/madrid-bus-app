import { Router } from "express";
import { getNearbyStops } from "../emtClient.js";

const router = Router();

// GET /api/paradas-cercanas?lat=40.4168&lon=-3.7038&radio=300
router.get("/cercanas", async (req, res) => {
  const { lat, lon, radio } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Faltan parámetros lat/lon" });
  }

  try {
    const data = await getNearbyStops(parseFloat(lat), parseFloat(lon), radio ? parseInt(radio) : undefined);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "No se pudo buscar paradas cercanas", detail: err.message });
  }
});

export default router;
