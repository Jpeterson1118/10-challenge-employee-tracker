DROP DATABASE IF EXISTS employee_registry

CREATE DATABASE employee_registry

CREATE TABLE department{
    id SERIAL PRIMARY KEY
    name VARCHAR (30) NOT NULL
}

CREATE TABLE role(
    id SERIAL PRIMARY KEY
    title VARCHAR (30) NOT NULL
    salary DECIMAL NOT NULL
    department INTEGER NOT NULL
    FOREIGN KEY (department) REFERENCES department(id)
)

CREATE TABLE employee(
    id SERIAL PRIMARY KEY
    first_name VARCHAR (30) NOT NULL
    last_name VARCHAR (30) NOT NULL
    role_id INTEGER NOT NULL
    manager_id INTEGER
    FOREIGN KEY (role_id) REFERENCES role(id)
    FOREIGN key (manager_id) REFERENCES employee(id)
)