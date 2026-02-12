import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../user/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambialo';

/**
 * Registrar un nuevo usuario
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son obligatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Este correo electrónico ya está registrado'
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const newUser = await User.create({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      rol: 'user',
      estatus: 'activo',
      fechaCreacion: new Date(),
    });

    // Generar token JWT
    const payload = {
      id: newUser._id.toString(),
      _id: newUser._id.toString(),
      email: newUser.email,
      rol: newUser.rol
    };

    const options: SignOptions = {
      expiresIn: '7d'
    };

    const token = jwt.sign(payload, JWT_SECRET, options);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          _id: newUser._id,
          nombre: newUser.nombre,
          email: newUser.email,
          rol: newUser.rol,
          estatus: newUser.estatus
        },
        token
      }
    });

  } catch (error: any) {
    console.error('Error en registro:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Este correo electrónico ya está registrado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario'
    });
  }
};

/**
 * Login de usuario
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (user.estatus !== 'activo') {
      return res.status(403).json({
        success: false,
        error: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    user.ultimoLogin = new Date();
    await user.save();

    // Generar token JWT
    const payload = {
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      rol: user.rol
    };

    const options: SignOptions = {
      expiresIn: '7d'
    };

    const token = jwt.sign(payload, JWT_SECRET, options);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          _id: user._id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          estatus: user.estatus,
          ultimoLogin: user.ultimoLogin
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión'
    });
  }
};