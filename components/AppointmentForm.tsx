"use client";

import React, { useState, useEffect } from "react";

interface Appointment {
  name: string;
  email: string;
  type: string;
  date: string;
  time: string;
}

const types = ["Teleporada", "Wizyta osobista", "Wizyta domowa"];
const times = [
  "09:00","09:05","09:10","09:15","09:20","09:25","09:30","09:35","09:40","09:45","09:50","09:55",
  "10:00","10:05","10:10","10:15","10:20","10:25","10:30","10:35","10:40","10:45","10:50","10:55"
];

export default function AppointmentForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(types[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableTimes, setAvailableTimes] = useState(times);

  useEffect(() => {
    fetch("/api/appointments")
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  useEffect(() => {
    const booked = appointments
      .filter(a => a.date === date && a.type !== "Wizyta domowa")
      .map(a => a.time);
    setAvailableTimes(times.filter(t => !booked.includes(t)));
    setTime("");
  }, [date, appointments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !date || (type !== "Wizyta domowa" && !time)) {
      alert("Wypełnij wszystkie pola!");
      return;
    }

    const newAppointment = { name, email, type, date, time };
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppointment),
    });

    setAppointments([...appointments, newAppointment]);
    alert("Wizyta umówiona!");
    setName(""); setEmail(""); setType(types[0]); setDate(""); setTime("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Umów wizytę</h2>
      <label>Imię i nazwisko</label>
      <input value={name} onChange={e => setName(e.target.value)} required />
      <label>Email</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <label>Typ wizyty</label>
      <select value={type} onChange={e => setType(e.target.value)}>
        {types.map(t => <option key={t}>{t}</option>)}
      </select>
      <label>Data</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      {type !== "Wizyta domowa" && (
        <>
          <label>Godzina</label>
          <select value={time} onChange={e => setTime(e.target.value)} required>
            <option value="">Wybierz godzinę</option>
            {availableTimes.map(t => <option key={t}>{t}</option>)}
          </select>
        </>
      )}
      <button type="submit">Zapisz wizytę</button>
    </form>
  );
}
