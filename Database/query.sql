--view all departments--
--show department names and id--
Select name, id from department;

--view all roles --
--show job title, role id, department name and salary--
Select id, title, department_id, salary from Roles;

--view all employees--
--show employee id, first name, last name, job title, department, salaries, and manader name--
Select Employee.id, Employee.first_name, Employee.last_name, Roles.salary, department.name, roles.title, manager.first_name as 'Manager_First_Name', manager.last_name as 'Manager_Last_Name'
from Employee
inner join Roles on Employee.roles_id = Roles.id
inner join Department on Roles.department_id = Department.id
inner join Employee manager on Employee.manager_id = manager.id;

--add a department --
--enter name of new department--
Insert into Department (name)
Values ('(name)');

--add a role --
--enter name, salary, department id--
Insert into Roles (title, salary, department_id)
Values ('(title)', '(salary)', '(department_id)');

--add an employee--
--enter first name, last name, role, manager id--
INSERT INTO Employee (first_name, last_name, roles_id, manager_id)
VALUES ('(first_name)', '(last_name)', '(roles_id)', '(manager_id)');

--update employee role --
--enter employee id, new role id--
UPDATE Employee
SET roles_id = '(roles_id)'
WHERE id = '(id)'; 

--update employee manager--
--enter employee id, new manager id--
UPDATE Employee 
SET manager_id = '(manager_id)'
WHERE id = '(id)';

--show employees by manager--
SELECT sub.id AS subordinate_id,
sub.first_name AS subordinate_first_name,
sub.last_name AS subordinate_first_name,
sup.id AS supervisor_id,
sup.first_name AS supervisor_first_name,
sup.last_name AS supervisor_last_name
FROM Employee sub
JOIN Employee sup 
ON sub.manager_id = sup.id
ORDER BY supervisor_id;

--show employees by department--
Select Employee.id, Employee.first_name, Employee.last_name, Roles.salary, department.name, roles.title, manager.first_name as 'Manager_First_Name', manager.last_name as 'Manager_Last_Name'
from Employee
inner join Roles on Employee.roles_id = Roles.id
inner join Department on Roles.department_id = Department.id
inner join Employee manager on Employee.manager_id = manager.id;
ORDER BY department.name;

--delete roles--
DELETE FROM Roles WHERE id='(id)';

--delete department--
DELETE FROM Department WHERE name='(name)';

--delete employee--
DELETE FROM Employee WHERE id='(id)';

--view salary by department--
SELECT department.name, SUM(role.salary) AS 'Total Salary'
FROM Employee
INNER JOIN Roles ON Employee.roles_id = Roles.id
INNER JOIN Department ON Roles.department_id = Department.id
GROUP BY department.name;