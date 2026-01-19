
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
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        <th className="p-3">Company</th>
                        <th className="p-3">Location</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {companies.map(company => (
                        <tr key={company.id} className="text-gray-200">
                            <td className="p-3">
                                <div className="flex items-center">
                                    <Avatar src={company.logoUrl} name={company.name} size="sm" className="mr-3 rounded-md" />
                                    <span className="font-semibold">{company.name}</span>
                                </div>
                            </td>
                            <td className="p-3">{company.location}</td>

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
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Platform Users</h3>
                <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    {users.filter(u => u.role === UserRole.ADMIN).length}/5 Admins
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            <th className="p-3">User</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Current Role</th>
                            <th className="p-3 text-right">Change Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {users.map(u => (
                            <tr key={u.id} className="text-gray-200">
                                <td className="p-3">
                                    <div className="flex items-center">
                                        <Avatar src={u.avatarUrl} name={u.name} size="xs" className="mr-3" />
                                        <span className="font-medium">{u.name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-sm text-gray-400">{u.email}</td>
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
                                        className="text-xs bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
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
         <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        <th className="p-3">Partner</th>
                        <th className="p-3">Location</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {partners.map(partner => (
                        <tr key={partner.id} className="text-gray-200">
                            <td className="p-3">
                                <div className="flex items-center">
                                    <Avatar src={partner.avatarUrl} name={partner.name} size="sm" className="mr-3" />
                                    <span className="font-semibold">{partner.name}</span>
                                </div>
                            </td>
                            <td className="p-3">{partner.location}</td>

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
            <h1 className="text-3xl font-bold text-white mb-6">Admin Portal</h1>
            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                <TabButton icon={<UserGroupIcon className="h-5 w-5 mr-2"/>} label="Users" tabName="users" />
                <TabButton icon={<BuildingOffice2Icon className="h-5 w-5 mr-2"/>} label="Founders" tabName="founders" />
                <TabButton icon={<UserGroupIcon className="h-5 w-5 mr-2"/>} label="Partners" tabName="partners" />
            </div>

            <div>
                {tabContent[activeTab]}
            </div>
        </div>
    );

    function TabButton({ icon, label, tabName }: {icon: React.ReactNode, label: string, tabName: AdminTab}) {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 transition ${
                    isActive
                        ? 'border-indigo-400 text-indigo-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
            >
                {icon}
                {label}
            </button>
        );
    }
};

export default AdminPage;
