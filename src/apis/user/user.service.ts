import User from './user.model.js';

export const findAllUsers = async () => {
  try {
    const users = await User.find().select('-passwordHash');
    return users;
  } catch (error) {
    throw new Error('Error obteniendo usuarios');
  }
};

export const findUserById = async (id: string) => {
  try {
    const user = await User.findById(id).select('-passwordHash');
    return user;
  } catch (error) {
    throw new Error('Error obteniendo usuario');
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new Error('Error obteniendo usuario por email');
  }
};

export const createUser = async (userData: any) => {
  try {
    const user = new User(userData);
    await user.save();
    // Retornar usuario sin el password
    const userObj = user.toObject();
    const { passwordHash, ...userWithoutPassword } = userObj;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id: string, userData: any) => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      userData,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    return user;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const user = await User.findByIdAndDelete(id).select('-passwordHash');
    return user;
  } catch (error) {
    throw new Error('Error eliminando usuario');
  }
};

export const updateUltimoLogin = async (id: string) => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { ultimoLogin: new Date() },
      { new: true }
    ).select('-passwordHash');
    return user;
  } catch (error) {
    throw new Error('Error actualizando último login');
  }
};

export const changeUserStatus = async (id: string, estatus: "activo" | "inactivo") => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { estatus },
      { new: true }
    ).select('-passwordHash');
    return user;
  } catch (error) {
    throw new Error('Error cambiando estatus de usuario');
  }
};

export const findUsersByRol = async (rol: string) => {
  try {
    const users = await User.find({ rol }).select('-passwordHash');
    return users;
  } catch (error) {
    throw new Error('Error obteniendo usuarios por rol');
  }
};

export const findActiveUsers = async () => {
  try {
    const users = await User.find({ estatus: "activo" }).select('-passwordHash');
    return users;
  } catch (error) {
    throw new Error('Error obteniendo usuarios activos');
  }
};