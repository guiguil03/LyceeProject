-- ============================================
-- SCRIPT D'ADMINISTRATION ET VISUALISATION
-- LycéeConnect - Base de données RBDE
-- ============================================
-- 
-- UTILISATION :
-- type database\admin_queries.sql | docker exec -i lyceeproject-db psql -U postgres -d lyceeproject

-- Affichage des statistiques générales
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 STATISTIQUES GÉNÉRALES DE LA PLATEFORME'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    '🏫 Lycées' as "Type de données", 
    COUNT(*)::text || ' enregistrements' as "Nombre"
FROM "Lycee"
UNION ALL
SELECT 
    '🎓 Formations', 
    COUNT(*)::text || ' enregistrements'
FROM "Formation"
UNION ALL
SELECT 
    '🏢 Entreprises', 
    COUNT(*)::text || ' enregistrements'
FROM "Entreprise"
UNION ALL
SELECT 
    '📋 Demandes', 
    COUNT(*)::text || ' enregistrements'
FROM "Demande"
UNION ALL
SELECT 
    '👥 Utilisateurs RBDE', 
    COUNT(*)::text || ' enregistrements'
FROM "User" WHERE role = 'rbde'
UNION ALL
SELECT 
    '🌍 Régions', 
    COUNT(*)::text || ' enregistrements'
FROM "Region"
UNION ALL
SELECT 
    '💼 Domaines', 
    COUNT(*)::text || ' enregistrements'
FROM "Domaine";

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🏫 LYCÉES ET LEURS FORMATIONS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    l.nom as "🏫 Lycée",
    COALESCE(r.nom, 'Non définie') as "🌍 Région",
    COUNT(f.id) as "📚 Formations",
    CASE 
        WHEN COUNT(f.id) = 0 THEN '❌ Aucune formation'
        WHEN COUNT(f.id) < 3 THEN '⚠️  Peu de formations'
        ELSE '✅ Bien équipé'
    END as "📊 État"
FROM "Lycee" l
LEFT JOIN "Region" r ON l.region_id = r.id
LEFT JOIN "Formation" f ON l.id = f.lycee_id
GROUP BY l.id, l.nom, r.nom
ORDER BY COUNT(f.id) DESC, l.nom;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📚 FORMATIONS PAR DOMAINE D''ACTIVITÉ'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    d.nom as "💼 Domaine",
    COUNT(f.id) as "📚 Formations",
    COUNT(DISTINCT f.lycee_id) as "🏫 Lycées",
    CASE 
        WHEN COUNT(f.id) = 0 THEN '❌ Aucune'
        WHEN COUNT(f.id) = 1 THEN '⚠️  Limitée'
        WHEN COUNT(f.id) < 5 THEN '✅ Correcte'
        ELSE '🌟 Excellente'
    END as "📊 Couverture"
FROM "Domaine" d
LEFT JOIN "Formation" f ON d.id = f.domaine_id
GROUP BY d.id, d.nom
ORDER BY COUNT(f.id) DESC, d.nom;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📋 DEMANDES D''ENTREPRISES'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    e.nom as "🏢 Entreprise",
    e.siret as "📄 SIRET",
    m.nom as "💼 Métier",
    d.zone_geo as "🌍 Zone",
    CASE d.statut
        WHEN 'en_attente' THEN '⏳ En attente'
        WHEN 'en_cours' THEN '🔄 En cours'
        WHEN 'traitee' THEN '✅ Traitée'
        WHEN 'fermee' THEN '❌ Fermée'
        ELSE d.statut
    END as "📊 Statut",
    TO_CHAR(d.date_creation, 'DD/MM/YYYY') as "📅 Créée le"
FROM "Demande" d
JOIN "Entreprise" e ON d.entreprise_id = e.id
JOIN "Metier" m ON d.metier_id = m.id
ORDER BY d.date_creation DESC;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '👥 ÉQUIPE RBDE'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    u.full_name as "👤 RBDE",
    u.email as "📧 Email",
    COALESCE(l.nom, '❌ Non assigné') as "🏫 Lycée",
    TO_CHAR(u.created_at, 'DD/MM/YYYY') as "📅 Créé le"
FROM "User" u
LEFT JOIN "Lycee" l ON u.lycee_id = l.id
WHERE u.role = 'rbde'
ORDER BY u.full_name;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🎯 SUIVI DES DEMANDES PAR LYCÉE'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    l.nom as "🏫 Lycée",
    e.nom as "🏢 Entreprise",
    m.nom as "💼 Métier",
    CASE dl.statut_traitement
        WHEN 'nouveau' THEN '🆕 Nouveau'
        WHEN 'en_cours' THEN '🔄 En cours'
        WHEN 'accepte' THEN '✅ Accepté'
        WHEN 'refuse' THEN '❌ Refusé'
        ELSE dl.statut_traitement
    END as "📊 Statut",
    COALESCE(LEFT(dl.note, 50) || '...', 'Pas de note') as "📝 Note",
    TO_CHAR(dl.date_affectation, 'DD/MM/YYYY') as "📅 Affecté le"
FROM "DemandeLycee" dl
JOIN "Lycee" l ON dl.lycee_id = l.id
JOIN "Demande" d ON dl.demande_id = d.id
JOIN "Entreprise" e ON d.entreprise_id = e.id
JOIN "Metier" m ON d.metier_id = m.id
ORDER BY dl.date_affectation DESC;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '⚠️  CONTRÔLES DE COHÉRENCE'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- RBDE sans lycée
SELECT 
    '❌ RBDE sans lycée' as "🔍 Problème détecté",
    COUNT(*) as "📊 Nombre"
FROM "User" 
WHERE role = 'rbde' AND lycee_id IS NULL

UNION ALL

-- Formations incomplètes
SELECT 
    '❌ Formations sans métier/domaine',
    COUNT(*)
FROM "Formation" 
WHERE metier_id IS NULL OR domaine_id IS NULL

UNION ALL

-- Demandes non assignées
SELECT 
    '❌ Demandes non assignées',
    COUNT(*)
FROM "Demande" d
LEFT JOIN "DemandeLycee" dl ON d.id = dl.demande_id
WHERE dl.id IS NULL;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📈 PERFORMANCE DES LYCÉES'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    l.nom as "🏫 Lycée",
    COUNT(dl.id) as "📥 Reçues",
    COUNT(CASE WHEN dl.statut_traitement = 'accepte' THEN 1 END) as "✅ Acceptées",
    COUNT(CASE WHEN dl.statut_traitement = 'refuse' THEN 1 END) as "❌ Refusées",
    CASE 
        WHEN COUNT(dl.id) = 0 THEN 'N/A'
        ELSE ROUND(
            COUNT(CASE WHEN dl.statut_traitement = 'accepte' THEN 1 END) * 100.0 / 
            COUNT(dl.id), 1
        )::text || '%'
    END as "📊 Taux acceptation"
FROM "Lycee" l
LEFT JOIN "DemandeLycee" dl ON l.id = dl.lycee_id
GROUP BY l.id, l.nom
ORDER BY COUNT(dl.id) DESC, l.nom;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ ANALYSE TERMINÉE - BASE DE DONNÉES LYCéeCONNECT'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' 