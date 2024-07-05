const pg = require("pg");
const uuid = require("uuid");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_reservation_planner"
);

const buildTable = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;

    CREATE TABLE customers(
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    );
    CREATE TABLE restaurants(
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    );
    CREATE TABLE reservations(
        id UUID PRIMARY KEY,
        date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
        customer_id UUID REFERENCES customers(id) NOT NULL
    );
    `;
  await client.query(SQL);
};

const addCustomer = async (name) => {
  const SQL = `
    INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const addRestaurant = async (name) => {
  const SQL = `
    INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const getCustomers = async () => {
  const SQL = `
    SELECT * FROM customers
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const getRestaurants = async () => {
  const SQL = `
    SELECT * FROM restaurants
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const createReservation = async ({
  customer_id,
  restaurant_id,
  party_count,
  date,
}) => {
  const SQL = `
    INSERT INTO reservations(id, customer_id, restaurant_id, party_count, date) VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    customer_id,
    restaurant_id,
    party_count,
    date,
  ]);
  return response.rows[0];
};

const getReservations = async () => {
  const SQL = `
    SELECT * FROM reservations
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const destroyReservation = async ({ id, customer_id }) => {
  const SQL = `
        DELETE FROM reservations
        WHERE id = $1 AND customer_id=$2
    `;
  await client.query(SQL, [id, customer_id]);
};

module.exports = {
  client,
  buildTable,
  addCustomer,
  addRestaurant,
  createReservation,
  getReservations,
  getCustomers,
  getRestaurants,
  destroyReservation,
};
