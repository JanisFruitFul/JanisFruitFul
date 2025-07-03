"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiUrl } from "@/lib/config";
import { useState } from "react";

export default function TestBackendPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runAllTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Health check
      console.log('🧪 Test 1: Health check');
      const healthUrl = getApiUrl('health');
      const healthResponse = await fetch(healthUrl);
      const healthData = await healthResponse.json();
      results.health = { success: healthResponse.ok, data: healthData };

      // Test 2: Menu items
      console.log('🧪 Test 2: Menu items');
      const menuUrl = getApiUrl('api/menu');
      const menuResponse = await fetch(menuUrl);
      const menuData = await menuResponse.json();
      results.menu = { 
        success: menuResponse.ok, 
        count: menuData.length,
        sample: menuData[0] 
      };

      // Test 3: Customer search
      console.log('🧪 Test 3: Customer search');
      const customerUrl = getApiUrl('api/customers?phone=8309664356');
      const customerResponse = await fetch(customerUrl);
      const customerData = await customerResponse.json();
      results.customer = { 
        success: customerResponse.ok, 
        count: customerData.length,
        sample: customerData[0] ? {
          name: customerData[0].name,
          phone: customerData[0].phone,
          ordersCount: customerData[0].orders?.length || 0
        } : null
      };

      // Test 4: All customers
      console.log('🧪 Test 4: All customers');
      const allCustomersUrl = getApiUrl('api/customers');
      const allCustomersResponse = await fetch(allCustomersUrl);
      const allCustomersData = await allCustomersResponse.json();
      results.allCustomers = { 
        success: allCustomersResponse.ok, 
        count: allCustomersData.length
      };

      setTestResults(results);
      console.log('✅ All tests completed:', results);

    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backend API Test Suite</CardTitle>
          <CardDescription>
            Test all backend APIs to verify they're working and returning real database data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAllTests} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{testResults.error}</p>
                </div>
              ) : (
                <>
                  {testResults.health && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800">✅ Health Check</h3>
                      <p className="text-sm">Status: {testResults.health.success ? 'Success' : 'Failed'}</p>
                      <p className="text-sm">Data: {JSON.stringify(testResults.health.data)}</p>
                    </div>
                  )}

                  {testResults.menu && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800">🍽️ Menu Items</h3>
                      <p className="text-sm">Status: {testResults.menu.success ? 'Success' : 'Failed'}</p>
                      <p className="text-sm">Count: {testResults.menu.count} items</p>
                      {testResults.menu.sample && (
                        <p className="text-sm">Sample: {testResults.menu.sample.name} - ₹{testResults.menu.sample.price}</p>
                      )}
                    </div>
                  )}

                  {testResults.customer && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h3 className="font-semibold text-purple-800">👤 Customer Search</h3>
                      <p className="text-sm">Status: {testResults.customer.success ? 'Success' : 'Failed'}</p>
                      <p className="text-sm">Found: {testResults.customer.count} customers</p>
                      {testResults.customer.sample && (
                        <p className="text-sm">Sample: {testResults.customer.sample.name} ({testResults.customer.sample.phone}) - {testResults.customer.sample.ordersCount} orders</p>
                      )}
                    </div>
                  )}

                  {testResults.allCustomers && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-semibold text-orange-800">👥 All Customers</h3>
                      <p className="text-sm">Status: {testResults.allCustomers.success ? 'Success' : 'Failed'}</p>
                      <p className="text-sm">Total: {testResults.allCustomers.count} customers</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 