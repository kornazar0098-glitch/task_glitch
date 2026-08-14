const { sequelize } = require('../models');

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized with database');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    process.exit(1);
  }
};

module.exports = syncDatabase;
