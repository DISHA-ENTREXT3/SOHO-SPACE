
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { UserRole, CompanyProfile, PartnerProfile } from '../types';
import { Navigate } from 'react-router-dom';
import { XCircleIcon, BuildingOffice2Icon, UserGroupIcon } from '../components/Icons';
import Avatar from '../components/Avatar';

type AdminTab = 'users' | 'founders' | 'partners';

const AdminPage = () => {
    const { user } = useAuth();
    const { 
        users,
        companies, 
        partners, 
        deleteCompany,
        deletePartner,
        updateUserRole
    } = useAppContext();
    
    const [activeTab, setActiveTab] = useState<AdminTab>('users');

    if (user?.role !== UserRole.ADMIN) {
        return <Navigate to="/dashboard" />;
    }



    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
            alert(result.message);
        } else {
            alert(result.message);
        }
    };



    const FoundersTab = () => (
        <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-6 rounded-3xl shadow-xl">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-[var(--glass-border)] text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
                        <th className="p-3">Company</th>
                        <th className="p-3">Location</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {companies.map(company => (
                        <tr key={company.id} className="text-[var(--text-primary)]">
                            <td className="p-3">
                                <div className="flex items-center">
                                    <Avatar src={company.logoUrl} name={company.name} size="sm" className="mr-3 rounded-md" />
                                    <span className="font-bold">{company.name}</span>
                                </div>
                            </td>
                            <td className="p-3 text-sm">{company.location}</td>

                            <td className="p-3 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    <button onClick={() => deleteCompany(company.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
                                        <XCircleIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const UsersTab = () => (
        <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-6 rounded-3xl shadow-xl">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Platform Users</h3>
                <span className="text-[10px] font-black px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                    {users.filter(u => u.role === UserRole.ADMIN).length}/5 Admins
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-[var(--glass-border)] text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
                            <th className="p-3">User</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Current Role</th>
                            <th className="p-3 text-right">Change Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--glass-border)]">
                        {users.map(u => (
                            <tr key={u.id} className="text-[var(--text-primary)]">
                                <td className="p-3">
                                    <div className="flex items-center">
                                        <Avatar src={u.avatarUrl} name={u.name} size="xs" className="mr-3" />
                                        <span className="font-bold">{u.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-xs text-[var(--text-secondary)]">{u.email}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        u.role === UserRole.ADMIN ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                        u.role === UserRole.FOUNDER ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <select 
                                        value={u.role} 
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                        disabled={u.id === user.id}
                                        className="text-[10px] font-black uppercase tracking-widest bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50 transition-all"
                                    >
                                        {Object.values(UserRole).map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );



    const PartnersTab = () => (
         <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-6 rounded-3xl shadow-xl">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-[var(--glass-border)] text-left text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
                        <th className="p-3">Partner</th>
                        <th className="p-3">Location</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                    {partners.map(partner => (
                        <tr key={partner.id} className="text-[var(--text-primary)]">
                            <td className="p-3">
                                <div className="flex items-center">
                                    <Avatar src={partner.avatarUrl} name={partner.name} size="sm" className="mr-3" />
                                    <span className="font-bold">{partner.name}</span>
                                </div>
                            </td>
                            <td className="p-3 text-sm">{partner.location}</td>

                            <td className="p-3 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    <button onClick={() => deletePartner(partner.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
                                        <XCircleIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    const tabContent = {
        users: <UsersTab />,
        founders: <FoundersTab />,
        partners: <PartnersTab />,
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">System Control</h1>
                <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-[0.2em] opacity-60">High-level management for Soho Space ecosystem</p>
            </div>
            
            <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--glass-border)] mb-10 overflow-x-auto w-fit">
                <TabButton icon={<UserGroupIcon className="h-4 w-4 mr-2"/>} label="Users" tabName="users" />
                <TabButton icon={<BuildingOffice2Icon className="h-4 w-4 mr-2"/>} label="Founders" tabName="founders" />
                <TabButton icon={<UserGroupIcon className="h-4 w-4 mr-2"/>} label="Partners" tabName="partners" />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {tabContent[activeTab]}
            </div>
        </div>
    );

    function TabButton({ icon, label, tabName }: {icon: React.ReactNode, label: string, tabName: AdminTab}) {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`flex items-center py-2.5 px-6 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-[var(--text-muted)] hover:text-indigo-500'
                }`}
            >
                {icon}
                {label}
            </button>
        );
    }
};

export default AdminPage;
