
const cTable = require('console.table');
const mysql = require('mysql2');
const inquirer = require('inquirer');
require('dotenv').config();

const port = process.env.PORT || 3000;


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.password,
    database: 'HumanResources'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected as id ' + connection.threadId);
    menuMain();
});

const menuMain = () => {
    inquirer.prompt (
        [
            {
                type: 'list',
                name: 'choices',
                message: 'What would you like to do?',
                choices: ['View All Departments',
                          'View All Roles',
                          'View all Employees',
                          'Add a Department',
                          'Add a Role',
                          'Add an Employee',
                          'Update an Employee Role',
                          'Update an Employee Manager',
                          'View Employees by Department',
                          'Delete a Department',
                          'Delete a Role',
                          'Delete an Employee',
                          'View Budget by Department',
                          'Exit']
            }
        ]
    )
    .then((answers) => {
        const { choices } = answers;
        if (choices === "View All Departments") {
            viewDepartments();
        }
        if (choices === "View All Roles") {
            viewRoles();
        }
        if (choices === "View all Employees") {
            viewEmployees();
        }
        if (choices === "Add a Department") {
            addDepartment();
        }
        if (choices === "Add a Role") {
            addRole();
        }
        if (choices === "Add an Employee") {
            addEmployee();
        }
        if (choices === "Update an Employee Role") {
            updateEmployee();
        }
        if (choices === "Update an Employee Manager") {
            updateManager();
        }
        if (choices === "View Employees by Department") {
            viewEmployeesByDept();
        }
        if (choices === "Delete a Department") {
            deleteDepartment();
        }
        if (choices === "Delete a Role") {
            deleteRole();
        }
        if (choices === "Delete an Employee") {
            deleteEmployee();
        }
        if (choices === "View Budget by Department") {
            viewBudget();
        }
        if (choices === "Exit") {
            connection.end();
        };
    });
};

viewDepartments = () => {
    console.log('Showing all departments..\n');
    const sql = `SELECT department.id AS "Department ID", department.name AS "Department Name" FROM department`;

    connection.query(sql, (err, resp) => {
        if (err) throw err;
        console.table(resp);
        menuMain();
    });
};

viewRoles = () => {
    console.log('Showing all Roles.. \n');
    const sql = `SELECT roles.id, roles.title, department.name AS "Department" FROM Roles INNER JOIN department ON roles.department_id = department.id`;

    connection.query(sql, (err, resp) => {
        if (err) throw err;
        console.table(resp);
        menuMain();
    })
};

viewEmployees = () => {
    console.log('Showing all Employees.. \n');
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.name AS "Department", roles.salary, CONCAT (manager.first_name, " ", manager.last_name) AS "Manager" FROM employee LEFT JOIN roles ON employee.roles_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    connection.query(sql, (err, resp) => {
        if (err) throw err;
        console.table(resp);
        menuMain();
    });
};

addDepartment = () => {
    inquirer.prompt(
        [
            {
                type: 'input', 
                name: 'addDept',
                message: "What department would you like to add?",
                validate: addDept => {
                    if (addDept) {
                    return true;
                } else {
                    console.log('Please add a Department name!');
                    return false;
                }
                }
            }
        ]
    )
    .then(answer => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        connection.query(sql, answer.addDept, (err, resp) => {
            if (err) throw err;
            console.log('Added ' + answer.addDept + " to Department List");
            viewDepartments();
        });
    });
};

addRole = () => {
    inquirer.prompt(
        [
            {
                type: 'input',
                name: 'role',
                message: "What Role would you like to add?",
                validate: addRole => {
                    if (addRole) {
                        return true;
                    } else {
                        console.log('Please add a Role');
                        return false;
                    }
                }
            },
            {
                type: 'input',
                name: 'salary',
                message: "What is the salary?",
                validate: addSalary => {
                    if (isNaN(addSalary)) {
                        console.log('Please enter a number value salary');
                        return false;
                        
                    } else {
                        return true;
                    }
                }
            }
        ]
    )
    .then(answer => {
        const params = [answer.role, answer.salary];
        const roleSql = `SELECT name, id FROM department`;

        connection.query(roleSql, (err, data) => {
            if (err) throw err;
            const dept = data.map(({ name, id }) => ({ name: name, value: id }));

            inquirer.prompt(
                [
                    {
                        type: 'list',
                        name: 'dept',
                        message: "Which Department is this role in?",
                        choices: dept
                    }
                ]
            )
            .then(deptChoice => {
                const dept = deptChoice.dept;
                params.push(dept);

                const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;

                connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log('Added' + answer.role + " to Roles!");
                    viewRoles();
                });
            });
        });
    });
};

addEmployee = () => {
    inquirer.prompt(
        [
            {
                type: 'input',
                name: 'firstName',
                message: "What is the employee's first name?",
                validate: addFirstName => {
                    if (addFirstName) {
                        return true;
                    } else {
                        console.log('Please Enter a first Name');
                        return false;
                    }
                }
            },
            {
                type: 'input',
                name: 'lastName',
                message: "What is the employee's last name?",
                validate: (addLastName) => {
                    if (addLastName) {
                        return true;
                    } else {
                        console.log('Please enter a last name.');
                        return false;
                    }
                }
            }
        ]
    )
    .then(answer => {
        const params = [answer.firstName, answer.lastName]
        const roleSqL = `SELECT roles.id, roles.title FROM roles`;

        connection.query(roleSql, (err, data) => {
            if (err) throw err;
            const roles = data.map(({ id, title }) => ({ name: title, value: id }));

            inquirer.prompt (
                [
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the employee's role?",
                        choices: roles
                    }
                ]
            )
            .then(roleChoice => {
                const role = roleChoice.role;
                params.push(role);
                
                const managerSql = `SELECT * FROM employee`;
                connection.query(managerSql, (err, data) => {
                    if (err) throw err;

                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id}));

                    inquirer.prompt(
                        [
                            {
                                type: 'list',
                                name: 'manager',
                                message: "Who is the employee's manager?",
                                choices: managers
                            }
                        ]
                    )
                    .then(managerChoice => {
                        const manager = managerChoice.manager;
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ?, ?,)`;
                        connection.query(sql, params, (err, result) => {
                            if (err) throw err;
                            console.log("Employee has been added!");
                            viewEmployees();
                        });
                    });
                });
            });
        });
    });
};

updateEmployee = () => {
    
}
/*let connection;

// Connect to database
function connect() {
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
const viewAllDepartments = () => {
    connection.query('SELECT id AS "Dept. ID", name AS "Dept. Name" FROM Department ', function (err, results) {
        if (err) {
            console.log(`ERROR - ${err}`);
        } else {
            console.log('\n', '\x1b[36m', '---------Department List---------', '\x1b[0m', '\n');
            console.table(results);
            console.log('\n', '\x1b[32m', '---------------End Departments-----------', '\x1b[0m', '\n');
        }
    });
    menuMain(); // Return to main menu
};


    //View all Roles
const viewAllRoles = () => {
    connection.query('SELECT Roles.id AS "Roles ID#", Roles.title AS "Roles", Roles.department_id AS "Department ID#", Roles.salary AS "Salary" FROM Roles', function (err, results) {
        if (err) {
            console.log(`Error - ${err}`);
        } else {
            console.log('\n', '\x1b[36m', '---------Roles List---------', '\x1b[0m', '\n');
            console.table(results);
            console.log('\n', '\x1b[32m', '---------------End Roles-----------', '\x1b[0m', '\n');
        }
        });
        menuMain();
    }


const viewAllEmployees = () => {
   connection.query('SELECT em.id AS "Employee Id#", em.first_name AS "First Name", em.last_name AS "Last Name", r.title AS "Title", d.name AS "Department", r.salary AS "Salary", CONCAT(IFNULL(mgr.first_name, " "), " " , IFNULL(mgr.last_name, " ")) AS "Manager", mgr.id AS "Manager _d#" FROM Employee em LEFT JOIN Roles r ON em.roles_id = r.id LEFT JOIN Department d ON d.id = r.department_id LEFT JOIN Employee mgr ON mgr.id = em.manager_id;', function (err, results) {
        if (err) {
            console.log(`ERROR - ${err}`);
        } else {
            console.log('\n', '\x1b[36m', '---------Employee List---------', '\x1b[0m', '\n');
            console.table(results);
            console.log('\n', '\x1b[32m', '---------------End Employees-----------', '\x1b[0m', '\n');
        }
    });
    menuMain();
};
   

const addDepartment = () => {
    let deptArray = [];
    let name;
    //retriever departments
    connection.query('SELECT department.name FROM Department', function (err, results) {
        if (err) {
            console.log(`ERROR - ${err}`);
        } else {
            results.forEach((name) => {
                deptArray.push(name.name);
            });
        }
        console.log('\n', '\x1b[36m', '---------Existing Departments---------', '\x1b[0m', '\n');
        deptArray.forEach((name) => {
            console.table(name);
        })
        console.log('\n', '\x1b[32m', '---------------End Departments-----------', '\x1b[0m', '\n');
    });
   
    //prompt user for new department
    resp = inquirer.prompt(
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
                }
            ]
    ).then((resp) => {
        connection.query('INSERT INTO Department SET ?', { name: resp.newDept }, function (err, results) {
            if (err) {
                console.log(`ERROR - ${err}`);
            } else {
                console.log(`Department ${resp.newDept} added successfully.`);
            }
        });
        
    });
    menuMain();
        };

const addRoles = () => {
    connection.query(`SELECT * From department`, function (err, res) {
        if (err) throw err;
        console.table(res);
    
        res = inquirer.prompt(
            [
                {
                    name: "addDepartment",
                    type: "list",
                    choices: function () {
                        var departArray = [];
                        for (var i = 0; i < res.length; i++) {
                            departArray.push(res[i].id);
                        }
                        return departArray;
                        },
                        message: "What departent would yu like to add to?",
                    },
                    {
                        name: "addRole",
                        type: "input",
                        message: "What role would you like to add?",
                    },
                    {
                        name: "addSalary",
                        type: "input",
                        message: "What is the salary?",
                        validate: function (value) {
                            if (isNaN(value) === false) {
                                return true;
                            }
                            return false;
                        }
                    },
            ]).then(function (answer) {
                connection.query( 
                    "INSERT INTO role SET ?",
                    {
                        title: answer.addRole,
                        salary: answer.addSalary,
                        department_id: answer.addDepartment
                    },
                    function (err, results) {
                        if (err) throw err;
                        console.log("New Role added!");
                    }
                )
            })
           })  
    menuMain();
        };



  
/*const addRoles = async () => {
    let rolesList = [];
    let deptExist;
    let name;
    connection.query('Select Roles.title FROM Roles', function (err, results) {
        if (err) {
            console.log(`ERROR - ${err}`);
        } else {
            results.forEach((name) => {
               rolesList.push(name.name)
        });
    }
    console.log('\n', '\x1b[36m', '---------Existing Roles---------', '\x1b[0m', '\n');
   
        console.table(results);
    
        console.log('\n', '\x1b[32m', '---------------End Roles-----------', '\x1b[0m', '\n');
    });
        //prompt user for new role
     
    resp = await inquirer.prompt(
        [
            {
                name: "roleTitle",
                type: "input",
                message: "Enter the name of the new role: ",
                validate(value) {
                    const test = rolesList.includes(value);
                    if (test) {
                        return 'Role already exists.'
                    } else {
                        return true;
                    }
                    }
            }, 
            {
                name: "selectedDept",
                type: "list",
                message: "Which department does this role belong to?",
                choices: [1,2,3,4]
            },
            {
                name: "roleSalary",
                type: "input",
                message: "What is the salary?"
                
            }
        ]
    )
    //update roles
    .then((resp) => {
        connection.query('INSERT INTO Roles SET ?', { title: resp.roleTitle, department_id: resp.selectedDept, salary: resp.roleSalary }, function (err, results) {
            if (err) {
                console.log(`ERROR - ${err}`);
            } else {
                console.log(`Role ${resp.roleTitle, resp.roleSalary, resp.selectedDept} added successfully.`);
            }
        });
    });
    
    menuMain();
};*/


/*const addEmployee = () => {
    let managers = [];
    let mgrList;
    let empRoles = [];
    let roleChoices = [];
        //get supervisors from database and return to array
        connection.query('SELECT employee.id, employee.first_name, employee.last_name FROM Employee WHERE employee.manager_id = NULL', function (err, results) {
            if (err) {
                console.log(`ERROR - ${err}`);
            } else {
                managers = results;
                console.log(managers);

            

                
    //mgrList = managers[0].forEach(({ id, first_name, last_name }) => ({ value: id, name: `${first_name} ${last_name}`}));
    console.log(mgrList);

}}); 
    //get roles
    connection.query(`SELECT id, title FROM Roles WHERE id > 1`, function (err, results) {
        if (err) {
            console.log(`ERROR - ${err}`);
        } else {
            empRoles = results;
        } //roleChoices = empRoles[0].map(({ id, title }) => ({ value: id, title: `${title}`}));
    });
    
    
    //prompt user for new employee 
    resp = inquirer.prompt([
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
        choices: empRoles
    },
    {
        name: "manager",
        type: "list",
        message: "Chose their manager:",
        choices: managers
    }
])
//update employee list
.then((resp) => {
    connection.query(`INSERT INTO Employee SET ?`, {
        first_name: resp.first_name,
        last_name: resp.last_name,
        roles_id: resp.roles,
        manager_id: resp.manager
    } , function (err, results) {
        if (err) {
            console.log(`ERROR - ${err}`);
        } else {
            console.log(`Employee ${resp.first_name} ${resp.last_name} ${resp.roles} ${resp.manager} added successfully.`);
        }
    });


});
menuMain();
};

const updateEmployeeRole = () => {
    let employees;
    let empChoices;
    let empRoles;
    let roleChoices;
    //get all employees
   connection.query('SELECT employee.id, employee.first_name, employee.last_name, employee.roles_id, employee.manager_id FROM Employee', function (err, results) {
        if (err) {
            console.log(`ERROR - ${err}`);
        } else {
            employees = results;
            console.log(employees);
        empChoices = employees[0].map(({ id, first_name, last_name }) => ({ value: id, name: `${first_name} ${last_name} `})); 
    }});
 
    //get all roles
   connection.query(`SELECT id, title FROM Roles`, function (err, results) {
        if (err) {
            console.log(`ERROR - ${err}`);
        } else {
            empRoles = results;
        roleChoices = empRoles[0].map(({ id, title}) => ({
            value: id, name: `${title}`
        }));
    }});
    resp = inquirer.prompt([
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
])

//update employee list
.then((resp) => connection.query(`UPDATE Employee SET roles_id = ? WHERE id = ?`, [resp.roles, resp.employee], function (err, results) {
    if (err) {
        console.log(`ERROR - ${err}`);
    } else {
        console.log(`Employee ${resp.employee} role updated to ${resp.roles} successfully.`);
    }
}));
menuMain();
};

const menuMain = () => {
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
    const resp = inquirer.prompt(mainMenu);
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

const initApp = () => {
    connect();
    menuMain();
};

initApp();*/