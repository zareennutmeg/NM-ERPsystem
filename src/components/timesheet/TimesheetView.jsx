
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
} from "date-fns";

const TimesheetView = ({ userId }) => {
  const [timesheetData, setTimesheetData] = useState([]);
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [loading, setLoading] = useState(false);

  const fetchTimesheet = async () => {
    try {
      setLoading(true);
      const formatted = format(startDate, "yyyy-MM-dd");
      const res = await axios.get(`http://13.48.244.216:5000/api/timesheet/${userId}/${formatted}`);
      setTimesheetData(res.data.data);
    } catch (error) {
      setAlert({ show: true, message: "Failed to fetch timesheet", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (direction) => {
    const delta = direction === "next" ? 7 : -7;
    setStartDate((prev) => addDays(prev, delta));
  };

  const handleSubmitWeek = async () => {
    try {
      const formatted = format(startDate, "yyyy-MM-dd");
      await axios.patch(`http://13.48.244.216:5000/api/timesheet/update_week/${userId}/${formatted}`);
      setAlert({ show: true, message: "All pending timesheets submitted successfully", variant: "success" });
      fetchTimesheet();
    } catch {
      setAlert({ show: true, message: "Failed to submit week", variant: "danger" });
    }
  };

  const getTimeBlock = (day, hour) => {
    const entry = timesheetData.find((entry) =>
      isSameDay(parseISO(entry.date), day) &&
      parseInt(entry.start_time?.split(":")[0]) === hour
    );
    return entry ? entry.activity_code : null;
  };

  const hours = Array.from({ length: 8 }, (_, i) => 9 + i); // 9 AM to 5 PM
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <Container className="my-4">
      <Card>
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col>
              <h4>Timesheet Management</h4>
              <small>Track your work hours from 9:00 AM to 5:00 PM</small>
            </Col>
            <Col className="text-end">
              <Button onClick={handleSubmitWeek}>Submit Week</Button>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Button variant="secondary" onClick={() => handleWeekChange("prev")}>
                Previous Week
              </Button>{" "}
              <Button variant="outline-primary" onClick={() => setStartDate(startOfWeek(new Date()))}>
                Current Week
              </Button>{" "}
              <Button variant="secondary" onClick={() => handleWeekChange("next")}>
                Next Week
              </Button>
            </Col>
          </Row>

          {alert.show && (
            <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
              {alert.message}
            </Alert>
          )}

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Day</th>
                  {hours.map((hour) => (
                    <th key={hour}>{`${hour}:00`}</th>
                  ))}
                  <th>Daily Total</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const dailyEntries = timesheetData.filter((entry) =>
                    isSameDay(parseISO(entry.date), day)
                  );
                  const totalHours = dailyEntries.reduce((sum, e) => sum + Number(e.hours), 0);
                  return (
                    <tr key={day}>
                      <td>{format(day, "EEE, MMM d")}</td>
                      {hours.map((hour) => {
                        const block = getTimeBlock(day, hour);
                        return (
                          <td key={hour} className={block ? "bg-primary text-white text-center" : ""}>
                            {block || ""}
                          </td>
                        );
                      })}
                      <td className="text-center">{totalHours} / 8 hrs</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          <small className="text-muted">Note: Submit your timesheet by end of the week</small>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TimesheetView;
