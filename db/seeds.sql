-- CREATE TABLE departments(
--     id SERIAL PRIMARY KEY,
--     name VARCHAR (30) NOT NULL
-- );

INSERT INTO departments (department_name)
VALUES
    ('meatball');

-- CREATE TABLE employee_roles(
--     id SERIAL PRIMARY KEY,
--     title VARCHAR (30) NOT NULL,
--     salary DECIMAL NOT NULL,
--     department_id INTEGER NOT NULL,
--     FOREIGN KEY (department_id) REFERENCES departments(id)
-- );

INSERT INTO employee_roles (title, salary, department_id)
VALUES
    ('meatball manager', 12.23, 1),
    ('meatball roller', 110.25, 1);

-- CREATE TABLE employees(
--     id SERIAL PRIMARY KEY,
--     first_name VARCHAR (30) NOT NULL,
--     last_name VARCHAR (30) NOT NULL,
--     department_id INTEGER,
--     role_id INTEGER NOT NULL,
--     manager_id INTEGER REFERENCES employees(id),
--     FOREIGN KEY (role_id) REFERENCES role(id),
--     FOREIGN KEY (department_id) REFERENCES department(id)
-- );

INSERT INTO employees (first_name, last_name, department_id, role_id, manager_id)
VALUES
    ('Sam', 'Johnson', 1, 1, NULL), 
    ('John', 'Samson', 1, 2, 1);

-- SELECT e.id, e.first_name, e.last_name, e.manager_id, m.first_name AS manager_first_name, m.last_name AS manager_last_name 
-- FROM employees e 
-- JOIN employees m ON e.manager_id = m.id
