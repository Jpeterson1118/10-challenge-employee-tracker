// import { QueryResult } from 'pg'
import { pool, connectToDb } from './connection.js'
import inquirer from 'inquirer'

// Ensure DB connection before proceeding
await connectToDb();

const viewAllDepartments = async () => {
    try {
        const departments = await pool.query('SELECT * FROM DEPARTMENTS')
        console.log(departments.rows)
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const viewAllRoles = async () => {
    try {
        const roles = await pool.query('SELECT * FROM employee_roles')

        console.log(roles.rows)
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const viewAllEmployees = async () => {
    try {
        const employees = await pool.query('SELECT * FROM employees');
        console.log(employees.rows)
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const addDepartment = async () => {
    try {
        const answer = await inquirer.prompt(
            {
                type: 'input',
                name: 'newDepartment',
                message: 'Please provide new department name'
            }
        )

        await pool.query('INSERT INTO departments (department_name) VALUES ($1)', [answer.newDepartment])

        console.log('Department added.')
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const addRole = async () => {
    try {
        const departments = await pool.query('SELECT * FROM DEPARTMENTS')
        const departmentsArray = departments.rows.map(d => ({ name: d.department_name, value: d.id }))

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'roleTitle',
                message: 'Please provide role title'
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'Please provide yearly salary for this role'
            },
            {
                type: 'list',
                name: 'roleDepartment',
                message: 'Please assign new role to a department',
                choices: departmentsArray
            }
        ])

        await pool.query('INSERT INTO employee_roles (title, salary, department_id) values ($1, $2, $3)', [answers.roleTitle, answers.roleSalary, answers.roleDepartment])

        console.log('Role added')
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const addEmployee = async () => {
    try {
        const employees = await pool.query('SELECT * FROM employees');
        const employeesArray = employees.rows.map(e => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }));

        const roles = await pool.query('SELECT * FROM employee_roles')
        const rolesArray = roles.rows.map(r => ({ name: r.title, value: r.id }))

        const departments = await pool.query('SELECT * FROM DEPARTMENTS')
        const departmentsArray = departments.rows.map(d => ({ name: d.department_name, value: d.id }))

        const hasManager = await inquirer.prompt({
            type: 'confirm',
            name: 'confirmManager',
            message: 'Does the employee have an assigned manager?',
            default: true
        })

        if (hasManager.confirmManager) {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'Provide employee first name'
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'provide employee last name'
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'Please select assigned department',
                    choices: departmentsArray
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Please select assigned role',
                    choices: rolesArray
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Select assigned manager',
                    choices: employeesArray
                }
            ])

            await pool.query('INSERT INTO employees (first_name, last_name, department_id, role_id, manager_id) VALUES ($1, $2,  $3, $4, $5)', [answers.firstName, answers.lastName, answers.department, answers.role, answers.manager])

            console.log('employee added')
        } else {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'Provide employee first name'
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'provide employee last name'
                },
                {
                    type: 'list',
                    name: "Department",
                    message: 'Please select assigned department',
                    choices: departmentsArray
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Please select assigned role',
                    choices: rolesArray
                }
            ])

            await pool.query('INSERT INTO employees (first_name, last_name, department_id, role_id, manager_id) VALUES ($1, $2, $3, $4, NULL)', [answers.firstName, answers.lastName, answers.Department, answers.role])

            console.log('employee added')
        }

        main()
    } catch (err) {
        console.error('error', err)
    }
}

const updateEmployeeRole = async () => {
    try {
        const employees = await pool.query('SELECT * FROM employees');
        const employeesArray = employees.rows.map(e => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }));

        const roles = await pool.query('SELECT * FROM employee_roles')
        const rolesArray = roles.rows.map(r => ({ name: r.title, value: r.id }))

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'select employee to update',
                choices: employeesArray
            },
            {
                type: 'list',
                name: 'role',
                message: 'Select role to assign employee',
                choices: rolesArray
            }
        ])

        await pool.query('UPDATE EMPLOYEES SET role_id = $1 WHERE id = $2', [answers.role, answers.employee])

        console.log('Employee role updated')
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const updateEmployeeManager = async () => {
    try {
        const employees = await pool.query('SELECT * FROM employees');
        const employeesArray = employees.rows.map(e => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }));

        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'selectEmployee',
                    message: 'Select employee',
                    choices: employeesArray
                },
                {
                    type: 'list',
                    name: 'selectManager',
                    message: 'Select manager',
                    choices: employeesArray
                }
            ])

        await pool.query(`UPDATE EMPLOYEES
            SET manager_id = $2
            WHERE id = $1`, [answers.selectEmployee, answers.selectManager]);

        console.log('manager updated');
    } catch (err) {
        console.error('error', err)
    }

    main()
};

const viewEmployeesByManager = async () => {
    try {
        const result = await pool.query('SELECT e.id, e.first_name, e.last_name, e.manager_id, m.first_name AS manager_first_name, m.last_name AS manager_last_name FROM employees e JOIN employees m ON e.manager_id = m.id')

        console.log(result.rows)
    } catch (error) {
        console.log(error)
    }
    main()
}

const viewEmployeesByDepartment = async () => {
    try {
        const result = await pool.query('SELECT employees.id, employees.first_name, employees.last_name, employees.department_id, departments.department_name FROM employees JOIN departments ON employees.department_id = departments.id;')

        console.log(result.rows)
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const deleteDepartment = async () => {
    try {
        const departments = await pool.query('SELECT * FROM DEPARTMENTS')
        const departmentsArray = departments.rows.map(d => ({ name: d.department_name, value: d.id }))

        const answers = await inquirer
            .prompt(
                {
                    type: 'list',
                    name: 'selectDepartment',
                    message: 'select department',
                    choices: departmentsArray
                }
            )

        const checkRole = await pool.query('SELECT * FROM employee_roles WHERE department_id =$1', [answers.selectDepartment])

        if (checkRole.rows.length > 0) {
            console.log('cannot delete department with assigned roles.')

            const confirmDelete = await inquirer.prompt({
                type: 'confirm',
                name: 'deleteRoles',
                message: 'This department still has asined roles, delete them?',
                default: false
            })

            if (confirmDelete.deleteRoles) {
                await pool.query('DELETE FROM employee_roles WHERE department_id = $1', [answers.selectDepartment])
                console.log('Role deleted')
            } else {
                console.log('Deletion canceled.')
            }
        }

        await pool.query('DELETE FROM departments WHERE id = $1', [answers.selectDepartment])
        console.log('department deleted')
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const deleteRole = async () => {
    try {
        const roles = await pool.query('SELECT * FROM employee_roles')
        const rolesArray = roles.rows.map(r => ({ name: r.title, value: r.id }))

        const answers = await inquirer.prompt(
            {
                type: 'list',
                name: 'selectRole',
                message: 'select role',
                choices: rolesArray
            }
        )

        await pool.query('DELETE FROM roles WHERE id = $1', [answers.selectRole])

    } catch (err) {
        console.error('error', err)
    }

    main()
}

const deleteEmployee = async () => {
    try {
        const employees = await pool.query('SELECT * FROM employees');
        const employeesArray = employees.rows.map(e => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }));

        const answers = await inquirer.prompt(
            {
                type: 'list',
                name: 'selectEmployee',
                message: 'Select employee to delete.',
                choices: employeesArray
            }
        )

        await pool.query('DELETE FROM employees WHERE id = $1', [answers.selectEmployee])
    } catch (err) {
        console.error('error', err)
    }

    main()
}

const main = async () => {
    try {
        const answers = await inquirer.prompt(
            {
                type: 'list',
                name: 'selectAction',
                message: 'Select a desired action',
                choices: [
                    'view all departments',
                    'view all roles',
                    'view all employees',
                    'add department',
                    'add role',
                    'add employee',
                    'update employee role',
                    'update employee manager',
                    'view employees by manager',
                    'view employees by department',
                    'delete department',
                    'delete role',
                    'delete employee',
                    'exit'
                ]
            }
        );

        console.log(`Action selected: ${answers.selectAction}`);

        if (answers.selectAction === 'view all departments') {
            viewAllDepartments()
        } else if (answers.selectAction === 'view all roles') {
            viewAllRoles()
        } else if (answers.selectAction === 'view all employees') {
            viewAllEmployees()
        } else if (answers.selectAction === 'add department') {
            addDepartment()
        } else if (answers.selectAction === 'add role') {
            addRole()
        } else if (answers.selectAction === 'add employee') {
            addEmployee()
        } else if (answers.selectAction === 'update employee role') {
            updateEmployeeRole()
        } else if (answers.selectAction === 'update employee manager') {
            await updateEmployeeManager();
        } else if (answers.selectAction === 'view employees by manager') {
            await viewEmployeesByManager();
        } else if (answers.selectAction === 'view employees by department') {
            await viewEmployeesByDepartment();
        } else if (answers.selectAction === 'delete department') {
            await deleteDepartment();
        } else if (answers.selectAction === 'delete role') {
            await deleteRole();
        } else if (answers.selectAction === 'delete employee') {
            await deleteEmployee();
        } else {
            console.log('Thank you for using this system.')
            process.exit(0)
        }
    } catch (error) {
        console.error('Error in Inquirer or database operation:', error);
    }
};


main()