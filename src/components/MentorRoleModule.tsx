import React, { useState, useEffect } from "react";
import { HelpCircle, Clock, Video, CheckSquare, Star, MessageSquare } from "lucide-react";

interface MentorRoleModuleProps {
  sessionToken: string;
  onAddXP: (amt: number) => void;
}

export default function MentorRoleModule({ sessionToken, onAddXP }: MentorRoleModuleProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAppointment = async (apptId: string, status: "approved" | "completed") => {
    try {
      const res = await fetch(`/api/appointments/resolve/${apptId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        onAddXP(120);
        fetchAppointments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Overview Block */}
      <div className="p-4 bg-gradient-to-tr from-cyan-500/15 to-neutral-950 border border-cyan-500/10 rounded-xl">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400">Ecosystem Mentor Hub</span>
        <h2 className="text-md font-bold text-white mt-1">Mentor Consultation Desk</h2>
        <p className="text-xs text-neutral-450 text-neutral-400">Review student schedule requests, inspect portfolio repositories, and record dynamic feedback logs.</p>
      </div>

      <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-neutral-300 font-mono">My Booking Calendar</h3>

        <div className="space-y-2.5">
          {appointments.length === 0 ? (
            <p className="text-xs text-neutral-600 py-6 text-center">No active student bookings matching your profile filter.</p>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="p-4 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition text-xs">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex gap-2 items-center">
                    <span className="font-bold text-white text-xs">{appt.studentName}</span>
                    <span className="px-1 py-0.2 bg-cyan-500/10 border border-cyan-500/20 text-[7.5px] font-mono text-cyan-400 uppercase rounded">topic: {appt.topic || 'System Audit'}</span>
                  </div>
                  <p className="text-neutral-400 line-clamp-2 leading-relaxed">"{appt.notes || 'Portfolio checks and system validation.'}"</p>
                  
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-neutral-600" /> {appt.slotTime}</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3 text-neutral-600" /> Virtual Meet Channel</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {appt.status === "pending" && (
                    <button
                      onClick={() => handleResolveAppointment(appt.id, "approved")}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/10 font-sans text-xs font-bold rounded cursor-pointer transition"
                    >
                      Approve Appointment
                    </button>
                  )}

                  {appt.status === "approved" && (
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-cyan-900/15 text-cyan-400 border border-cyan-500/10 font-mono text-[9px] uppercase font-bold rounded">approved</span>
                      <button
                        onClick={() => handleResolveAppointment(appt.id, "completed")}
                        className="px-3 py-1 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-sans text-[10px] font-semibold rounded cursor-pointer transition"
                      >
                        Complete Session & Score
                      </button>
                    </div>
                  )}

                  {appt.status === "completed" && (
                    <span className="px-2.5 py-1 bg-neutral-900 text-neutral-600 border border-neutral-850 font-mono text-[9px] uppercase font-semibold rounded">completed</span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
