const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ptro", "root", null, {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("=== CONNECTION HAS BEEN ESTABLISHED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default connectDatabase;
