
import { useState, useEffect } from "react";
import axios from "axios";
import MemberCertificates from "./pages/MemberCertificates";
import "./MemberOnboarding.css";

const API_URL = `http://13.48.244.216:5000/api/members`;


const MemberOnboarding = () => {
  const initialFormState = {
    name: "",
    age: "",
    gender: "",
    date_of_birth: "",
    date_of_joining: "",
    aadhar_number: "",
    pan_number: "",
    bank_name: "",
    bank_account: "",
    bank_branch: "",
    ifsc_code: "",
    email: "",
    designation: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [members, setMembers] = useState([]);
  const [editId, setEditId] = useState(null);

   useEffect(() => {
    fetchMembers();
  }, []);


  const fetchMembers = async () => {
    try {
      const response = await axios.get(API_URL);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members", error);
      setErrorMessage("Failed to fetch members");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (member) => {
    const formatDate = (dateString) =>
      dateString ? new Date(dateString).toISOString().split("T")[0] : "";

    setFormData({
      name: member.name || "",
      age: member.age || "",
      gender: member.gender || "",
      designation: member.designation || "",
      date_of_birth: formatDate(member.date_of_birth),
      date_of_joining: formatDate(member.date_of_joining),
      aadhar_number: member.aadhar_number || "",
      pan_number: member.pan_number || "",
      bank_name: member.bank_name || "",
      bank_account: member.bank_account || "",
      bank_branch: member.bank_branch || "",
      ifsc_code: member.ifsc_code || "",
      email: member.email || "",
    });

    setEditId(member.member_id);
    setEditing(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setSuccessMessage("Member deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      setErrorMessage("Failed to delete member");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const dataToSend = { ...formData };


    if (editing && editId) {
      await axios.put(`${API_URL}/${editId}`, dataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccessMessage("Member updated successfully");
    } else {
      const response = await axios.post(API_URL, dataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      const { member: { member_id: newMemberId }, message } = response.data;
      setSuccessMessage(message || "Member added successfully");
      setEditId(newMemberId); // allow immediate certificate upload
    }

    setFormData(initialFormState);
    setEditing(false);
    setErrorMessage("");
    fetchMembers();

  } catch (error) {
    console.error("Error adding/updating member:", error);
    setErrorMessage(error.response?.data?.error || "Failed to add/update member");
    setSuccessMessage("");
  }
};
  return (
    <div className="App">
      <div className="form-container mt-4">
        <h1 className="text-3xl font-bold">OnBoardDesk Management</h1>
        <p className="text-muted-foreground mt-1">Manage new member registration</p>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <h2 className="text-secondary mb-3">Personal Information</h2>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Full Name (As per passport)</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Age</label>
              <input type="number" className="form-control" name="age" value={formData.age} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Gender</label>
              <select className="form-select" name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Date of Joining</label>
              <input type="date" className="form-control" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Designation</label>
              <input type="text" className="form-control" name="designation" value={formData.designation} onChange={handleChange} required />
            </div>
            <div className="col-md-12">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <h3 className="text-secondary mt-4 mb-3">Identification Details</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Aadhar Number</label>
              <input type="text" className="form-control" name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">PAN Number</label>
              <input type="text" className="form-control" name="pan_number" value={formData.pan_number} onChange={handleChange} required />
            </div>
          </div>

          <h4 className="text-secondary mt-4 mb-3">Bank Information</h4>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Bank Name</label>
              <input type="text" className="form-control" name="bank_name" value={formData.bank_name} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Bank Account Number</label>
              <input type="text" className="form-control" name="bank_account" value={formData.bank_account} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Bank Branch</label>
              <input type="text" className="form-control" name="bank_branch" value={formData.bank_branch} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">IFSC Code</label>
              <input type="text" className="form-control" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} required />
            </div>
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary w-100">
              {editing ? "Update Member" : "Register Member"}
            </button>
          </div>

          {editId && (
            <div className="mt-5">
              <h5 className="text-secondary">Manage Certificates</h5>
              <MemberCertificates memberId={editId} />
            </div>
          )}
        </form>

        <div className="Member-Information mt-5">
          <h3>Member Information</h3>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Designation</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>DOJ</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {Array.isArray(members) && members.length > 0 ? (
    members.map((member, index) => (
      <tr key={member.member_id || index}>
        <td>{member.name}</td>
        <td>{member.age}</td>
        <td>{member.designation}</td>
        <td>{member.gender}</td>
        <td>{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : "N/A"}</td>
        <td>{member.date_of_joining ? new Date(member.date_of_joining).toLocaleDateString() : "N/A"}</td>
        <td className="d-flex gap-2">
          <button className="btn btn-warning btn-sm" onClick={() => handleEdit(member)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(member.member_id)}>Delete</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="text-center">No members found.</td>
    </tr>
  )}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberOnboarding;