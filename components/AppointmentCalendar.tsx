"use client";

import React from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  pl: require("date-fns/locale/pl"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Appointment {
  id: number;
  type: "teleporada" | "wizyta_osobista" | "wizyta_domowa";
  time: string; // ISO string
  title: string;
}

interface Props {
  appointments: Appointment[];
  onSelectTime: (time: string) => void;
}

export default function AppointmentCalendar({ appointments, onSelectTime }: Props) {
  const events: Event[] = appointments.map((a) => ({
    start: new Date(a.time),
    end: new Date(new Date(a.time).getTime() + 30 * 60000),
    title: a.title,
    allDay: false,
  }));

  const isSlotFree = (date: Date) => {
    for (const a of appointments) {
      if (new Date(a.time).getTime() === date.getTime()) return false;
    }
    return true;
  };

  const handleSelectSlot = (slotInfo: any) => {
    const clickedTime = slotInfo.start;
    const free = isSlotFree(clickedTime);
    if (!free) {
      alert("Ten slot jest zajęty");
      return;
    }
    onSelectTime(clickedTime.toISOString());
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        selectable
        onSelectSlot={handleSelectSlot}
        eventPropGetter={() => ({
          style: { backgroundColor: "#f87171", color: "white" },
        })}
      />
    </div>
  );
}
