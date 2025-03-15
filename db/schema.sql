DROP DATABASE IF EXISTS employee_registry;

CREATE DATABASE employee_registry;

\c employee_registry;

DROP TABLE IF EXISTS departments;

CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    department_name VARCHAR (30) NOT NULL
);

DROP TABLE IF EXISTS employee_roles;

CREATE TABLE employee_roles(
    id SERIAL PRIMARY KEY,
    title VARCHAR (30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

DROP TABLE IF EXISTS employees;

CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR (30) NOT NULL,
    last_name VARCHAR (30) NOT NULL,
    department_id INTEGER,
    role_id INTEGER,
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES employee_roles(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);