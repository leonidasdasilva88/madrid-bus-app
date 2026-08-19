import { Router } from "express";
import { getArrivals } from "../emtClient.js";

const router = Router();

// GET /api/llegadas/:stopId
router.get("/:stopId", async (req, res) => {
  const { stopId } = req.params;

  try {
    const data = await getArrivals(stopId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "No se pudo obtener información de llegadas", detail: err.message });
  }
});

export default router;
