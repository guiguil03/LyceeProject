import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import databaseRoutes from './routes/database'; // Nouvelle import
import PrismaService from './services/prismaService'; // Import Prisma

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);
app.use('/api/db', databaseRoutes); // Nouvelles routes BDD

// Route de test
app.get('/health', async (req, res) => {
  try {
    const prismaService = PrismaService.getInstance();
    const isDbHealthy = await prismaService.healthCheck();
    
    res.json({ 
      status: isDbHealthy ? 'OK' : 'DEGRADED', 
      message: 'Backend LyceeProject est en fonctionnement',
      database: isDbHealthy ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Problème de connexion à la base de données',
      timestamp: new Date().toISOString()
    });
  }
});

// Gestionnaire d'erreur global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Fonction de démarrage avec connexion Prisma
async function startServer() {
  try {
    // Connexion à la base de données Prisma
    const prismaService = PrismaService.getInstance();
    await prismaService.connect();
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️ Base de données: Prisma ORM connecté`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  try {
    const prismaService = PrismaService.getInstance();
    await prismaService.disconnect();
    console.log('✅ Connexion Prisma fermée proprement');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
    process.exit(1);
  }
});

// Démarrer le serveur
startServer();