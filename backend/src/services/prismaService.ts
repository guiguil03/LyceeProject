import { PrismaClient } from '../generated/prisma';

class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ Connexion Prisma établie');
    } catch (error) {
      console.error('❌ Erreur connexion Prisma:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('🔌 Connexion Prisma fermée');
    } catch (error) {
      console.error('❌ Erreur fermeture Prisma:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Health check Prisma échoué:', error);
      return false;
    }
  }
}

export default PrismaService; 