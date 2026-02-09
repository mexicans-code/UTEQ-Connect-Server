import { Request, Response } from 'express';
import * as userService from './user.service.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.findAllUsers();
    res.json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await userService.findUserById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }
    res.json({ 
      success: true,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const email = Array.isArray(req.params.email) ? req.params.email[0] : req.params.email;
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }
    res.json({ 
      success: true,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await userService.updateUser(id, req.body);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }
    res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await userService.deleteUser(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }
    res.json({
      success: true,
      message: "Usuario eliminado exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updateUltimoLogin = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await userService.updateUltimoLogin(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }
    res.json({
      success: true,
      message: "Último login actualizado",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const changeStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { estatus } = req.body;
    
    if (!estatus || (estatus !== "activo" && estatus !== "inactivo")) {
      return res.status(400).json({
        success: false,
        error: 'Estatus inválido. Debe ser "activo" o "inactivo"'
      });
    }
    
    const user = await userService.changeUserStatus(id, estatus);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }
    res.json({
      success: true,
      message: "Estatus actualizado exitosamente",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getUsersByRol = async (req: Request, res: Response) => {
  try {
    const rol = Array.isArray(req.params.rol) ? req.params.rol[0] : req.params.rol;
    const users = await userService.findUsersByRol(rol);
    res.json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

export const getActiveUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.findActiveUsers();
    res.json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};