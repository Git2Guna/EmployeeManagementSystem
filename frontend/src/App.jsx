import { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./App.css";
import axios from "axios";
import unemploymentImg from "./assets/unemployment.png";

const API_URL = "http://localhost:5000/employees";

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    gender: "",
    department: "",
    attendance: "",
    profile: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [fileKey, setFileKey] = useState(Date.now());

  // Popup
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ visible: false, empId: null });

  // Load employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_URL);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      showPopup("Failed to fetch employees", "delete");
    }
  };

  const showPopup = (message, type) => {
    setPopup({ message, type, visible: true });
    setTimeout(() => setPopup({ ...popup, visible: false }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, profile: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, name, gender, department, attendance, profile } = formData;

    if (!id || !name || !gender || !department || !attendance) {
      showPopup("Please fill all fields", "delete");
      return;
    }
    if (!editingId && !profile) {
      showPopup("Profile image required", "delete");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        showPopup("Employee updated successfully", "update");
        setEditingId(null);
      } else {
        await axios.post(API_URL, formData);
        showPopup("Employee added successfully", "success");
      }
      fetchEmployees();
      setFormData({ id: "", name: "", gender: "", department: "", attendance: "", profile: "" });
      setFileKey(Date.now());
    } catch (err) {
      console.error(err);
      showPopup("Operation failed", "delete");
    }
  };

  const editEmployee = (emp) => {
    setFormData(emp);
    setEditingId(emp.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (id) => setDeleteModal({ visible: true, empId: id });

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteModal.empId}`);
      showPopup("Employee deleted successfully", "delete");
      fetchEmployees();
      setDeleteModal({ visible: false, empId: null });
    } catch (err) {
      console.error(err);
      showPopup("Delete failed", "delete");
    }
  };

  const cancelDelete = () => setDeleteModal({ visible: false, empId: null });

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.id.toString().includes(search) ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.gender.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.attendance.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-wrapper">
      <h1>Employee Management</h1>

      {/* FORM SECTION */}
      <div className="section form-section">
        <form className="employee-form" onSubmit={handleSubmit}>
          <input
            name="id"
            placeholder="Employee ID"
            value={formData.id}
            onChange={handleChange}
            disabled={editingId !== null}
          />
          <input
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
          />

          <div className="radio-group">
            {["Male", "Female", "Other"].map((g) => (
              <label key={g}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={handleChange}
                />
                {g}
              </label>
            ))}
          </div>

          <select name="department" value={formData.department} onChange={handleChange}>
            <option value="">Select Department</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Development</option>
            <option>Marketing</option>
          </select>

          <div className="radio-group">
            {["Present", "Absent"].map((a) => (
              <label key={a}>
                <input
                  type="radio"
                  name="attendance"
                  value={a}
                  checked={formData.attendance === a}
                  onChange={handleChange}
                />
                {a}
              </label>
            ))}
          </div>

          <input key={fileKey} type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit">{editingId ? "Update Employee" : "Add Employee"}</button>
        </form>
      </div>

      {/* SEARCH + TABLE SECTION */}
      <div className="section table-section">
        <div className="table-wrapper">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by ID, Name, Gender, Dept, Attendance"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Department</th>
                  <th>Attendance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        {emp.profile ? (
                          <img
                            src={emp.profile}
                            alt={emp.name}
                            className={`profile-img ${
                              emp.attendance === "Present" ? "present" : "absent"
                            }`}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{emp.id}</td>
                      <td>{emp.name}</td>
                      <td>{emp.gender}</td>
                      <td>{emp.department}</td>
                      <td
                        className={
                          emp.attendance === "Present"
                            ? "attendance-present"
                            : "attendance-absent"
                        }
                      >
                        {emp.attendance}
                      </td>
                      <td className="action-icons">
                        <button
                          className="icon-btn update-btn"
                          onClick={() => editEmployee(emp)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => openDeleteModal(emp.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      <img
                        src={unemploymentImg}
                        alt="No employees"
                        style={{ width: "150px", height: "150px", objectFit: "contain" }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* POPUP */}
      {popup.visible && <div className={`popup-message ${popup.type}`}>{popup.message}</div>}

      {/* DELETE MODAL */}
      {deleteModal.visible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to delete this employee?</h3>
            <div className="modal-buttons">
              <button className="btn-yes" onClick={confirmDelete}>Yes</button>
              <button className="btn-no" onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
