import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeeCRUD = () => {
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState({
    EmpName: '',
    MobileNumber: '',
    department: '',
    salary: ''
  });
  const [editId, setEditId] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees")
      setEmployees(res.data.data);
      toast.success("Successfully Fetched data")
      console.log(res)
    } catch (err) {
      toast.error('Error fetching employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/employees/${editId}`, employee);
        toast.success('Employee updated');
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/employees', employee);
        toast.success('Employee added');
      }
      setEmployee({ EmpName: '', MobileNumber: '', department: '', salary: '' });
      fetchEmployees();
    } catch (err) {
      toast.error('Error saving employee');
    }
  };

  const handleEdit = (emp) => {
    setEmployee({
      EmpName: emp.EmpName,
      MobileNumber: emp.MobileNumber,
      department: emp.department,
      salary: emp.salary
    });
    setEditId(emp.EmpId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (err) {
      toast.error('Error deleting employee');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Employee Management</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <input type="text" name="EmpName" placeholder="Name" value={employee.EmpName} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-3">
            <input type="text" name="MobileNumber" placeholder="Mobile" value={employee.MobileNumber} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-3">
            <input type="text" name="department" placeholder="Department" value={employee.department} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-2">
            <input type="number" name="salary" placeholder="Salary" value={employee.salary} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-primary w-100">{editId ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.EmpId}>
              <td>{emp.EmpId}</td>
              <td>{emp.EmpName}</td>
              <td>{emp.MobileNumber}</td>
              <td>{emp.department}</td>
              <td>{emp.salary}</td>
              <td>
                <button onClick={() => handleEdit(emp)} className="btn btn-warning btn-sm me-2">Edit</button>
                <button onClick={() => handleDelete(emp.EmpId)} className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default EmployeeCRUD;
