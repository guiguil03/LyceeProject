-- ============================================
-- REQUÊTES UTILES POUR ANALYSER LES DONNÉES
-- LycéeConnect - Plateforme RBDE
-- ============================================

-- ============================================
-- VUES POUR SIMPLIFIER LES REQUÊTES
-- ============================================

-- Vue complète des formations avec toutes les informations
CREATE VIEW vue_formations_completes AS
SELECT 
    f.id as formation_id,
    f.intitule as formation_intitule,
    f.modalite,
    l.nom as lycee_nom,
    l.adresse as lycee_adresse,
    r.nom as region_nom,
    d.nom as domaine_nom,
    m.nom as metier_nom
FROM "Formation" f
LEFT JOIN "Lycee" l ON f.lycee_id = l.id
LEFT JOIN "Region" r ON l.region_id = r.id
LEFT JOIN "Domaine" d ON f.domaine_id = d.id
LEFT JOIN "Metier" m ON f.metier_id = m.id;

-- Vue des demandes avec informations complètes
CREATE VIEW vue_demandes_completes AS
SELECT 
    d.id as demande_id,
    d.zone_geo,
    d.statut as statut_demande,
    d.date_creation,
    e.nom as entreprise_nom,
    e.siret as entreprise_siret,
    e.secteur as entreprise_secteur,
    m.nom as metier_demande,
    dom.nom as domaine_demande
FROM "Demande" d
LEFT JOIN "Entreprise" e ON d.entreprise_id = e.id
LEFT JOIN "Metier" m ON d.metier_id = m.id
LEFT JOIN "Domaine" dom ON m.domaine_id = dom.id;

-- Vue du suivi des demandes par lycée
CREATE VIEW vue_suivi_demandes AS
SELECT 
    dl.id as suivi_id,
    vd.demande_id,
    vd.entreprise_nom,
    vd.metier_demande,
    vd.zone_geo,
    vd.statut_demande,
    l.nom as lycee_assigne,
    dl.statut_traitement,
    dl.note,
    dl.date_affectation,
    u.full_name as rbde_responsable
FROM vue_demandes_completes vd
LEFT JOIN "DemandeLycee" dl ON vd.demande_id = dl.demande_id
LEFT JOIN "Lycee" l ON dl.lycee_id = l.id
LEFT JOIN "User" u ON l.id = u.lycee_id AND u.role = 'rbde';

-- ============================================
-- REQUÊTES D'ANALYSE PRINCIPALES
-- ============================================

-- 1. Liste de tous les lycées avec leurs formations
SELECT 
    'Lycées et leurs formations' as titre;
SELECT 
    l.nom as "Lycée",
    l.adresse as "Adresse",
    r.nom as "Région",
    COUNT(f.id) as "Nombre de formations"
FROM "Lycee" l
LEFT JOIN "Region" r ON l.region_id = r.id
LEFT JOIN "Formation" f ON l.id = f.lycee_id
GROUP BY l.id, l.nom, l.adresse, r.nom
ORDER BY l.nom;

-- 2. Formations par domaine
SELECT 
    'Répartition des formations par domaine' as titre;
SELECT 
    d.nom as "Domaine",
    COUNT(f.id) as "Nombre de formations",
    COUNT(DISTINCT f.lycee_id) as "Nombre de lycées"
FROM "Domaine" d
LEFT JOIN "Formation" f ON d.id = f.domaine_id
GROUP BY d.id, d.nom
ORDER BY COUNT(f.id) DESC;

-- 3. État des demandes en cours
SELECT 
    'État actuel des demandes' as titre;
SELECT 
    statut_demande as "Statut",
    COUNT(*) as "Nombre de demandes"
FROM vue_demandes_completes
GROUP BY statut_demande
ORDER BY COUNT(*) DESC;

-- 4. Demandes par région
SELECT 
    'Demandes par zone géographique' as titre;
SELECT 
    zone_geo as "Zone géographique",
    COUNT(*) as "Nombre de demandes",
    COUNT(CASE WHEN statut_demande = 'traitee' THEN 1 END) as "Demandes traitées"
FROM vue_demandes_completes
GROUP BY zone_geo
ORDER BY COUNT(*) DESC;

-- 5. Performance des lycées (taux de traitement)
SELECT 
    'Performance des lycées' as titre;
SELECT 
    l.nom as "Lycée",
    COUNT(dl.id) as "Demandes reçues",
    COUNT(CASE WHEN dl.statut_traitement = 'accepte' THEN 1 END) as "Demandes acceptées",
    ROUND(
        COUNT(CASE WHEN dl.statut_traitement = 'accepte' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(dl.id), 0), 2
    ) as "Taux d'acceptation (%)"
FROM "Lycee" l
LEFT JOIN "DemandeLycee" dl ON l.id = dl.lycee_id
GROUP BY l.id, l.nom
HAVING COUNT(dl.id) > 0
ORDER BY "Taux d'acceptation (%)" DESC;

-- 6. Activité des RBDE
SELECT 
    'Activité des RBDE' as titre;
SELECT 
    u.full_name as "RBDE",
    l.nom as "Lycée",
    COUNT(a.id) as "Nombre d'actions",
    MAX(a.date_action) as "Dernière action"
FROM "User" u
LEFT JOIN "Lycee" l ON u.lycee_id = l.id
LEFT JOIN "DemandeLycee" dl ON l.id = dl.lycee_id
LEFT JOIN "Action" a ON dl.demande_id = a.demande_id AND a.user_id = u.id
WHERE u.role = 'rbde'
GROUP BY u.id, u.full_name, l.nom
ORDER BY COUNT(a.id) DESC;

-- 7. Métiers les plus demandés
SELECT 
    'Métiers les plus demandés par les entreprises' as titre;
SELECT 
    m.nom as "Métier",
    d.nom as "Domaine",
    COUNT(dem.id) as "Nombre de demandes"
FROM "Metier" m
LEFT JOIN "Domaine" d ON m.domaine_id = d.id
LEFT JOIN "Demande" dem ON m.id = dem.metier_id
GROUP BY m.id, m.nom, d.nom
HAVING COUNT(dem.id) > 0
ORDER BY COUNT(dem.id) DESC;

-- ============================================
-- REQUÊTES DE CONTRÔLE DE COHÉRENCE
-- ============================================

-- Vérification des utilisateurs RBDE sans lycée
SELECT 
    'RBDE sans lycée assigné (problème de cohérence)' as titre;
SELECT 
    email,
    full_name,
    role
FROM "User" 
WHERE role = 'rbde' AND lycee_id IS NULL;

-- Vérification des formations sans métier/domaine
SELECT 
    'Formations incomplètes (sans métier ou domaine)' as titre;
SELECT 
    f.intitule as "Formation",
    l.nom as "Lycée",
    CASE WHEN f.metier_id IS NULL THEN 'Pas de métier' ELSE '' END ||
    CASE WHEN f.domaine_id IS NULL THEN ' Pas de domaine' ELSE '' END as "Problème"
FROM "Formation" f
LEFT JOIN "Lycee" l ON f.lycee_id = l.id
WHERE f.metier_id IS NULL OR f.domaine_id IS NULL;

-- Demandes sans attribution à un lycée
SELECT 
    'Demandes non assignées à un lycée' as titre;
SELECT 
    d.id as "ID Demande",
    e.nom as "Entreprise",
    m.nom as "Métier demandé",
    d.zone_geo as "Zone",
    d.date_creation as "Date de création"
FROM "Demande" d
LEFT JOIN "Entreprise" e ON d.entreprise_id = e.id
LEFT JOIN "Metier" m ON d.metier_id = m.id
LEFT JOIN "DemandeLycee" dl ON d.id = dl.demande_id
WHERE dl.id IS NULL;

-- ============================================
-- STATISTIQUES GÉNÉRALES
-- ============================================

SELECT 
    'Statistiques générales de la plateforme' as titre;
SELECT 
    'Lycées' as "Type",
    COUNT(*) as "Nombre"
FROM "Lycee"
UNION ALL
SELECT 
    'Formations',
    COUNT(*)
FROM "Formation"
UNION ALL
SELECT 
    'Entreprises',
    COUNT(*)
FROM "Entreprise"
UNION ALL
SELECT 
    'Demandes totales',
    COUNT(*)
FROM "Demande"
UNION ALL
SELECT 
    'Utilisateurs RBDE',
    COUNT(*)
FROM "User" WHERE role = 'rbde'
UNION ALL
SELECT 
    'Domaines d''activité',
    COUNT(*)
FROM "Domaine"
UNION ALL
SELECT 
    'Métiers référencés',
    COUNT(*)
FROM "Metier";

-- Fin des requêtes utiles 