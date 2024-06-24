const { DataTypes } = require("sequelize");
const sequelize = require("@configs/dbConfig");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    phoneNumber: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ind_baja: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false,
    },
  },
  {
    hooks: {
      // Antes de guardar un usuario se comprueba si tiene pass y si la tiene la encripta.
      beforeSave: async (user) => {
        if (user.changed("password")) {
          // Genera una cadena aleatoria que se utiliza para alterar el proceso de cifrado
          // Evita ataques de fuerza bruta dos contraseñas idénticas darán hashes diferentes
          const salt = await bcrypt.genSalt(10);
          // Ciframos la contraseña
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    timestamps: false,
  }
);

module.exports = User;
