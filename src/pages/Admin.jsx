import React from 'react';
import AdminIdeaList from '../components/admin/AdminIdeaList';
import Navbar from '../components/Navbar';
import AdminHeader from '../components/admin/AdminHeader';

const Admin = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-20">
        <AdminHeader />
        <div className="flex justify-center mt-8"> {/* Center the content horizontally */}
          <div className="w-3/4"> {/* Take up 75% of the width */}
            <div className="p-4 rounded shadow-lg">
              <AdminIdeaList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
