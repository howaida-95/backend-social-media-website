'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('posts', 'image_url');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'image_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },
};
