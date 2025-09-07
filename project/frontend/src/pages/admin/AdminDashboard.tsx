import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Users, Package, BarChart3 } from 'lucide-react';
import AdminOverview from './AdminOverview';
import PendingApps from './PendingApps';
import UserManagement from './UserManagement';

const AdminDashboard: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Pending Apps', href: '/admin/pending', icon: Package },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href !== '/admin' && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="pending" element={<PendingApps />} />
            <Route path="users" element={<UserManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;