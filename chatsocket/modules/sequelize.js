const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:Vk7568020344$@@127.0.0.1:5432/Users')

module.exports = sequelize