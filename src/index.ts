// import { QueryResult } from 'pg'
import { pool, connectToDb } from './connection.js'
import inquirer from 'inquirer'

// Ensure DB connection before proceeding
await connectToDb();

const updateEmployeeManager = async () => {
    try {
        const result = await pool.query('SELECT first_name, last_name, id FROM employees');

        const employeeArray = result.rows.map(e => ({
            name: `${e.first_name} ${e.last_name}`, value: e.id
        }));

        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'selectEmployee',
                    message: 'Select employee',
                    choices: employeeArray
                },
                {
                    type: 'list',
                    name: 'selectManager',
                    message: 'Select manager',
                    choices: employeeArray
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
    }
    catch (error) {
        console.log(error)
    }
    main()
}

const viewEmployeesByDepartment = async () => {
    try {
        const result = await pool.query('SELECT employees.id, employees.first_name, employees.last_name, employees.department_id, departments.department_name FROM employees JOIN departments ON employees.department_id = departments.id;')

        console.log(result.rows)
    }
    catch (err) {
        console.error('error', err)
    }

    main()
}

const deleteDepartment = async () => {
    try {
        const result = await pool.query('SELECT * FROM DEPARTMENTS')
        const departmentsArray = result.rows.map(d => ({ name: d.department_name, value: d.id }))

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
    }

    catch (err) {
        console.error('error', err)
    }

    main()
}

const deleteRole = async () => {
    try {
        const result = await pool.query('SELECT * FROM employee_roles')

        const rolesArray = result.rows.map(r => ({ name: r.title, value: r.id }))

        const answers = await inquirer.prompt(
            {
                type: 'list',
                name: 'selectRole',
                message: 'select role',
                choices: rolesArray
            }
        )

        await pool.query('DELETE FROM roles WHERE id = $1', [answers.selectRole])

    }
    catch (err) {
        console.error('error', err)
    }

    main()
}

const deleteEmployee = async () => {
    try {
        const result = await pool.query('SELECT * FROM employees')
        const employeeArray = result.rows.map(e => ({ name: `${e.first_name} ${e.last_name}`, value: e.id }))

        const answers = await inquirer.prompt(
            {
                type: 'list',
                name: 'selectEmployee',
                message: 'Select employee to delete.',
                choices: employeeArray
            }
        )

        await pool.query('DELETE FROM employees WHERE id = $1', [answers.selectEmployee])
    }
    catch(err) {
        console.error('error', err)
    }

    main()
}

const main = async () => {
    try {

        // Inquirer prompt after DB connection is established
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectAction',
                message: 'Select a desired action',
                choices: [
                    'update employee manager',
                    'view employees by manager',
                    'view employees by department',
                    'delete department',
                    'delete role',
                    'delete employee',
                    'exit'
                ]
            }
        ]);

        console.log(`Action selected: ${answers.selectAction}`);

        // Check user's choice and call appropriate function
        if (answers.selectAction === 'update employee manager') {
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