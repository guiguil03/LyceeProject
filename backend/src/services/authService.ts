import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PrismaService from './prismaService';

const prisma = PrismaService.getInstance().getClient();

// Interfaces simplifiées basées sur la table User
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'rbde' | 'entreprise';
  full_name?: string;
  lycee_id?: string;
  created_at: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  role: 'entreprise' | 'rbde';
  full_name?: string;
  lycee_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Générer un token JWT
export const generateToken = (userId: string, role: string): string => {
  return (jwt as any).sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Vérifier un token JWT
export const verifyToken = (token: string): any => {
  return (jwt as any).verify(token, JWT_SECRET);
};

// Hasher un mot de passe
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Vérifier un mot de passe
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Inscription utilisateur (entreprise ou lycée)
export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  try {
    console.log('🔄 Début de l\'inscription utilisateur:', { email: userData.email, role: userData.role });

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Validation du mot de passe
    if (userData.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(userData.password);

    // Créer le nouvel utilisateur
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        role: userData.role.toUpperCase() as any,
        fullName: userData.full_name || null,
        lyceeId: userData.lycee_id || null
      }
    });

    console.log('✅ Utilisateur créé avec succès:', { id: newUser.id, email: newUser.email, role: newUser.role });

    // Générer le token
    const token = generateToken(newUser.id, newUser.role);

    return {
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role.toLowerCase() as any,
          full_name: newUser.fullName || undefined,
          lycee_id: newUser.lyceeId || undefined,
          created_at: newUser.createdAt?.toISOString() || new Date().toISOString()
        },
        token
      }
    };

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'inscription:', error.message);
    throw error;
  }
};

// Connexion utilisateur
export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    console.log('🔄 Tentative de connexion pour:', loginData.email);

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: loginData.email }
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(loginData.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    console.log('✅ Connexion réussie pour:', { id: user.id, email: user.email, role: user.role });

    // Générer le token
    const token = generateToken(user.id, user.role);

    return {
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role.toLowerCase() as any,
          full_name: user.fullName || undefined,
          lycee_id: user.lyceeId || undefined,
          created_at: user.createdAt?.toISOString() || new Date().toISOString()
        },
        token
      }
    };

  } catch (error: any) {
    console.error('❌ Erreur lors de la connexion:', error.message);
    throw error;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role.toLowerCase() as any,
      full_name: user.fullName || undefined,
      lycee_id: user.lyceeId || undefined,
      created_at: user.createdAt?.toISOString() || new Date().toISOString()
    };
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error.message);
    throw error;
  }
};

// Récupérer le profil utilisateur
export const getUserProfile = async (userId: string): Promise<User> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  return user;
}; 