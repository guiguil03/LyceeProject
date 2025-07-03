import express from 'express';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const router = express.Router();

// Charger le fichier swagger.yaml
const swaggerPath = path.join(__dirname, '../../swagger.yaml');
let swaggerDocument: any;

try {
  if (fs.existsSync(swaggerPath)) {
    swaggerDocument = YAML.load(swaggerPath);
  } else {
    console.warn('❌ Fichier swagger.yaml non trouvé à:', swaggerPath);
  }
} catch (error) {
  console.error('❌ Erreur lors du chargement de swagger.yaml:', error);
}

// Configuration Swagger UI
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: '/api/docs/swagger.json',
        name: 'LyceeProject API v1.0.0'
      }
    ]
  }
};

// Route pour servir la documentation Swagger UI
if (swaggerDocument) {
  router.use('/swagger', swaggerUi.serve);
  router.get('/swagger', swaggerUi.setup(swaggerDocument, swaggerOptions));
  
  // Route pour servir le JSON brut
  router.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerDocument);
  });
} else {
  // Route de fallback si swagger.yaml n'est pas trouvé
  router.get('/swagger', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Documentation non disponible',
      message: 'Le fichier swagger.yaml n\'a pas été trouvé. Consultez le README pour générer la documentation.'
    });
  });
}

// Route d'information sur la documentation
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
  
  res.json({
    success: true,
    message: 'Documentation API LyceeProject',
    data: {
      version: '1.0.0',
      swagger_ui: `${baseUrl}/swagger`,
      swagger_json: `${baseUrl}/swagger.json`,
      openapi_version: '3.0.3',
      endpoints: {
        swagger_ui: {
          url: `${baseUrl}/swagger`,
          description: 'Interface interactive Swagger UI'
        },
        raw_json: {
          url: `${baseUrl}/swagger.json`, 
          description: 'Spécification OpenAPI au format JSON'
        }
      },
      external_tools: {
        swagger_editor: 'https://editor.swagger.io/',
        postman_import: `Importez ${baseUrl}/swagger.json dans Postman`,
        curl_examples: `Consultez ${baseUrl}/swagger pour des exemples curl`
      },
      authentication: {
        type: 'Bearer Token (JWT)',
        header: 'Authorization: Bearer <token>',
        login_endpoint: '/api/auth/login'
      }
    }
  });
});

// Route de santé pour la documentation
router.get('/health', (req, res) => {
  const isSwaggerAvailable = !!swaggerDocument;
  
  res.json({
    success: true,
    status: isSwaggerAvailable ? 'OK' : 'WARNING',
    data: {
      swagger_loaded: isSwaggerAvailable,
      swagger_path: swaggerPath,
      timestamp: new Date().toISOString()
    }
  });
});

export default router; 