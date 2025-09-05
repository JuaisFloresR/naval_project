'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import DataForm from '@/components/DataForm';
import ExcelImport from '@/components/ExcelImport';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { User, FormData } from '@/types';

// Sample data
const initialUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role: 'admin',
    status: 'active',
    joinDate: '2023-01-15',
    department: 'engineering',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    role: 'manager',
    status: 'active',
    joinDate: '2023-02-20',
    department: 'marketing',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    role: 'employee',
    status: 'inactive',
    joinDate: '2023-03-10',
    department: 'sales',
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    role: 'contractor',
    status: 'active',
    joinDate: '2023-04-05',
    department: 'finance',
  },
];

export default function Home() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleAddUser = (formData: FormData) => {
    const newUser: User = {
      id: Date.now().toString(),
      ...formData,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setShowAddUserForm(false); // Hide form after adding user
  };

  const handleExcelImport = (importedUsers: User[]) => {
    setUsers([...users, ...importedUsers]);
    setShowExcelImport(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
      )}>
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your team members and their information
              </p>
            </div>

            {/* Add User Button */}
            <div className="mb-6">
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowAddUserForm(!showAddUserForm);
                    setShowExcelImport(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showAddUserForm ? 'Cancel' : 'Add New User'}
                </Button>
                <Button
                  onClick={() => {
                    setShowExcelImport(!showExcelImport);
                    setShowAddUserForm(false);
                  }}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showExcelImport ? 'Cancel Import' : 'Import from Excel'}
                </Button>
              </div>
            </div>

            {/* Excel Import - Conditionally rendered */}
            {showExcelImport && (
              <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
                <ExcelImport onImport={handleExcelImport} />
              </div>
            )}

            {/* Data Form - Conditionally rendered */}
            {showAddUserForm && (
              <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
                <DataForm onSubmit={handleAddUser} />
              </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Users ({users.length})
                </h2>
              </div>
              <div className="p-6">
                <DataTable data={users} onDelete={handleDeleteUser} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}