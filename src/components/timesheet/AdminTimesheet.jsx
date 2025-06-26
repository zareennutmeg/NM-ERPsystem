
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  Alert,
  Card,
} from "react-bootstrap";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

const AdminTimesheet = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [timesheetData, setTimesheetData] = useState([]);
  const [message, setMessage] = useState(null);

  const hoursList = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const fetchTimesheet = async () => {
    if (!selectedUserId) return;
    const formattedDate = format(startDate, "yyyy-MM-dd");
    try {
      const res = await axios.get(`/api/users/timesheet/${selectedUserId}/${formattedDate}`);
      setTimesheetData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching timesheet", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTimesheet();
  }, [selectedUserId, startDate]);

  const getTimeEntry = (day, hour) => {
    const entry = timesheetData.find(
      (item) =>
        format(new Date(item.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
        item.start_time?.substring(0, 5) === hour
    );
    return entry ? entry.activity_code : "";
  };

  const approveWeek = async () => {
    const formattedDate = format(startDate, "yyyy-MM-dd");
    try {
      await axios.patch(`/api/timesheet/approve/${selectedUserId}/${formattedDate}`);
      setMessage("Approved Weekly Report Successfully");
      fetchTimesheet();
    } catch (err) {
      console.error("Error approving timesheet", err);
      setMessage("Error Approving Timesheet");
    }
  };

  return (
    <Container fluid>
      <Card className="my-4">
        <Card.Header>Admin Timesheet Approval</Card.Header>
        <Card.Body>
          {message && <Alert variant="info">{message}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Select User</Form.Label>
            <Form.Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.user_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Button variant="secondary" onClick={() => setStartDate(addDays(startDate, -7))}>
                Previous Week
              </Button>
            </Col>
            <Col className="text-center">
              <h5>Week of {format(startDate, "MMM d, yyyy")}</h5>
            </Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => setStartDate(addDays(startDate, 7))}>
                Next Week
              </Button>
            </Col>
          </Row>

          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Day</th>
                {hoursList.map((hr) => (
                  <th key={hr}>{hr}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(7)].map((_, i) => {
                const day = addDays(startDate, i);
                const dailyEntries = timesheetData.filter(
                  (item) => format(new Date(item.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                );
                const total = dailyEntries.reduce((sum, e) => sum + Number(e.hours || 0), 0);
                return (
                  <tr key={i}>
                    <td>{format(day, "EEE, MMM d")}</td>
                    {hoursList.map((hr) => (
                      <td key={hr}>{getTimeEntry(day, hr)}</td>
                    ))}
                    <td>{total} / 8 hrs</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {selectedUserId && (
            <div className="text-end">
              <Button variant="success" onClick={approveWeek}>
                Approve Week
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminTimesheet;
