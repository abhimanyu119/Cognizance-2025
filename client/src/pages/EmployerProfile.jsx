import React from 'react';

const EmployerProfile = ({ user }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Employer Profile</h1>
      <div className="bg-white p-4 rounded shadow-md">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Company:</strong> {user.company || "Your Company Name"}</p>
        <p><strong>Posted Projects:</strong> 5</p>
      </div>
    </div>
  );
};

export default EmployerProfile;
