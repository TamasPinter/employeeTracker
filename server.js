require('dotenv').config();
const express = require('express');
const app = express();
const cTable = require('console.table');
const mysql = require('mysql2');
const inquirer = require('inquirer');


const port = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let connection;

// Connect to database
async function connect() {
    connection = mysql.createConnection({
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
        const results = connection.query('SELECT d.id AS "Dept. ID", d.name AS "Dept. Name" FROM Department d');
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

const viewAllEmployees = async () => {
    const query = `SELECT em.id AS "Employee Id#", em.first_name AS "First Name", em.last_name AS "Last Name", r.title AS "Title", d.name AS "Department", r.salary AS "Salary", CONCAT(IFNULL(mgr.first_name, ''), ' ', IFNULL(mgr.last_name, '')) AS "Manager"
    FROM Employee em
    LEFT JOIN Roles r
    ON em.roles_id = r.id
    LEFT JOIN Department d
    ON d.id = r.department_id
    LEFT JOIN Employee mgr
    ON mgr.id = em.manager_id;`
    try {
        const results = await connection.query(query);
        console.log('\n', '\x1b[36m', '---------Employee List---------', '\x1b[0m', '\n');
        console.table(results[0]);
        console.log('\n', '\x1b[32m', '---------------End Employees-----------', '\x1b[0m', '\n');
    } catch (err) {
        console.log(`ERROR - ${err}`);
    };
    menuMain();
};

const addDepartment = async () => {
    let deptExists;
    let deptArray = [];
    //retriever departments
    try {
        deptExists = await connection.query('SELECT name FROM Department');
        //validate if department exists
        deptExists[0].forEach((names) => {
            deptArray.push(names.name);
        });
    } catch(err) {
        console.log(`ERROR - ${err}`);
    };
    console.log('\n', '\x1b[36m', '---------Existing Departments---------', '\x1b[0m', '\n');
    depArray.forEach((department) => {
        console.log(department);
    })
    console.log('\n', '\x1b[32m', '---------------End Departments-----------', '\x1b[0m', '\n');
    //prompt user for new department
    resp = await inquirer.prompt(
        [
            {
                name: 'newDept',
                type: 'input',
                message: 'Enter new Department name: ',
                validate(value) {
                    const test = deptArray.includes(value);
                    if (test) {
                        return 'Department already exists.'
                    } else {
                        return true;
                    }
                }
            },
        ]
    );
    //update department list
    try {
        const result = await connection.query('INSERT INTO Department SET ?',
        {
            name: resp.newDept,
        });
        console.log(`\n\x1b[32mDepartment ${resp.newDept} added.\x1b[0m\n`);
    } catch (err) {
        console.log(`ERROR - ${err}`);
    };
    menuMain();
};

const addRoles = async () => {
    let deptList;
    let deptExist;
    try {
        deptExist = await connection.query('Select id, name FROM Department');
        deptList = deptExist[0].map(({ id, name }) => ({ value: id, name: `${id} ${name} `}));
    } catch(err) {
        console.log(`ERROR - ${err}`);
    }
    let resp = await inquirer.prompt(
        [
            {
                name: "roleTitle",
                type: "input",
                message: "Enter the name of the new role: "
            }, 
            {
                name: "roleSalary",
                type: "input",
                message: "What is the salary?"
            },
            {
                name: "selectedDept",
                type: "list",
                message: "Which department does this role belong to?",
                choices: deptList
            }
        ]
    );
    //update roles
    try {
        const result = await connection.query(`INSERT INTO Roles SET ?`, {
            title: resp.rolesTitle,
            salary: resp.roleSalary,
            department_id: resp.selectedDept
        });
    } catch(err) {
        console.log(`ERROR - ${err}`);
    };
    console.log(`n, \x1b[32m, Role ${resp.roleTitle} added to ${resp.selectedDept}.\x1b[0m, \n`);
    menuMain();
};

const addEmployee = async () => {
    let managers;
    let mgrList;
    let empRoles;
    let roleChoices;
    try {
        //get supervisors
        managers = await connection.query('SELECT e.id, e.first_name, e.last_name FROM Employee e WHERE roles_id = 1')
    mgrList = managers[0].map(({ id, first_name, last_name }) => ({ value: id, name: `${first_name} ${last_name}`}));
    } catch(err) {
        console.log(`ERROR - ${err}`);
    }
    //get roles
    try {
    empRoles = await connection.query(`SELECT id, title FROM Roles WHERE title <> 'Supervisor'`);
    roleChoices = empRoles[0].map(({ id, title }) => ({
        value: id, name: `${title}`
    }));
} catch(err) {
    console.log(`ERROR - ${err}`);
}
const resp = await inquirer.prompt([
    {
        name: "first_name",
        type: "input",
        message: "Enter employee's first name: "
    },
    {
        name: "last_name",
        type: "input",
        message: "Enter employee's last name: "
    },
    {
        name: "roles",
        type: "list",
        message: "Choose their role:",
        choices: roleChoices
    },
    {
        name: "manager",
        type: "list",
        message: "Chose their manager:",
        choices: mgrList
    }
]);
//update employee list
try {
    const result = await connection.query(`INSERT INTO Employee SET ?`, {
        first_name: resp.first_name,
        last_name: resp.last_name,
        roles_id: resp.roles,
        manager_id: resp.manager
    });
} catch(err) {
    console.log(`ERROR - ${err}`);
};
menuMain();
};

const updateEmployeeRole = async () => {
    let employees;
    let empChoices;
    let empRoles;
    let roleChoices;
    //get all employees
    try {
        employees = await connection.query('SELECT e.id, e.first_name, e.last_name, e.roles_id, e.manager_id FROM Employee e');
        empChoices = employees[0].map(({ id, first_name, last_name }) => ({ value: id, name: `${first_name} ${last_name} `})); 
    } catch(err) {
        console.log(`ERROR - ${err}`);
    }
    //get all roles
    try {
        empRoles = await connection.query(`SELECT id, title FROM Roles`);
        roleChoices = empRoles[0].map(({ id, title}) => ({
            value: id, name: `${title}`
        }));
    } catch(err) {
        console.log(`ERROR - ${err}`);
    };
const resp = await inquirer.prompt([
    {
        name: "employee",
        type: "list",
        message: "Choose employee name: ",
        choices: empChoices
    },
    {
        name: "roles",
        type: "list",
        message: "Choose their new role:",
        choices: roleChoices
    }
]);

//update employee list
try {
    const result = connection.query(`UPDATE Employee SET roles_id = ? WHERE id = ?`,
    [
        resp.roles,
        resp.employee
    ]);
    console.log(`\n\x1b[32mEmployee role updated.\x1b[0m\n`);
} catch(err) {
    console.log(`ERROR - ${err}`);
};
};

const menuMain = async () => {
    const mainMenu = [
        {
            name: "menuchoices",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View All Departments",
                "View All Employees",
                "View All Roles",
                "Add a Department",
                "Add a Role",
                "Add an Employee",
                "Update Employee Role",
                new inquirer.Separator(),
                "Quit",
                new inquirer.Separator(),
            ]
        }
    ];
    const resp = await inquirer.prompt(mainMenu);
    switch (resp.menuchoices) {
        case 'View All Departments':
            viewAllDepartments();
            break;
        case 'View All Employees':
            viewAllEmployees();
            break;
        case 'View All Roles':
            viewAllRoles();
            break;
        case 'Add a Department':
            addDepartment();
            break;
        case "Add a Role":
            addRoles();
            break;
        case "Add an Employee":
            addEmployee();
            break;
        case "Update Employee Role":
            updateEmployeeRole();
            break;
        case "Quit":
            quitApp();
    }
};

const quitApp = () => {
    console.log(`\n\x1b[32mGoodbye!\x1b[0m\n`);
    process.exit();
};

const initApp = async () => {
    await connect();
    menuMain();
};

initApp();