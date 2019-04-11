const dbConfig = require('./../../secrets').databaseConfig


exports.DATABASE_URL = dbConfig.database_Url;
exports.TEST_DATABASE_URL = dbConfig.test_database_Url;
exports.PORT = process.env.PORT || 8080;
