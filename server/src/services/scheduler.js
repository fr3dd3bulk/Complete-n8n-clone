import 'dotenv/config';
import { CronJob } from 'cron';
import { Queue } from 'bullmq';
import connectDB from '../config/database.js';
import { getRedisConnection } from '../config/redis.js';
import Workflow from '../models/Workflow.js';
import Execution from '../models/Execution.js';

/**
 * Standalone Scheduler Service for Cron-based Workflow Triggers
 */
class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.queue = null;
    this.connection = null;
  }

  async start() {
    try {
      console.log('🚀 Starting Scheduler Service...\n');

      // Connect to MongoDB
      await connectDB();

      // Get Redis connection
      this.connection = await getRedisConnection();

      // Create queue
      this.queue = new Queue('workflow-executions', {
        connection: this.connection,
      });

      // Load and schedule all active workflows with cron triggers
      await this.loadScheduledWorkflows();

      // Watch for workflow changes (simplified - in production use change streams)
      setInterval(() => this.loadScheduledWorkflows(), 60000); // Check every minute

      console.log('✅ Scheduler started successfully\n');

    } catch (error) {
      console.error('❌ Failed to start scheduler:', error);
      process.exit(1);
    }
  }

  /**
   * Load and schedule all active workflows with cron triggers
   */
  async loadScheduledWorkflows() {
    try {
      const workflows = await Workflow.find({
        active: true,
        'triggers.type': 'schedule',
        'triggers.isActive': true,
      });

      console.log(`📋 Found ${workflows.length} scheduled workflows`);

      for (const workflow of workflows) {
        for (const trigger of workflow.triggers) {
          if (trigger.type === 'schedule' && trigger.isActive) {
            this.scheduleWorkflow(workflow, trigger);
          }
        }
      }

    } catch (error) {
      console.error('Failed to load scheduled workflows:', error);
    }
  }

  /**
   * Schedule a workflow with cron trigger
   */
  scheduleWorkflow(workflow, trigger) {
    const jobKey = `${workflow._id}-${trigger.nodeId}`;

    // Stop existing job if any
    if (this.jobs.has(jobKey)) {
      this.jobs.get(jobKey).stop();
    }

    const cronPattern = trigger.config?.cron || '0 0 * * *'; // Default: daily at midnight

    try {
      const job = new CronJob(
        cronPattern,
        async () => {
          await this.triggerWorkflow(workflow, trigger);
        },
        null,
        true,
        trigger.config?.timezone || 'UTC'
      );

      this.jobs.set(jobKey, job);
      console.log(`⏰ Scheduled workflow: ${workflow.name} (${cronPattern})`);

    } catch (error) {
      console.error(`Failed to schedule workflow ${workflow.name}:`, error);
    }
  }

  /**
   * Trigger a scheduled workflow execution
   */
  async triggerWorkflow(workflow, trigger) {
    try {
      console.log(`\n⏰ Triggering scheduled workflow: ${workflow.name}`);

      // Create execution record
      const execution = await Execution.create({
        workflowId: workflow._id,
        orgId: workflow.orgId,
        triggeredBy: 'schedule',
        status: 'queued',
        mode: 'production',
        triggerData: {
          trigger: 'schedule',
          cron: trigger.config?.cron,
          triggeredAt: new Date(),
        },
      });

      // Add job to queue
      await this.queue.add(
        'execute-workflow',
        {
          workflowId: workflow._id.toString(),
          triggerData: execution.triggerData,
          executionId: execution._id.toString(),
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );

      console.log(`✅ Queued execution: ${execution._id}`);

    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  async stop() {
    console.log('\n⚠️  Shutting down scheduler...');

    for (const [key, job] of this.jobs.entries()) {
      job.stop();
    }

    if (this.queue) {
      await this.queue.close();
    }

    if (this.connection) {
      await this.connection.quit();
    }

    console.log('✅ Scheduler shut down gracefully');
  }
}

// Create and start scheduler
const schedulerService = new SchedulerService();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await schedulerService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await schedulerService.stop();
  process.exit(0);
});

// Start scheduler
schedulerService.start();

export default schedulerService;
