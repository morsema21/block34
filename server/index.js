const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const {
  client,
  buildTable,
  addCustomer,
  addRestaurant,
  createReservation,
  getReservations,
  getCustomers,
  getRestaurants,
  destroyReservation,
} = require("./db");

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.body.customer_id,
        restaurant_id: req.body.restaurant_id,
        party_count: req.body.party_count,
        date: req.body.date,
      })
    );
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await getCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await getRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await getReservations());
  } catch (ex) {
    next(ex);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
    }
  }
);

const init = async () => {
  await client.connect();
  await buildTable();
  const [moe, lucy, larry, ethyl, gemini, avanti, nobu] = await Promise.all([
    addCustomer({ name: "moe" }),
    addCustomer({ name: "lucy" }),
    addCustomer({ name: "larry" }),
    addCustomer({ name: "ethyl" }),
    addRestaurant({ name: "gemini" }),
    addRestaurant({ name: "avanti" }),
    addRestaurant({ name: "nobu" }),
  ]);

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: moe.id,
      restaurant_id: gemini.id,
      party_count: 5,
      date: "02/14/2025",
    }),
    createReservation({
      customer_id: lucy.id,
      restaurant_id: nobu.id,
      party_count: 5,
      date: "02/28/2025",
    }),
  ]);
  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });

  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
};

init();
