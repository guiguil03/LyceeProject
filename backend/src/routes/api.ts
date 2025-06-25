import express from 'express';

export const router = express.Router();

// Route d'exemple pour les utilisateurs
router.get('/users', (req, res) => {
  res.json({
    message: 'Liste des utilisateurs',
    users: [
      { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@lycee.fr' },
      { id: 2, nom: 'Martin', prenom: 'Marie', email: 'marie.martin@lycee.fr' }
    ]
  });
});

// Route pour créer un utilisateur
router.post('/users', (req, res) => {
  const { nom, prenom, email } = req.body;
  
  if (!nom || !prenom || !email) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Nom, prénom et email sont requis'
    });
  }

  // Simulation de création d'utilisateur
  const nouvelUtilisateur = {
    id: Date.now(),
    nom,
    prenom,
    email,
    dateCreation: new Date().toISOString()
  };

  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    utilisateur: nouvelUtilisateur
  });
});

// Route d'exemple pour les cours
router.get('/cours', (req, res) => {
  res.json({
    message: 'Liste des cours',
    cours: [
      { id: 1, nom: 'Mathématiques', professeur: 'M. Durand', niveau: 'Terminale' },
      { id: 2, nom: 'Français', professeur: 'Mme. Leroy', niveau: 'Première' },
      { id: 3, nom: 'Histoire-Géographie', professeur: 'M. Petit', niveau: 'Seconde' }
    ]
  });
});

// Route pour les statistiques
router.get('/stats', (req, res) => {
  res.json({
    message: 'Statistiques du lycée',
    statistiques: {
      nombreEleves: 1250,
      nombreProfesseurs: 85,
      nombreClasses: 45,
      tauxReussite: 92.5
    }
  });
}); 