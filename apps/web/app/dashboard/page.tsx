import React from "react";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Dashboard!
        </h1>
        <p className="text-gray-600 mb-8">
          Your email has been successfully verified.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Account Created Successfully
          </h2>
          <p className="text-gray-600">
            You can now start using the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
