import React, { useState, useEffect } from 'react';
import { healthAPI } from '../services/api';

const HealthTest = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testHealthAPI = async () => {
      try {
        console.log('Testing healthAPI.checkServices()...');
        const response = await healthAPI.checkServices();
        console.log('Health API Response:', response);
        setHealthStatus(response.data);
        setError(null);
      } catch (err) {
        console.error('Health API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testHealthAPI();
  }, []);

  if (loading) return <div className="p-4">Loading health status...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Health API Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {healthStatus && (
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Health API is working!
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Services Status:</h2>
            <div className="space-y-2">
              {Object.entries(healthStatus.services || {}).map(([name, info]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{name} Service</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    info.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {info.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Raw Response:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(healthStatus, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTest;
