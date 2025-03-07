import { QueryResult } from 'pg'
import { pool, connectToDb } from './connection.js'
import inquirer from 'inquirer'

connectToDb()

inquirer
    .prompt([
        {   
            type: 'list',
            name: 'selectAction',
            message: 'select a desired action',
            choices: ['update employee manager', 'view employees by manager', 'view employees by department', 'delete department', 'delete role', 'delete employee']          
        }])
    .then((answers) =>{
        if(answers.selectAction === 'update employee manager'){
            updateEmployeeManager()
        }
        else if(answers.selectAction === 'view empoloyees by manager'){
            viewEmployeesByManager()
        }
        else if(answers.selectAction === 'view employees by department'){
            viewEmployeesByDepartment()
        }
        else if(answers.selectAction === 'delete department'){
            deleteDepartment()
        }
        else if(answers.selectAction === 'delete role'){
            deleteRole()
        }
        else{}
    })

const updateEmployeeManager = () => {
    pool.query('SELECT first_name, last_name, id FROM employees', (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err)
            return
        }
        const employeeArray = result.rows.map(e => ({name: `${e.first_name} ${e.last_name}`, value: e.id
        }))

        inquirer
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
            ]
            )
            .then((answers) => {
                pool.query(`UPDATE EMPLOYEES
                    SET manager_id = $2
                    WHERE id = $1`, [answers.selectEmployee.id, answers.selectManager.id]);
            })
    })
}

const viewEmployeesByManager = () => {
    pool.query('SELECT e.id, e.first_name, e.last_name, e.manager_id, m.first_name AS manager_first_name, m.last_name AS manager_last_name FROM employees e JOIN employees m ON e.manager_id = m.id') 
}

const viewEmployeesByDepartment = () => {
    pool.query('SELECT employees.id, employees.first_name, employees.last_name, employees.department_id, departments.department_name FROM employees JOIN departments ON employees.department_id = departments.id;')
}

const deleteDepartment = () => {
    pool.query('SELECT * FROM DEPARTMENTS', (err: Error, result: QueryResult) => {
        if (err){
            console.log(err)
        }
     // const employeeArray = result.rows.map(e => ({name: `${e.first_name} ${e.last_name}`, value: e.id
        const departmentsArray = result.rows.map(d => ({ name: d.department_name, value: d.id }) )
        
        inquirer
            .prompt(
                {
                    type: 'list',
                    name: 'selectDepartment',
                    message: 'select department',
                    choices: departmentsArray
                }
            )
            .then((answers) =>{
                pool.query('DELETE FROM departments WHERE id IN $1', [answers.selectDepartment.id])
            })
    })
}

const deleteRole = () => {
    pool.query('SELECT * FROM employee_roles', (err: Error, result: QueryResult) => {
        if (err){
            console.log(err)
            return;
        }
        const roleArray = result.rows.map(r => ({name: r.title, value: r.department_id}))

        inquirer
            .prompt(
                {
                 type: 'list',
                 name: 'selectRole',
                 message: 'select role',
                 choices: roleArray   
                })
            .then((answers) => {
                pool.query('DELETE FROM employee_roles WHERE id IN $1', [answers.selectRole.id])
            })
    })
}