import { Router } from "express";
import * as espacioController from "./Espacio.controller.js";

const router = Router();

// GET /api/espacios
router.get("/", espacioController.getEspacios);

// GET /api/espacios/:id
router.get("/:id", espacioController.getEspacioById);

// GET /api/espacios/destino/:destinoId
router.get("/destino/:destinoId", espacioController.getEspaciosByDestino);

// GET /api/espacios/destino/:destinoId/disponibles
router.get("/destino/:destinoId/disponibles", espacioController.getEspaciosDisponiblesByDestino);


// POST /api/espacios
router.post("/", espacioController.createEspacio);

// PUT /api/espacios/:id
router.put("/:id", espacioController.updateEspacio);

// PATCH /api/espacios/:id/ocupado
router.patch("/:id/ocupado", espacioController.toggleOcupado);

// DELETE /api/espacios/:id
router.delete("/:id", espacioController.deleteEspacio);

export default router;