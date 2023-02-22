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
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.name AS "Department", roles.salary, CONCAT (manager.first_name, " ", manager.last_name) AS "Manager" FROM employee LEFT JOIN roles ON employee.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id`;

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
    connection.query("SELECT * FROM employee", (err, empRes) => {
        if (err) throw err;
        const employeeChoice = [
            {
                name: 'None',
                value: 0
            }
        ];
        empRes.forEach(({ first_name, last_name, id}) => {
            employeeChoice.push({ name: first_name + " " + last_name, value: id });
        });

        connection.query("Select * FROM roles", (err, rolRes) => {
            if (err) throw err;
            const roleChoice = [];
            rolRes.forEach(({ title, id }) => {
                roleChoice.push({ name: title, value: id});
            });

            let questions = [
                {
                    type: "input",
                    name: "first_name",
                    message: "what is the employee's first name?"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is the employee's last name?"
                },
                {
                    type: "list",
                    name: "role_id",
                    choices: roleChoice,
                    message: "What is the employee's role?"
                },
                {
                    type: "list",
                    name: "manager_id",
                    choices: employeeChoice,
                    message: "Who is the employee's manager? (can be null)"
                }
            ]

            inquirer.prompt(questions).then(response => {
                const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
                let manager_id = response.manager_id !== 0? response.manager_id: null;
                connection.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
                    if (err) throw err;
                    console.log("Employee Added!");
                    viewEmployees();
                });
            })
            .catch(err => {
                console.error(err);
            });
        })
    });
}

updateEmployee = () => {
    const employeeSql = `SELECT * FROM employee`;
    connection.query(employeeSql, (err, data) => {
        if (err) throw err;

        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id}));

        inquirer.prompt(
            [
                {
                    type: 'list',
                    name: 'name',
                    message: "Which employee would you like to update?",
                    choices: employees
                }
            ]
        )
        .then(empChoice => {
            const employee = empChoice.name;
            const params = [];
            params.push(employee);

            const roleSql = `SELECT * FROM roles`;
            connection.query(roleSql, (err, data) => {
                if (err) throw err;

                const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                inquirer.prompt (
                    [
                        {
                            type: 'list',
                            name: 'role',
                            message: "What is the employee's new role?",
                            choices: roles
                        }
                    ]
                )
                .then(roleChoice => {
                    const role = roleChoice.role;
                    params.push(role);

                    let employee = params[0]
                    params[0] = role
                    params[1] = employee

                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                    connection.query(sql, params, (err, result) => {
                        if (err) throw err;
                        console.log("The employee has been updated!");
                        viewEmployees();
                    });
                });
            });
        });
    });
};

updateManager = () => {
    const employeeSql = `SELECT * FROM employee`;
    connection.query(employeeSql, (err, data) => {
        if (err) throw err;

        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
     
        inquirer.prompt (
            [
                {
                    type: 'list',
                    name: 'name',
                    message: "Which employee would you like to update?",
                    choices: employees
                }
            ]
        )
        .then(empChoice => {
            const employee = empChoice.name;
            const params = [];
            params.push(employee);

            const managerSql = `SELECT * FROM employee`;
            connection.query(managerSql, (err, data) => {
                if (err) throw err;

                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

                inquirer.prompt(
                    [
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is the manager?",
                            choices: managers
                        }
                    ]
                )
                .then(managerChoice => {
                    const manager = managerChoice.manager;
                    params.push(manager);

                    let employee = params[0]
                    params[0] = manager
                    params[1] = employee

                    const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;
                    connection.query(sql, params, (err, result) => {
                        if (err) throw err;
                        console.log("The employee has been updated!");
                        viewEmployees();
                    });
                });
            });
        });
    });
};

viewEmployeesByDept = () => {
    console.log('Showing employee database by department..\n');
    const sql = `SELECT employee.first_name, employee.last_name, department.name AS department FROM employee LEFT JOIN roles ON employee.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id`;

    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.table(result);
        menuMain();
    });
};

deleteDepartment = () => {
   const deptSql = `SELECT * FROM department`;
   connection.query(deptSql, (err, data) => {
    if (err) throw err;

    const dept = data.map(({ name, id }) => ({ name: name, value: id }));

    inquirer.prompt(
        [
            {
                type: 'list',
                name: 'dept',
                message: "Which department do you want to delete?",
                choices: dept
            }
        ]
    )
    .then(deptChoice => {
        const dept = deptChoice.dept;
        const sql = `DELETE FROM department WHERE id = ?`;
        connection.query(sql, dept, (err, result) => {
            if (err) throw err;
            console.log("The department has been deleted!");
            viewDepartments();
        });
    });
   }); 
};

deleteRole = () => {
    const roleSql = `SELECT * FROM Roles`;
    connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const role = data.map(({ title, id }) => ({ name: title, value: id }));

        inquirer.prompt(
            [
                {
                    type: 'list',
                    name: 'role',
                    message: "Which role would you like to delete?",
                    choices: role
                }
            ]
        )
        .then(roleChoice => {
            const role = roleChoice.role;
            const sql = `DELETE FROM roles WHERE id = ?`;

            connection.query(sql, role, (err, result) => {
                if (err) throw err;
                console.log("Role has been Deleted!");
                viewRoles();
            });
        });
    });
};

deleteEmployee = () => {
    const employeeSql = `SELECT * FROM employee`;
    connection.query(employeeSql, (err, data) => {
        if (err) throw err;

        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name +" "+ last_name, value: id }));
     
        inquirer.prompt(
            [
                {
                    type: 'list',
                    name: 'name',
                    message: "Who would you like to delete?",
                    choices: employees
                }
            ]
        )
        .then(empChoice => {
            const employee = empChoice.name;
            const sql = `DELETE FROM employee WHERE id = ?`;
            connection.query(sql, employee, (err, result) => {
                if (err) throw err;
                console.log("Employee successfully deleted!");
                viewEmployees();
            });
        });
    });
};

viewBudget = () => {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;

        const depChoice = [];
        res.forEach(({ name, id }) => {
            depChoice.push({ name: name, value: id });
        });

        let questions = [
            {
                type: "list",
                name: "id",
                choices: depChoice,
                message: "Which department would you like to see?"
            }
        ];
        inquirer.prompt(questions).then(response => {
            const query =`SELECT department.name, SUM(salary) AS "Budget" FROM
            employee LEFT JOIN Roles ON employee.role_id = Roles.id
            LEFT JOIN department on Roles.department_id = department.id
            WHERE department.id = ?`;

            connection.query(query, response.id, (err, res) => {
                if (err) throw err;
                console.table(res);
                menuMain();
            });
        })
        .catch(err => {
            console.error(err);
        });
    });
};
