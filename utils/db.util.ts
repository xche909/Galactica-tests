import mysql, { Pool } from 'mysql2/promise';
import { config } from '../config/config';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async query(sql: string, params?: any[]): Promise<any> {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = new Database();
