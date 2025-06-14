const ENV: keyof typeof CONFIG = (process.env.TEST_ENV as keyof typeof CONFIG) || 'local';

const CONFIG = {
  local: {
    baseUrl: 'http://localhost:5002',
    dbHost: 'localhost',
    dbPort: 3306,
    dbUser: 'root',
    dbPassword: 'root',
    dbName: 'galactica',
    JWT_SECRET: 'galactica-fly-around-the-world',
    JWT_REFRESH_SECRET: 'galactica-fly-around-the-world-refresh',
  },
  dev: {
    baseUrl: 'https://galactica-dev.up.railway.app',
    dbHost: 'galactica-dev-pocket-pulse-db-dev.j.aivencloud.com',
    dbPort: 26783,
    dbUser: 'avnadmin',
    dbPassword: 'AVNS_ZMR2V_PGIgb1YSJLzAH',
    dbName: 'galactica',
    JWT_SECRET: 'galactica-fly-around-the-world',
    JWT_REFRESH_SECRET: 'galactica-fly-around-the-world-refresh',
  },
  qa: {
    baseUrl: 'https://qa.example.com',
    dbHost: 'localhost',
    dbPort: 3306,
    dbUser: 'root',
    dbPassword: 'password',
    dbName: 'test_db',
    JWT_SECRET: 'galactica-fly-around-the-world',
    JWT_REFRESH_SECRET: 'galactica-fly-around-the-world-refresh',
  },
};

export const config = CONFIG[ENV];
