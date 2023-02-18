--view all departments--
--show department names and id--
Select name, id from department;

--view all roles --
--show job title, role id, department name and salary--
Select id, title, department_id, salary from Role;

--view all employees--
--show employee id, first name, last name, job title, department, salaries, and manader name--
Select Employee.id, Employee.first_name, Employee.last_name, Role.salary, department.name, role.title, manager.first_name as 'Manager_First_Name', manager.last_name as 'Manager_Last_Name'
from Employee
inner join Role on Employee.role_id = Role.id
inner join Department on Role.department_id = Department.id
inner join Employee manager on Employee.manager_id = manager.id;

--add a department --
--enter name of new department--
Insert into Department (name)
Values ('(name)');

--add a role --
--enter name, salary, department id--
Insert into Role (title, salary, department_id)
Values ('(title)', '(salary)', '(department_id)');

--add an employee--
--enter first name, last name, role, manager id--
INSERT INTO Employee (first_name, last_name, role_id, manager_id)
VALUES ('(first_name)', '(last_name)', '(role_id)', '(manager_id)');

--update employee role --
--enter employee id, new role id--
UPDATE Employee
SET role_id = '(role_id)'
WHERE id = '(id)'; --figure this out later--

--update employee manager--
--enter employee id, new manager id--

--show employees by manager--

--show employees by department--

--delete roles--
DELETE FROM Role WHERE id='(id)';

--delete department--
DELETE FROM Department WHERE name='(name)';

--delete employee--
DELETE FROM Employee WHERE id='(id)';

--view salary by department--