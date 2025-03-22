import React from 'react';

const FreelancerProfile = ({ user }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Freelancer Profile</h1>
      <div className="bg-white p-4 rounded shadow-md">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Skills:</strong> {user.skills?.join(', ') || "JavaScript, React, Node.js"}</p>
        <p><strong>Completed Projects:</strong> 12</p>
      </div>
    </div>
  );
};

export default FreelancerProfile;
