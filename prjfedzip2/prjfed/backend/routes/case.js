const express = require("express");
const Case = require("../models/Case");
const auth = require("../middleware/auth"); // ✅ ADDED (one line)

const router = express.Router();
const multer = require("multer");
const path = require("path");

/* CREATE CASE */
router.post("/", auth, async (req, res) => {
  try {
    const {
      customerUsername,
      dcaUsername,
      amount,
      dueDate
    } = req.body;

    if (!customerUsername || !dcaUsername || !amount || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCase = new Case({
      ...req.body,
      status: "In Progress",
      approvalStatus: "",
      history: [
        {
          action: "Case created",
          by: "Manager",
          date: new Date().toLocaleString()
        }
      ]
    });

    await newCase.save();
    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ message: "Error creating case" });
  }
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/payment-proofs");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });


/* GET ALL CASES */
router.get("/", auth, async (req, res) => {
  try {
    const cases = await Case.find();
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cases" });
  }
});

/* UPDATE CASE */
// UPDATE CASE (approve / edit / status change)
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          amount: req.body.amount,
          status: req.body.status,
          approvalStatus: req.body.approvalStatus,
          history: req.body.history
        }
      },
      { new: true }
    );

    res.json(updatedCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE CASE */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ message: "Case deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting case" });
  }
});
router.post(
  "/:id/upload-proof",
  auth,
  upload.single("paymentProof"),
  async (req, res) => {
    try {
      const caseDoc = await Case.findById(req.params.id);
      if (!caseDoc) {
        return res.status(404).json({ message: "Case not found" });
      }

      // ✅ Save file path in DB
      caseDoc.paymentProof = req.file.path;
      await caseDoc.save();

      res.json({
        message: "Payment proof uploaded successfully",
        paymentProof: caseDoc.paymentProof
      });
    } catch (err) {
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

module.exports = router;
