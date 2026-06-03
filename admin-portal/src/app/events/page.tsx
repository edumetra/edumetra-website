"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { createEvent, updateEvent, deleteEvent } from "@/app/actions/management";
import { Plus, Edit2, Trash2, Calendar, Users, Image as ImageIcon, Phone, Mail, UserCheck, UserX, Download } from "lucide-react";

type EventItem = {
    id: string;
    slug: string;
    title: string;
    date: string;
    time: string;
    category: string;
    speaker: string;
    speaker_title: string;
    about_speaker: string;
    description: string;
    long_description: string;
    image: string;
    featured: boolean;
    type: string;
    agenda: string[];
    created_at: string;
    updated_at: string;
};

type RegistrationRow = {
    id: string;
    user_id: string | null;
    status: string;
    registration_type: string;
    created_at: string;
    display_name: string | null;
    display_email: string | null;
    display_phone: string | null;
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    auth_full_name: string | null;
    auth_email: string | null;
    auth_phone: string | null;
};

type WebinarInterest = {
    id: string;
    name: string;
    email: string;
    phone: string;
    category: string | null;
    source: string | null;
    created_at: string;
};

export default function EventsPage() {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
    
    // Registrations State
    const [viewingRegistrationsEvent, setViewingRegistrationsEvent] = useState<EventItem | null>(null);
    const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);

    // General Interests State
    const [showInterests, setShowInterests] = useState(false);
    const [interests, setInterests] = useState<WebinarInterest[]>([]);
    const [loadingInterests, setLoadingInterests] = useState(false);
    const [regCount, setRegCount] = useState<Record<string, number>>({});

    // Form State
    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        date: '',
        time: '',
        category: '',
        speaker: '',
        speaker_title: '',
        about_speaker: '',
        description: '',
        long_description: '',
        image: '',
        featured: false,
        type: 'Live Webinar',
        agendaString: ''
    });

    // Fetch registration counts for all events
    const fetchRegCounts = async (eventList: EventItem[]) => {
        if (!eventList.length) return;
        const { data } = await db
            .from("event_registrations")
            .select("event_id")
            .in("event_id", eventList.map(e => e.id));
        if (data) {
            const counts: Record<string, number> = {};
            (data as { event_id: string }[]).forEach(r => {
                counts[r.event_id] = (counts[r.event_id] || 0) + 1;
            });
            setRegCount(counts);
        }
    };

    const fetchEvents = async () => {
        await Promise.resolve(); // Yield to avoid synchronous setState in effect warning
        setLoading(true);
        setError(null);
        const { data, error: fetchErr } = await db
            .from("events")
            .select("*")
            .order("date", { ascending: false });

        if (fetchErr) setError("Failed to load events.");
        else {
            const list = (data as EventItem[]) || [];
            setEvents(list);
            fetchRegCounts(list);
        }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchEvents(); }, []);

    const fetchRegistrations = async (event: EventItem) => {
        setViewingRegistrationsEvent(event);
        setLoadingRegistrations(true);
        // Use the event_registrations_full view for unified auth+guest display
        const { data, error } = await db
            .from("event_registrations_full")
            .select("*")
            .eq("event_id", event.id)
            .order("created_at", { ascending: false });
        if (error) {
            // Fallback: try raw table with profile join
            const { data: fallback } = await db
                .from("event_registrations")
                .select("*, user_profiles(email, full_name, phone, phone_number)")
                .eq("event_id", event.id)
                .order("created_at", { ascending: false });
            const mapped = (fallback || []).map((r: any) => ({
                ...r,
                display_name: r.guest_name || r.user_profiles?.full_name || null,
                display_email: r.guest_email || r.user_profiles?.email || null,
                display_phone: r.guest_phone || r.user_profiles?.phone || r.user_profiles?.phone_number || null,
            }));
            setRegistrations(mapped);
        } else if (data) {
            const registrationsData = data as RegistrationRow[];
            // Fetch updated user profiles to avoid stale/missing auth metadata details
            const userIds = registrationsData
                .map(r => r.user_id)
                .filter((id): id is string => !!id);

            let profilesMap = new Map<string, any>();
            if (userIds.length > 0) {
                const { data: profiles } = await db
                    .from("user_profiles")
                    .select("id, email, full_name, phone, phone_number")
                    .in("id", userIds);
                if (profiles) {
                    profiles.forEach((p: any) => profilesMap.set(p.id, p));
                }
            }

            const mapped = registrationsData.map(r => {
                const profile = r.user_id ? profilesMap.get(r.user_id) : null;
                return {
                    ...r,
                    display_name: r.guest_name || profile?.full_name || r.display_name || null,
                    display_email: r.guest_email || profile?.email || r.display_email || null,
                    display_phone: r.guest_phone || profile?.phone || profile?.phone_number || r.display_phone || null,
                };
            });
            setRegistrations(mapped);
        } else {
            setRegistrations([]);
        }
        setLoadingRegistrations(false);
    };

    const fetchInterests = async () => {
        setShowInterests(true);
        setLoadingInterests(true);
        const { data } = await db
            .from("webinar_interests")
            .select("*")
            .order("created_at", { ascending: false });
        setInterests((data as WebinarInterest[]) || []);
        setLoadingInterests(false);
    };

    const exportEventRegistrationsCSV = () => {
        if (!registrations.length || !viewingRegistrationsEvent) return;
        
        const headers = ["Name", "Email", "Phone", "Registration Type", "Registered At", "Status"];
        const rows = registrations.map(reg => [
            reg.display_name || "",
            reg.display_email || "",
            reg.display_phone || "",
            reg.registration_type || "",
            reg.created_at ? new Date(reg.created_at).toLocaleString('en-IN') : "",
            reg.status || ""
        ]);
        
        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        
        const fileName = `registrations-${viewingRegistrationsEvent.slug}-${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportInterestsCSV = () => {
        if (!interests.length) return;
        
        const headers = ["Name", "Email", "Phone", "Topic Interest", "Submitted At"];
        const rows = interests.map(item => [
            item.name || "",
            item.email || "",
            item.phone || "",
            item.category || "",
            item.created_at ? new Date(item.created_at).toLocaleString('en-IN') : ""
        ]);
        
        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        
        const fileName = `webinar-interests-${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenModal = (event?: EventItem) => {
        setError(null);
        if (event) {
            setEditingEvent(event);
            setFormData({
                slug: event.slug,
                title: event.title,
                date: event.date,
                time: event.time,
                category: event.category,
                speaker: event.speaker,
                speaker_title: event.speaker_title,
                about_speaker: event.about_speaker || '',
                description: event.description,
                long_description: event.long_description,
                image: event.image || '',
                featured: event.featured,
                type: event.type,
                agendaString: event.agenda ? event.agenda.join('\n') : ''
            });
        } else {
            setEditingEvent(null);
            setFormData({
                slug: '',
                title: '',
                date: '',
                time: '',
                category: 'Counseling Guide',
                speaker: '',
                speaker_title: '',
                about_speaker: '',
                description: '',
                long_description: '',
                image: '',
                featured: false,
                type: 'Live Webinar',
                agendaString: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading("saving");
        setError(null);

        // Process agenda
        const agenda = formData.agendaString
            .split('\n')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        const payload = {
            slug: formData.slug,
            title: formData.title,
            date: formData.date,
            time: formData.time,
            category: formData.category,
            speaker: formData.speaker,
            speaker_title: formData.speaker_title,
            about_speaker: formData.about_speaker,
            description: formData.description,
            long_description: formData.long_description,
            image: formData.image,
            featured: formData.featured,
            type: formData.type,
            agenda: agenda
        };

        if (editingEvent) {
            const res = await updateEvent(editingEvent.id, payload);
            if (res.error) setError(res.error);
            else {
                setEvents(prev => prev.map(n => n.id === editingEvent.id ? { ...n, ...payload } as EventItem : n).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setIsModalOpen(false);
                fetchEvents();
            }
        } else {
            const res = await createEvent(payload);
            if (res.error || !res.data) setError(res.error || "Create failed — no data returned");
            else {
                const newEvent = res.data as EventItem;
                setEvents(prev => [newEvent, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setIsModalOpen(false);
            }
        }
        setActionLoading(null);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        setActionLoading(id);
        const res = await deleteEvent(id);
        if (!res.error) {
            setEvents(prev => prev.filter(n => n.id !== id));
        } else {
            alert(res.error);
        }
        setActionLoading(null);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Events & Webinars</h1>
                    <p className="text-slate-400 text-sm">Manage webinars, seminars, and view registered users.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchInterests}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg font-semibold transition-colors w-fit"
                    >
                        <Mail className="w-4 h-4" /> General Interests
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors w-fit shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-5 h-5" /> Add Event
                    </button>
                </div>
            </div>

            {error && !isModalOpen && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                {["Event Details", "Type & Category", "Date & Time", "Speaker", "About Speaker", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-500">Loading events...</td></tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">No events yet</p>
                                    </td>
                                </tr>
                            ) : events.map(event => (
                                <tr key={event.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-4 min-w-[250px]">
                                        <div className="flex gap-4 items-center">
                                            {event.image ? (
                                                <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-2xl border border-slate-700 shadow">{event.image}</div>
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                                                    <ImageIcon className="w-5 h-5 text-slate-600" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold text-slate-200">{event.title}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">{event.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded w-fit">
                                                {event.type}
                                            </span>
                                            <span className="text-xs text-slate-400">{event.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-300 whitespace-nowrap">
                                        <div className="font-semibold text-slate-200">{event.date}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{event.time}</div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-300">
                                        <div className="font-medium">{event.speaker}</div>
                                        <div className="text-xs text-slate-500">{event.speaker_title}</div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-400 min-w-[280px]">
                                        <div className="line-clamp-3">{event.about_speaker || '—'}</div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => fetchRegistrations(event)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 rounded-lg transition-colors"
                                            >
                                                <Users className="w-3.5 h-3.5" />
                                                Registrations
                                                {(regCount[event.id] || 0) > 0 && (
                                                    <span className="ml-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                        {regCount[event.id]}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(event)}
                                                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Edit Event"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id, event.title)}
                                                disabled={actionLoading === event.id}
                                                className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Event"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registrations Modal */}
            {viewingRegistrationsEvent && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex justify-center items-center pt-10 px-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-emerald-400" />
                                    Event Registrations
                                    <span className="text-sm font-normal text-slate-400 ml-1">({registrations.length})</span>
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">{viewingRegistrationsEvent.title}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {registrations.length > 0 && (
                                    <button
                                        onClick={exportEventRegistrationsCSV}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors border border-emerald-500/30"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Export CSV
                                    </button>
                                )}
                                <button onClick={() => setViewingRegistrationsEvent(null)} className="text-slate-400 hover:text-white pb-1 w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center font-bold text-xl">
                                    &times;
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            {loadingRegistrations ? (
                                <div className="p-12 text-center text-slate-500">Loading registrations...</div>
                            ) : registrations.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No registrations yet for this event.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-slate-800">
                                    <thead className="bg-slate-950/50 sticky top-0">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered At</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                                        {registrations.map(reg => (
                                            <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                                                            {(reg.display_name || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-semibold text-white">{reg.display_name || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                                                        <Mail className="w-3 h-3 text-slate-500" />
                                                        {reg.display_email || '—'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                        <Phone className="w-3 h-3 text-slate-500" />
                                                        {reg.display_phone || <span className="text-slate-600 italic">no phone</span>}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {reg.registration_type === 'guest' ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                                            <UserX className="w-3 h-3" /> Guest
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                                                            <UserCheck className="w-3 h-3" /> Auth
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-400">
                                                    {new Date(reg.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                                        {reg.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* General Webinar Interests Modal */}
            {showInterests && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex justify-center items-center pt-10 px-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-purple-400" />
                                    General Webinar Interests
                                    <span className="text-sm font-normal text-slate-400 ml-1">({interests.length})</span>
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">Users who registered interest via the &quot;Never Miss an Event&quot; form</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {interests.length > 0 && (
                                    <button
                                        onClick={exportInterestsCSV}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors border border-purple-500/30"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Export CSV
                                    </button>
                                )}
                                <button onClick={() => setShowInterests(false)} className="text-slate-400 hover:text-white pb-1 w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center font-bold text-xl">
                                    &times;
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loadingInterests ? (
                                <div className="p-12 text-center text-slate-500">Loading interests...</div>
                            ) : interests.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Mail className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-400">No general interest registrations yet.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-slate-800">
                                    <thead className="bg-slate-950/50 sticky top-0">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Topic Interest</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                                        {interests.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-purple-700/40 flex items-center justify-center text-xs font-bold text-purple-300 flex-shrink-0">
                                                            {item.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-semibold text-white">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                                                        <Mail className="w-3 h-3 text-slate-500" />{item.email}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                        <Phone className="w-3 h-3 text-slate-500" />{item.phone}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {item.category ? (
                                                        <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                                                            {item.category}
                                                        </span>
                                                    ) : <span className="text-slate-600 text-xs">—</span>}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-400">
                                                    {new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-center items-start pt-10 px-4 overflow-y-auto pb-20">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden mt-10">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">
                                {editingEvent ? 'Edit Event' : 'Create New Event'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white pb-1 w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center font-bold text-xl">
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {error && (
                                <div className="col-span-1 md:col-span-2 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Event Title *</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" placeholder="NEET 2026 Counseling Strategy" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">URL Slug *</label>
                                    <input required type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" placeholder="neet-2026-counseling-strategy" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                                        <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white [color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Time *</label>
                                        <input required type="text" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" placeholder="6:00 PM - 7:30 PM IST" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">About Speaker *</label>
                                    <textarea required value={formData.about_speaker} onChange={e => setFormData({ ...formData, about_speaker: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white h-24 resize-none text-sm" placeholder="Brief bio, expertise, and credentials..."></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                                        <select required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white">
                                            <option>Live Webinar</option>
                                            <option>Offline Seminar</option>
                                            <option>Workshop</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                                        <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white">
                                            <option>NEET Preparation</option>
                                            <option>Counseling Guide</option>
                                            <option>MBBS Abroad</option>
                                            <option>Career Guidance</option>
                                            <option>Study Tips</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-700 rounded-lg bg-slate-950/50 hover:bg-slate-800 transition-colors w-fit">
                                        <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                                        <span className="text-sm font-medium text-slate-200">Featured Event (Shows at top)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Speaker Name *</label>
                                        <input required type="text" value={formData.speaker} onChange={e => setFormData({ ...formData, speaker: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" placeholder="Dr. Rajesh Kumar" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Speaker Title *</label>
                                        <input required type="text" value={formData.speaker_title} onChange={e => setFormData({ ...formData, speaker_title: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" placeholder="Senior Counseling Expert" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Image Emoji/Icon *</label>
                                    <input required type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-center text-xl" placeholder="📚" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Short Description *</label>
                                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white h-20 resize-none text-sm" placeholder="Brief summary of the event..."></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Long Description *</label>
                                    <textarea required value={formData.long_description} onChange={e => setFormData({ ...formData, long_description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white h-32 resize-none text-sm" placeholder="Full detailed description..."></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Agenda (One per line)</label>
                                    <textarea value={formData.agendaString} onChange={e => setFormData({ ...formData, agendaString: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white h-24 resize-none text-sm" placeholder="Understanding AIQ vs State Quota&#10;Document Verification Checklist..."></textarea>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 pt-4 flex gap-3 -mx-6 px-6 border-t border-slate-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors">Cancel</button>
                                <button type="submit" disabled={actionLoading === "saving"} className="px-6 py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors ml-auto flex items-center gap-2">
                                    {actionLoading === "saving" ? "Saving..." : (editingEvent ? "Save Changes" : "Create Event")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
