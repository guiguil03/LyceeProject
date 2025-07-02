import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'lyceeproject',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20, // Nombre maximum de connexions dans le pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test de connexion au démarrage
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('✅ Connexion à la base de données PostgreSQL établie');
      
      // Test simple
      const result = await client.query('SELECT NOW() as current_time');
      console.log('🕐 Heure serveur DB:', result.rows[0].current_time);
      
      client.release();
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error);
      throw error;
    }
  }

  /**
   * Exécute une requête SQL avec paramètres
   */
  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 SQL Query:', {
          sql: text,
          params,
          duration: `${duration}ms`,
          rows: result.rowCount
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur SQL:', {
        sql: text,
        params,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Exécute une transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtient un client pour des opérations multiples
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Ferme toutes les connexions
   */
  async close(): Promise<void> {
    await this.pool.end();
    console.log('🔌 Connexions base de données fermées');
  }

  /**
   * Utilitaires pour construire des requêtes dynamiques
   */
  buildWhereClause(conditions: Record<string, any>): { where: string; params: any[] } {
    const params: any[] = [];
    const clauses: string[] = [];
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.push(value);
        clauses.push(`"${key}" = $${params.length}`);
      }
    });
    
    return {
      where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params
    };
  }

  /**
   * Pagination helper
   */
  buildPaginationClause(page?: number, limit?: number): { clause: string; offset: number } {
    const pageSize = Math.min(limit || 20, 100); // Maximum 100 résultats
    const currentPage = Math.max(page || 1, 1);
    const offset = (currentPage - 1) * pageSize;
    
    return {
      clause: `LIMIT ${pageSize} OFFSET ${offset}`,
      offset
    };
  }

  /**
   * Helper pour gérer les UUID générés
   */
  async insertAndReturnId(table: string, data: Record<string, any>): Promise<string> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.map(key => `"${key}"`).join(', ');
    
    const sql = `
      INSERT INTO "${table}" (${columns}) 
      VALUES (${placeholders}) 
      RETURNING id
    `;
    
    const result = await this.query(sql, values);
    return result.rows[0].id;
  }

  /**
   * Helper pour les mises à jour avec updated_at automatique
   */
  async updateById(table: string, id: string, data: Record<string, any>): Promise<boolean> {
    const keys = Object.keys(data);
    if (keys.length === 0) return false;
    
    const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(data)];
    
    const sql = `
      UPDATE "${table}" 
      SET ${setClause}, "updated_at" = CURRENT_TIMESTAMP 
      WHERE "id" = $1 
      RETURNING id
    `;
    
    const result = await this.query(sql, values);
    return result.rowCount > 0;
  }

  /**
   * Helper pour recherche full-text
   */
  buildSearchClause(searchTerm: string, columns: string[]): { clause: string; param: string } {
    if (!searchTerm) return { clause: '', param: '' };
    
    const searchParam = `%${searchTerm.toLowerCase()}%`;
    const searchClauses = columns.map(col => `LOWER("${col}") LIKE $`).join(' OR ');
    
    return {
      clause: `AND (${searchClauses})`,
      param: searchParam
    };
  }
}

// Instance singleton
const db = new DatabaseService();

// Nettoyage lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  console.log('🛑 Arrêt de l\'application...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Arrêt de l\'application...');
  await db.close();
  process.exit(0);
});

export default db;
