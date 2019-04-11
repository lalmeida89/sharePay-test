'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/passport';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/passport';
exports.PORT = process.env.PORT || 8080;
