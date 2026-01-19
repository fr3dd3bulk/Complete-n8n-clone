import Role from '../models/Role.js';
import Plan from '../models/Plan.js';

/**
 * Seed default roles
 */
const seedRoles = async () => {
  try {
    console.log('🌱 Seeding roles...');

    const roles = [
      {
        name: 'Super Admin',
        key: 'super_admin',
        description: 'Full system access - can manage everything',
        permissions: [
          {
            resource: 'workflows',
            actions: ['create', 'read', 'update', 'delete', 'execute', 'publish'],
          },
          {
            resource: 'executions',
            actions: ['read', 'delete'],
          },
          {
            resource: 'credentials',
            actions: ['create', 'read', 'update', 'delete'],
          },
          {
            resource: 'members',
            actions: ['create', 'read', 'update', 'delete'],
          },
          {
            resource: 'billing',
            actions: ['read', 'update'],
          },
          {
            resource: 'settings',
            actions: ['read', 'update'],
          },
          {
            resource: 'nodes',
            actions: ['create', 'read', 'update', 'delete', 'publish'],
          },
          {
            resource: 'plans',
            actions: ['create', 'read', 'update', 'delete', 'publish'],
          },
        ],
        isSystemRole: true,
      },
      {
        name: 'Organization Owner',
        key: 'org_owner',
        description: 'Organization owner - can manage organization settings and members',
        permissions: [
          {
            resource: 'workflows',
            actions: ['create', 'read', 'update', 'delete', 'execute', 'publish'],
          },
          {
            resource: 'executions',
            actions: ['read', 'delete'],
          },
          {
            resource: 'credentials',
            actions: ['create', 'read', 'update', 'delete'],
          },
          {
            resource: 'members',
            actions: ['create', 'read', 'update', 'delete'],
          },
          {
            resource: 'billing',
            actions: ['read', 'update'],
          },
          {
            resource: 'settings',
            actions: ['read', 'update'],
          },
        ],
        isSystemRole: true,
      },
      {
        name: 'Organization Admin',
        key: 'org_admin',
        description: 'Organization admin - can manage workflows and members',
        permissions: [
          {
            resource: 'workflows',
            actions: ['create', 'read', 'update', 'delete', 'execute', 'publish'],
          },
          {
            resource: 'executions',
            actions: ['read'],
          },
          {
            resource: 'credentials',
            actions: ['create', 'read', 'update', 'delete'],
          },
          {
            resource: 'members',
            actions: ['create', 'read'],
          },
          {
            resource: 'settings',
            actions: ['read'],
          },
        ],
        isSystemRole: true,
      },
      {
        name: 'Organization Member',
        key: 'org_member',
        description: 'Organization member - can create and execute workflows',
        permissions: [
          {
            resource: 'workflows',
            actions: ['create', 'read', 'update', 'execute'],
          },
          {
            resource: 'executions',
            actions: ['read'],
          },
          {
            resource: 'credentials',
            actions: ['create', 'read', 'update'],
          },
        ],
        isSystemRole: true,
      },
      {
        name: 'Organization Viewer',
        key: 'org_viewer',
        description: 'Organization viewer - read-only access',
        permissions: [
          {
            resource: 'workflows',
            actions: ['read'],
          },
          {
            resource: 'executions',
            actions: ['read'],
          },
        ],
        isSystemRole: true,
      },
    ];

    for (const role of roles) {
      const existing = await Role.findOne({ key: role.key });
      if (!existing) {
        await Role.create(role);
        console.log(`✅ Created role: ${role.name}`);
      }
    }

    console.log('✅ Roles seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed roles:', error);
  }
};

/**
 * Seed default plans
 */
const seedPlans = async () => {
  try {
    console.log('🌱 Seeding plans...');

    const plans = [
      {
        name: 'Free',
        key: 'free',
        description: 'Perfect for getting started',
        price: {
          monthly: 0,
          yearly: 0,
          currency: 'USD',
        },
        limits: {
          maxWorkflows: 5,
          maxActiveWorkflows: 2,
          maxExecutionsPerMonth: 100,
          maxConcurrentExecutions: 1,
          maxNodesPerWorkflow: 10,
          maxTriggersPerWorkflow: 1,
          executionTimeout: 60, // 1 minute
          retentionDays: 7,
        },
        features: [
          { key: 'basic_nodes', name: 'Basic Nodes', enabled: true },
          { key: 'webhook_triggers', name: 'Webhook Triggers', enabled: true },
          { key: 'manual_triggers', name: 'Manual Triggers', enabled: true },
          { key: 'email_support', name: 'Email Support', enabled: false },
        ],
        isPublished: true,
        isActive: true,
        trialDays: 0,
        sortOrder: 1,
      },
      {
        name: 'Starter',
        key: 'starter',
        description: 'Great for small teams',
        price: {
          monthly: 19,
          yearly: 190,
          currency: 'USD',
        },
        limits: {
          maxWorkflows: 25,
          maxActiveWorkflows: 10,
          maxExecutionsPerMonth: 5000,
          maxConcurrentExecutions: 5,
          maxNodesPerWorkflow: 50,
          maxTriggersPerWorkflow: 3,
          executionTimeout: 300, // 5 minutes
          retentionDays: 30,
        },
        features: [
          { key: 'all_nodes', name: 'All Node Types', enabled: true },
          { key: 'webhook_triggers', name: 'Webhook Triggers', enabled: true },
          { key: 'schedule_triggers', name: 'Schedule Triggers', enabled: true },
          { key: 'email_support', name: 'Email Support', enabled: true },
          { key: 'ai_nodes', name: 'AI/LLM Nodes', enabled: false },
        ],
        isPublished: true,
        isActive: true,
        trialDays: 14,
        sortOrder: 2,
      },
      {
        name: 'Pro',
        key: 'pro',
        description: 'For growing businesses',
        price: {
          monthly: 99,
          yearly: 990,
          currency: 'USD',
        },
        limits: {
          maxWorkflows: 100,
          maxActiveWorkflows: 50,
          maxExecutionsPerMonth: 50000,
          maxConcurrentExecutions: 20,
          maxNodesPerWorkflow: 200,
          maxTriggersPerWorkflow: 10,
          executionTimeout: 600, // 10 minutes
          retentionDays: 90,
        },
        features: [
          { key: 'all_nodes', name: 'All Node Types', enabled: true },
          { key: 'webhook_triggers', name: 'Webhook Triggers', enabled: true },
          { key: 'schedule_triggers', name: 'Schedule Triggers', enabled: true },
          { key: 'email_support', name: 'Priority Email Support', enabled: true },
          { key: 'ai_nodes', name: 'AI/LLM Nodes', enabled: true },
          { key: 'error_workflows', name: 'Error Workflows', enabled: true },
          { key: 'version_history', name: 'Version History', enabled: true },
        ],
        isPublished: true,
        isActive: true,
        trialDays: 14,
        sortOrder: 3,
      },
      {
        name: 'Enterprise',
        key: 'enterprise',
        description: 'For large organizations',
        price: {
          monthly: 499,
          yearly: 4990,
          currency: 'USD',
        },
        limits: {
          maxWorkflows: -1, // Unlimited
          maxActiveWorkflows: -1, // Unlimited
          maxExecutionsPerMonth: -1, // Unlimited
          maxConcurrentExecutions: 100,
          maxNodesPerWorkflow: -1, // Unlimited
          maxTriggersPerWorkflow: -1, // Unlimited
          executionTimeout: 3600, // 1 hour
          retentionDays: 365,
        },
        features: [
          { key: 'all_nodes', name: 'All Node Types', enabled: true },
          { key: 'unlimited_everything', name: 'Unlimited Everything', enabled: true },
          { key: 'webhook_triggers', name: 'Webhook Triggers', enabled: true },
          { key: 'schedule_triggers', name: 'Schedule Triggers', enabled: true },
          { key: 'email_support', name: 'Priority Email Support', enabled: true },
          { key: 'phone_support', name: 'Phone Support', enabled: true },
          { key: 'ai_nodes', name: 'AI/LLM Nodes', enabled: true },
          { key: 'error_workflows', name: 'Error Workflows', enabled: true },
          { key: 'version_history', name: 'Version History', enabled: true },
          { key: 'sla', name: '99.9% SLA', enabled: true },
          { key: 'dedicated_support', name: 'Dedicated Support Engineer', enabled: true },
        ],
        isPublished: true,
        isActive: true,
        trialDays: 30,
        sortOrder: 4,
      },
    ];

    for (const plan of plans) {
      const existing = await Plan.findOne({ key: plan.key });
      if (!existing) {
        await Plan.create(plan);
        console.log(`✅ Created plan: ${plan.name}`);
      } else {
        // Update existing plan
        await Plan.updateOne({ key: plan.key }, plan);
        console.log(`✅ Updated plan: ${plan.name}`);
      }
    }

    console.log('✅ Plans seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed plans:', error);
  }
};

/**
 * Seed all system data
 */
const seedSystemData = async () => {
  await seedRoles();
  await seedPlans();
};

export { seedRoles, seedPlans, seedSystemData };
export default seedSystemData;
