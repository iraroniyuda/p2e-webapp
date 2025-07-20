module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ReferralSettings", {
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      bonusPercentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("ReferralSettings");
  },
};
