import React, { useState } from 'react';
import { api } from '../store/api';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('plans');
  const { data: plans, refetch: refetchPlans } = api.endpoints.getPlans.useQuery();
  const { data: stats } = api.endpoints.getSystemStats?.useQuery() || {};

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-dark">Admin Panel</h1>

        <div className="flex border-b mb-6">
          <button
            className={`px-6 py-3 ${activeTab === 'stats' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button
            className={`px-6 py-3 ${activeTab === 'plans' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
            onClick={() => setActiveTab('plans')}
          >
            Plans
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Total Users</h3>
              <p className="text-4xl font-bold text-primary">{stats?.totalUsers || 0}</p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Organizations</h3>
              <p className="text-4xl font-bold text-secondary">{stats?.totalOrganizations || 0}</p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Active Subscriptions</h3>
              <p className="text-4xl font-bold text-accent">{stats?.activeSubscriptions || 0}</p>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans?.map(plan => (
                <div key={plan._id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      plan.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <p className="text-3xl font-bold mb-4">
                    ${plan.price}
                    <span className="text-sm text-gray-600">/{plan.billingInterval}</span>
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="space-y-1 text-sm">
                    <div>Max Workflows: {plan.limits.maxWorkflows === -1 ? '∞' : plan.limits.maxWorkflows}</div>
                    <div>Active: {plan.limits.maxActiveWorkflows === -1 ? '∞' : plan.limits.maxActiveWorkflows}</div>
                    <div>Executions/mo: {plan.limits.maxExecutionsPerMonth === -1 ? '∞' : plan.limits.maxExecutionsPerMonth.toLocaleString()}</div>
                    <div>Concurrent: {plan.limits.maxConcurrentExecutions}</div>
                    <div>Trial: {plan.trialDays} days</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
