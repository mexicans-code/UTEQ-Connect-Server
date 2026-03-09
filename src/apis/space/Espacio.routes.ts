import { Router } from "express";
import * as espacioController from "./Espacio.controller";

const router = Router();

// GET /api/espacios
router.get("/", espacioController.getEspacios);

// GET /api/espacios/:id
router.get("/:id", espacioController.getEspacioById);

// GET /api/espacios/destino/:destinoId  → todos los espacios de un destino
router.get("/destino/:destinoId", espacioController.getEspaciosByDestino);

// GET /api/espacios/destino/:destinoId/disponibles  → solo los disponibles
router.get("/destino/:destinoId/disponibles", espacioController.getEspaciosDisponiblesByDestino);

// POST /api/espacios
router.post("/", espacioController.createEspacio);

// PUT /api/espacios/:id
router.put("/:id", espacioController.updateEspacio);

// PATCH /api/espacios/:id/ocupado  → toggle ocupado/disponible
router.patch("/:id/ocupado", espacioController.toggleOcupado);

// DELETE /api/espacios/:id
router.delete("/:id", espacioController.deleteEspacio);

export default router;