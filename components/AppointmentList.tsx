"use client";

import React, { useEffect, useState } from "react";

interface Appointment {
  name: string;
  email: string;
  type: string;
  date: string;
  time: string;
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch("/api/appointments")
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>Lista zapisanych wizyt</h2>
      <table border={1} cellPadding={5} cellSpacing={0} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Imię i nazwisko</th>
            <th>Email</th>
            <th>Typ wizyty</th>
            <th>Data</th>
            <th>Godzina</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a, i) => (
            <tr key={i}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.type}</td>
              <td>{a.date}</td>
              <td>{a.time || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
