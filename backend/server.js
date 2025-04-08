import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import db from "./db.js";
const { pool, sql } = db;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Handles parsing of JSON request bodies
app.use(cors());         // Enables CORS for all routes

// Test API
app.get("/", (req, res) => {
  res.send("API is running...");
});

// get all employees
app.get("/api/employees", async(req, res) => {
  try {
    const pool = await db.pool;
    const result = await pool.request().query("SELECT * FROM DummyEmployees");
    res.status(200).json({
      status: "success",
      data: result.recordset,
    });

  } catch (error) {
    console.log("❌ Error fetching employees:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching employees",
    });
    
  }
});
// ✅ Get employee by ID (safe + clean)
app.get("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: "error",
        message: "Valid employee ID is required",
      });
    }

    const connectedPool = await db.pool;

    const result = await connectedPool
      .request()
      .input("empId", sql.Int, parseInt(id))
      .query("SELECT * FROM DummyEmployees WHERE EmpId = @empId");

    if (result.recordset.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No employee found with this ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: result.recordset[0], // Send just the object, not inside an array
    });

  } catch (error) {
    console.error("❌ Error fetching employee by ID:", error.message);
    res.status(500).json({
      status: "error",
      message: "Error fetching employee by ID",
    });
  }
});

//Add new employee
app.post("/api/employees", async (req, res) => {
  try {
    const { EmpName, MobileNumber, department, salary } = req.body;

    // ✅ Validation check
    if (!EmpName || !MobileNumber || !department || !salary) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const poolConnection = await db.pool;

    const result = await poolConnection
      .request()
      .input("EmpName", sql.VarChar, EmpName)
      .input("MobileNumber", sql.VarChar, MobileNumber)
      .input("department", sql.VarChar, department)
      .input("salary", sql.Int, salary)
      .query(
        "INSERT INTO DummyEmployees (EmpName, MobileNumber, department, salary) VALUES (@EmpName, @MobileNumber, @department, @salary)"
      );

    res.status(201).json({
      status: "success",
      rowsAffected: result.rowsAffected[0], // ✅ Gives number of rows inserted
      message: "Employee added successfully",
    });
  } catch (error) {
    console.error("❌ Error Adding employee:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error while adding employee",
    });
  }
});

//Update existing employees by id
// ✅ Update existing employee by ID
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { EmpName, MobileNumber, department, salary } = req.body;

    // 🚨 Basic validation
    if (!EmpName || !MobileNumber || !department || !salary) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const poolConnection = await db.pool;

    const result = await poolConnection
      .request()
      .input("id", sql.Int, id)
      .input("EmpName", sql.VarChar, EmpName)
      .input("MobileNumber", sql.VarChar, MobileNumber)
      .input("department", sql.VarChar, department)
      .input("salary", sql.Int, salary)
      .query(`
        UPDATE DummyEmployees 
        SET EmpName = @EmpName, 
            MobileNumber = @MobileNumber, 
            department = @department, 
            salary = @salary 
        WHERE EmpId = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "No employee found with this ID",
      });
    }

    res.status(200).json({
      success: true,
      rowsAffected: result.rowsAffected[0],
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while updating employee",
    });
  }
});

//Delete employee by id
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Basic validation
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: "error",
        message: "Valid employee ID is required",
      });
    }

    const poolConnection = await db.pool;

    const result = await poolConnection
      .request()
      .input("id", sql.Int, parseInt(id))
      .query("DELETE FROM DummyEmployees WHERE EmpId = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        status: "error",
        message: "No employee found with this ID",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Employee deleted successfully",
      rowsAffected: result.rowsAffected[0],
    });
  } catch (error) {
    console.error("❌ Error deleting employee:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error while deleting employee",
    });
  }
});


// Import Routes (uncomment when ready)
// import userRoutes from "./routes/userRoutes.js";
// app.use("/api/users", userRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
