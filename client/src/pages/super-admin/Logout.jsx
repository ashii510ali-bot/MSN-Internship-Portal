
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../../lib/session";

function AdminLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutAdmin = () => {
      // Clear all saved login credentials
      clearSession();

      // Redirect to Login page
      window.location.replace("/login");
    };

    logoutAdmin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-gray-700 text-lg font-semibold">
          Logging out...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Redirecting to Login page...
        </p>
      </div>
    </div>
  );
}

export default AdminLogout;
