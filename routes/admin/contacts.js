const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/admin/ContactUsController");

// List contacts
router.get("/", (req, res) => contactController.index(req, res));

// Show contact details
router.get("/show/:id", (req, res) => contactController.show(req, res));

// Delete contact
router.post("/destroy/:id", (req, res) => contactController.delete(req, res));

module.exports = router;