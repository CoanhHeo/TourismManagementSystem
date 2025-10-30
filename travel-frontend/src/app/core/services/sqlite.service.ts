import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface Tour {
  tourID: number;
  tourName: string;
  description?: string;
  price?: number;
  touristDestination?: string;
  tourTypeID?: number;
  promotionID?: number;
  cached_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private dbName = 'tourdb';
  private isDbReady = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Initialize database
   */
  async initializeDatabase(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      console.warn('SQLite not supported on web, using fallback');
      return;
    }

    try {
      // Create or open database
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false, // encrypted
        'no-encryption',
        1, // version
        false // readonly
      );

      await this.db.open();

      // Create tours table
      await this.createTables();

      this.isDbReady = true;
      console.log('✅ SQLite database initialized');
    } catch (error) {
      console.error('❌ Error initializing SQLite:', error);
      throw error;
    }
  }

  /**
   * Create tables
   */
  private async createTables(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS tours (
        tourID INTEGER PRIMARY KEY,
        tourName TEXT NOT NULL,
        description TEXT,
        price REAL,
        touristDestination TEXT,
        tourTypeID INTEGER,
        promotionID INTEGER,
        cached_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tour_name ON tours(tourName);
      CREATE INDEX IF NOT EXISTS idx_cached_at ON tours(cached_at);
    `;

    await this.db.execute(createTableSQL);
    console.log('✅ Tables created');
  }

  /**
   * Save tours to SQLite (cache from API)
   */
  async cacheTours(tours: Tour[]): Promise<void> {
    if (!this.isDbReady) {
      await this.initializeDatabase();
    }

    try {
      // Clear old data
      await this.db.execute('DELETE FROM tours');

      // Insert new data
      for (const tour of tours) {
        const sql = `
          INSERT INTO tours (tourID, tourName, description, price, touristDestination, tourTypeID, promotionID)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.db.run(sql, [
          tour.tourID,
          tour.tourName,
          tour.description || null,
          tour.price || null,
          tour.touristDestination || null,
          tour.tourTypeID || null,
          tour.promotionID || null
        ]);
      }

      console.log(`✅ Cached ${tours.length} tours to SQLite`);
    } catch (error) {
      console.error('❌ Error caching tours:', error);
      throw error;
    }
  }

  /**
   * Get all cached tours
   */
  async getCachedTours(): Promise<Tour[]> {
    if (!this.isDbReady) {
      await this.initializeDatabase();
    }

    try {
      const result = await this.db.query('SELECT * FROM tours ORDER BY tourName');
      
      if (result.values && result.values.length > 0) {
        console.log(`✅ Retrieved ${result.values.length} cached tours`);
        return result.values as Tour[];
      }

      return [];
    } catch (error) {
      console.error('❌ Error getting cached tours:', error);
      return [];
    }
  }

  /**
   * Get tour by ID
   */
  async getCachedTourById(tourID: number): Promise<Tour | null> {
    if (!this.isDbReady) {
      await this.initializeDatabase();
    }

    try {
      const result = await this.db.query(
        'SELECT * FROM tours WHERE tourID = ? LIMIT 1',
        [tourID]
      );

      if (result.values && result.values.length > 0) {
        return result.values[0] as Tour;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting tour by ID:', error);
      return null;
    }
  }

  /**
   * Search tours by name or destination
   */
  async searchCachedTours(keyword: string): Promise<Tour[]> {
    if (!this.isDbReady) {
      await this.initializeDatabase();
    }

    try {
      const result = await this.db.query(
        `SELECT * FROM tours 
         WHERE tourName LIKE ? OR touristDestination LIKE ?
         ORDER BY tourName`,
        [`%${keyword}%`, `%${keyword}%`]
      );

      return result.values || [];
    } catch (error) {
      console.error('❌ Error searching tours:', error);
      return [];
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    if (!this.isDbReady) {
      await this.initializeDatabase();
    }

    try {
      await this.db.execute('DELETE FROM tours');
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Get cache info
   */
  async getCacheInfo(): Promise<{ count: number; lastUpdate: string | null }> {
    if (!this.isDbReady) {
      await this.initializeDatabase();
    }

    try {
      const countResult = await this.db.query('SELECT COUNT(*) as count FROM tours');
      const dateResult = await this.db.query('SELECT MAX(cached_at) as lastUpdate FROM tours');

      return {
        count: countResult.values?.[0]?.count || 0,
        lastUpdate: dateResult.values?.[0]?.lastUpdate || null
      };
    } catch (error) {
      console.error('❌ Error getting cache info:', error);
      return { count: 0, lastUpdate: null };
    }
  }

  /**
   * Close database connection
   */
  async closeConnection(): Promise<void> {
    if (this.db) {
      await this.db.close();
      await this.sqlite.closeConnection(this.dbName, false);
      this.isDbReady = false;
      console.log('✅ Database connection closed');
    }
  }
}
