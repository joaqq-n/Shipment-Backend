module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Contacto",
      [
        {
          id_proveedor_cliente: 1,
          nombre: "Jose Eduardo",
          cargo: "CEO",
          telefono: 123124512,
          email: "contact@contact.cl",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Contacto", null, {});
  },
};
