import 'dotenv/config';
import { Queue, Worker } from 'bullmq';
import connectDB from '../config/database.js';
import { getRedisConnection } from '../config/redis.js';
import Workflow from '../models/Workflow.js';
import Execution from '../models/Execution.js';
import executionEngine from '../engine/executionEngine.js';

const QUEUE_NAME = 'workflow-executions';
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY) || 10;

/**
 * Standalone Worker Service for Processing Workflow Executions
 */
class WorkerService {
  constructor() {
    this.worker = null;
    this.connection = null;
  }

  async start() {
    try {
      console.log('🚀 Starting Workflow Worker Service...\n');

      // Connect to MongoDB
      await connectDB();

      // Get Redis connection
      this.connection = await getRedisConnection();

      // Create worker
      this.worker = new Worker(
        QUEUE_NAME,
        async (job) => {
          return await this.processJob(job);
        },
        {
          connection: this.connection,
          concurrency: CONCURRENCY,
          limiter: {
            max: 100,
            duration: 1000, // 100 jobs per second max
          },
        }
      );

      // Worker event handlers
      this.worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed successfully`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job.id} failed:`, err.message);
      });

      this.worker.on('error', (err) => {
        console.error('Worker error:', err);
      });

      console.log(`✅ Worker started with concurrency: ${CONCURRENCY}`);
      console.log(`📋 Listening for jobs on queue: ${QUEUE_NAME}\n`);

    } catch (error) {
      console.error('❌ Failed to start worker:', error);
      process.exit(1);
    }
  }

  /**
   * Process a workflow execution job
   */
  async processJob(job) {
    const { workflowId, triggerData, executionId } = job.data;

    try {
      console.log(`\n🔄 Processing workflow execution: ${executionId}`);

      // Get workflow
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Get execution record
      const execution = await Execution.findById(executionId);
      if (!execution) {
        throw new Error(`Execution record not found: ${executionId}`);
      }

      // Update execution status to running
      execution.status = 'running';
      execution.startedAt = new Date();
      await execution.save();

      // Execute workflow
      const result = await executionEngine.executeWorkflow(workflow, triggerData, executionId);

      // Update execution record
      execution.status = result.success ? 'success' : 'failed';
      execution.stoppedAt = new Date();
      execution.duration = result.duration;
      execution.nodeResults = result.results;

      if (!result.success && result.errors?.length > 0) {
        execution.error = {
          message: result.errors[0].error,
          nodeId: result.errors[0].nodeId,
        };
      }

      await execution.save();

      // Update workflow stats
      workflow.executionCount += 1;
      workflow.lastExecutedAt = new Date();
      workflow.lastExecutionStatus = result.success ? 'success' : 'error';
      await workflow.save();

      console.log(`✅ Workflow execution completed: ${executionId}`);

      return result;

    } catch (error) {
      console.error(`❌ Job processing failed:`, error);

      // Update execution record
      try {
        const execution = await Execution.findById(executionId);
        if (execution) {
          execution.status = 'failed';
          execution.stoppedAt = new Date();
          execution.error = {
            message: error.message,
            stack: error.stack,
          };
          await execution.save();
        }
      } catch (updateError) {
        console.error('Failed to update execution record:', updateError);
      }

      throw error;
    }
  }

  async stop() {
    console.log('\n⚠️  Shutting down worker...');
    
    if (this.worker) {
      await this.worker.close();
    }

    if (this.connection) {
      await this.connection.quit();
    }

    console.log('✅ Worker shut down gracefully');
  }
}

// Create and start worker
const workerService = new WorkerService();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await workerService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await workerService.stop();
  process.exit(0);
});

// Start worker
workerService.start();

export default workerService;
