require('dotenv').config();
const express = require('express');
const app = express();
const cTable = require('console.table');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const db = require('./db/connection');

const port = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let connection;

// Connect to database
async function connect() {
    connection = await mysql.createConnection({
        host: 'localhost',
        // MySQL Username
        user: 'root',
        //Mysql Password
        password: process.env.password,
        database: 'HumanResources'
    });
    console.log(`Connected to the HumanResources database.`)
};

// View all Departments
const viewAllDepartments = async () => {
    try {
        const results = await connection.query('SELECT d.id AS "Dept. ID", d.name AS "Dept. Name" FROM Department d');
        console.log('\n', '\x1b[36m', '---------Department List---------', '\x1b[0m', '\n');
        console.table(results[0]);
        console.log('\n', '\x1b[32m', '---------------End Departments-----------', '\x1b[0m', '\n');
    }
    catch (err) {
        console.log(`ERROR - ${err}`);
    }
    menuMain(); // Return to main menu
    };

    //View all Roles
    const viewAllRoles = async () => {
        const query = `SELECT d.name AS "Department", r.title AS "Roles", r.id AS "Roles ID#", r.salary AS "Salary" FROM Roles r JOIN department d ON r.department_id = d.id;`
        try {
            const results = await connection.query(query);
            console.log('\n', '\x1b[36m', '---------Roles List---------', '\x1b[0m', '\n');
            console.table(results[0]);
            console.log('\n', '\x1b[32m', '---------------End Roles-----------', '\x1b[0m', '\n');
        } catch (err) {
            console.log(`ERROR - ${err}`);
        };
        menuMain();
    };
    