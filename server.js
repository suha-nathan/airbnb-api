/********************************************************************************
 *  WEB422 – Assignment 1
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Padmanathan Suhasini Student ID: 116577222 Date: 29 Jan 2024
 *
 *  Published URL: https://nutty-miniskirt-seal.cyclic.app
 *
 ********************************************************************************/

// Setup
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const ListingsDB = require("./modules/listingsDB.js");
const db = new ListingsDB();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(cors());
app.set("trust proxy", 1);
// Add support for incoming JSON entities
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});
app.post("/api/listings", (req, res) => {
  db.addNewListing(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

app.get("/api/listings", (req, res) => {
  //route must accept the numeric query parameters "page" and "perPage"
  //as well as the (optional) string parameter "name"
  //ie: /api/listings?page=1&perPage=5&name=Volcanoes National Park.
  if (!req.query.page || !req.query.perPage) {
    res.status(400).json({ message: "page and perPage parameters missing" });
  } else {
    db.getAllListings(req.query.page, req.query.perPage, req.query.name)
      .then((data) => {
        if (!data) {
          res.status(204).send({ message: "No Data Found" });
        } else {
          res.status(200).send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
});

app.get("/api/listings/:id", (req, res) => {
  db.getListingById(req.params.id)
    .then((data) => {
      if (!data) {
        res.status(204).send({ message: "No Data Found" });
      } else {
        res.status(200).send(data);
      }
    })
    .catch((err) => {
      res.status(404).send({ message: err.message });
    });
});
app.put("/api/listings/:id", (req, res) => {
  db.updateListingById(req.body, req.params.id)
    .then((data) => {
      res.status(201).send({ message: "Listing Updated" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});
app.delete("/api/listings/:id", (req, res) => {
  db.deleteListingById(req.params.id)
    .then((data) => {
      res.status(200).send({ message: "Listing deleted" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

app.use((req, res) => {
  res.status(404).send("Resource not found");
});

db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
