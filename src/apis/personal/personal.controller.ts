import { Request, Response } from 'express';
import * as personalService from './personal.service.js';

export const getPersonal = async (req: Request, res: Response) => {
  try {
    const personal = await personalService.findAllPersonal();
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getPersonalById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const personal = await personalService.findPersonalById(id);
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        error: 'Personal no encontrado' 
      });
    }
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getPersonalByNumeroEmpleado = async (req: Request, res: Response) => {
  try {
    const numeroEmpleado = Array.isArray(req.params.numeroEmpleado) 
      ? req.params.numeroEmpleado[0] 
      : req.params.numeroEmpleado;
    const personal = await personalService.findPersonalByNumeroEmpleado(numeroEmpleado);
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        error: 'Personal no encontrado' 
      });
    }
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getPersonalByEmail = async (req: Request, res: Response) => {
  try {
    const email = Array.isArray(req.params.email) ? req.params.email[0] : req.params.email;
    const personal = await personalService.findPersonalByEmail(email);
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        error: 'Personal no encontrado' 
      });
    }
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getPersonalByUserId = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const personal = await personalService.findPersonalByUserId(userId);
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        error: 'Personal no encontrado' 
      });
    }
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const createPersonal = async (req: Request, res: Response) => {
  try {
    const personal = await personalService.createPersonal(req.body);
    res.status(201).json({
      success: true,
      message: "Personal creado exitosamente",
      data: personal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updatePersonal = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const personal = await personalService.updatePersonal(id, req.body);
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        error: 'Personal no encontrado' 
      });
    }
    res.json({
      success: true,
      message: "Personal actualizado exitosamente",
      data: personal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deletePersonal = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const personal = await personalService.deletePersonal(id);
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        error: 'Personal no encontrado' 
      });
    }
    res.json({
      success: true,
      message: "Personal eliminado exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updateEstatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { estatus } = req.body;
    
    if (!estatus || (estatus !== "dentro" && estatus !== "fuera")) {
      return res.status(400).json({
        success: false,
        error: 'Estatus inválido. Debe ser "dentro" o "fuera"'
      });
    }
    
    const personal = await personalService.updateEstatus(id, estatus);
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        error: 'Personal no encontrado' 
      });
    }
    res.json({
      success: true,
      message: "Estatus actualizado exitosamente",
      data: personal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getPersonalByCargo = async (req: Request, res: Response) => {
  try {
    const cargo = Array.isArray(req.params.cargo) ? req.params.cargo[0] : req.params.cargo;
    const personal = await personalService.findPersonalByCargo(cargo);
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getPersonalByEdificio = async (req: Request, res: Response) => {
  try {
    const edificioId = Array.isArray(req.params.edificioId) 
      ? req.params.edificioId[0] 
      : req.params.edificioId;
    const personal = await personalService.findPersonalByEdificio(edificioId);
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getPersonalDentro = async (req: Request, res: Response) => {
  try {
    const personal = await personalService.findPersonalDentro();
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getPersonalFuera = async (req: Request, res: Response) => {
  try {
    const personal = await personalService.findPersonalFuera();
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const searchPersonal = async (req: Request, res: Response) => {
  try {
    const searchTerm = Array.isArray(req.params.term) ? req.params.term[0] : req.params.term;
    const personal = await personalService.searchPersonal(searchTerm);
    res.json({ 
      success: true,
      data: personal 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};