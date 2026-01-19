import NodeDefinition from '../models/NodeDefinition.js';

/**
 * Enterprise Node Definitions Seeder
 * Creates 20+ production-ready node types
 */
const nodeDefinitions = [
  // ==================== TRIGGER NODES ====================
  {
    key: 'trigger-webhook',
    name: 'Webhook Trigger',
    version: 1,
    category: 'trigger',
    type: 'trigger',
    shape: 'circle',
    color: '#3B82F6',
    icon: 'webhook',
    description: 'Trigger workflow when webhook is called',
    inputSchema: [
      {
        key: 'method',
        type: 'select',
        label: 'HTTP Method',
        required: true,
        default: 'POST',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' },
          { value: 'DELETE', label: 'DELETE' },
        ],
      },
      {
        key: 'authentication',
        type: 'select',
        label: 'Authentication',
        required: false,
        default: 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'header', label: 'Header Auth' },
        ],
      },
    ],
    outputSchema: [
      { key: 'body', type: 'object', description: 'Request body' },
      { key: 'headers', type: 'object', description: 'Request headers' },
      { key: 'query', type: 'object', description: 'Query parameters' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://trigger/webhook',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'trigger-schedule',
    name: 'Schedule Trigger',
    version: 1,
    category: 'trigger',
    type: 'trigger',
    shape: 'circle',
    color: '#8B5CF6',
    icon: 'clock',
    description: 'Trigger workflow on a schedule (cron)',
    inputSchema: [
      {
        key: 'cron',
        type: 'text',
        label: 'Cron Expression',
        required: true,
        placeholder: '0 0 * * *',
        helpText: '5 fields: minute hour day month weekday',
      },
      {
        key: 'timezone',
        type: 'select',
        label: 'Timezone',
        required: false,
        default: 'UTC',
        options: [
          { value: 'UTC', label: 'UTC' },
          { value: 'America/New_York', label: 'Eastern Time' },
          { value: 'America/Los_Angeles', label: 'Pacific Time' },
          { value: 'Europe/London', label: 'London' },
        ],
      },
    ],
    outputSchema: [
      { key: 'timestamp', type: 'string', description: 'Execution timestamp' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://trigger/schedule',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'trigger-manual',
    name: 'Manual Trigger',
    version: 1,
    category: 'trigger',
    type: 'trigger',
    shape: 'circle',
    color: '#10B981',
    icon: 'play',
    description: 'Manually trigger workflow execution',
    inputSchema: [],
    outputSchema: [
      { key: 'timestamp', type: 'string', description: 'Execution timestamp' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://trigger/manual',
    },
    isSystem: true,
    isPublished: true,
  },

  // ==================== ACTION NODES ====================
  {
    key: 'action-http-request',
    name: 'HTTP Request',
    version: 1,
    category: 'action',
    type: 'action',
    shape: 'rectangle',
    color: '#F59E0B',
    icon: 'globe',
    description: 'Make an HTTP request to any API',
    inputSchema: [
      {
        key: 'method',
        type: 'select',
        label: 'Method',
        required: true,
        default: 'GET',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' },
          { value: 'DELETE', label: 'DELETE' },
        ],
      },
      {
        key: 'url',
        type: 'text',
        label: 'URL',
        required: true,
        placeholder: 'https://api.example.com/endpoint',
      },
      {
        key: 'headers',
        type: 'textarea',
        label: 'Headers (JSON)',
        required: false,
        placeholder: '{"Content-Type": "application/json"}',
      },
      {
        key: 'body',
        type: 'textarea',
        label: 'Body (JSON)',
        required: false,
        placeholder: '{"key": "value"}',
      },
    ],
    outputSchema: [
      { key: 'status', type: 'number', description: 'HTTP status code' },
      { key: 'data', type: 'object', description: 'Response data' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://http/request',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'action-send-email',
    name: 'Send Email',
    version: 1,
    category: 'communication',
    type: 'action',
    shape: 'rectangle',
    color: '#EF4444',
    icon: 'mail',
    description: 'Send email via SMTP',
    inputSchema: [
      {
        key: 'to',
        type: 'text',
        label: 'To',
        required: true,
        placeholder: 'recipient@example.com',
      },
      {
        key: 'subject',
        type: 'text',
        label: 'Subject',
        required: true,
      },
      {
        key: 'body',
        type: 'textarea',
        label: 'Body',
        required: true,
      },
      {
        key: 'from',
        type: 'text',
        label: 'From',
        required: false,
        placeholder: 'sender@example.com',
      },
    ],
    outputSchema: [
      { key: 'messageId', type: 'string', description: 'Email message ID' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://email/send',
    },
    credentialTypes: ['smtp', 'email_provider'],
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'action-send-sms',
    name: 'Send SMS',
    version: 1,
    category: 'communication',
    type: 'action',
    shape: 'rectangle',
    color: '#06B6D4',
    icon: 'message-square',
    description: 'Send SMS via Twilio or similar provider',
    inputSchema: [
      {
        key: 'to',
        type: 'text',
        label: 'To Phone Number',
        required: true,
        placeholder: '+1234567890',
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
      },
    ],
    outputSchema: [
      { key: 'sid', type: 'string', description: 'Message SID' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://sms/send',
    },
    credentialTypes: ['twilio', 'sms_provider'],
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'action-database-query',
    name: 'Database Query',
    version: 1,
    category: 'database',
    type: 'action',
    shape: 'rectangle',
    color: '#8B5CF6',
    icon: 'database',
    description: 'Execute MongoDB query',
    inputSchema: [
      {
        key: 'collection',
        type: 'text',
        label: 'Collection',
        required: true,
      },
      {
        key: 'operation',
        type: 'select',
        label: 'Operation',
        required: true,
        options: [
          { value: 'find', label: 'Find' },
          { value: 'findOne', label: 'Find One' },
          { value: 'insert', label: 'Insert' },
          { value: 'update', label: 'Update' },
          { value: 'delete', label: 'Delete' },
        ],
      },
      {
        key: 'query',
        type: 'textarea',
        label: 'Query (JSON)',
        required: false,
        placeholder: '{"status": "active"}',
      },
    ],
    outputSchema: [
      { key: 'results', type: 'array', description: 'Query results' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://database/query',
    },
    credentialTypes: ['mongodb'],
    isSystem: true,
    isPublished: true,
  },

  // ==================== AI/LLM NODES ====================
  {
    key: 'action-openai-chat',
    name: 'OpenAI Chat',
    version: 1,
    category: 'ai',
    type: 'action',
    shape: 'rectangle',
    color: '#10B981',
    icon: 'brain',
    description: 'Chat with OpenAI GPT models',
    inputSchema: [
      {
        key: 'model',
        type: 'select',
        label: 'Model',
        required: true,
        default: 'gpt-3.5-turbo',
        options: [
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        ],
      },
      {
        key: 'prompt',
        type: 'textarea',
        label: 'Prompt',
        required: true,
        placeholder: 'Enter your prompt here...',
      },
      {
        key: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        default: 0.7,
      },
    ],
    outputSchema: [
      { key: 'response', type: 'string', description: 'AI response' },
    ],
    apiConfig: {
      method: 'POST',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': 'Bearer {{credentials.apiKey}}',
        'Content-Type': 'application/json',
      },
      bodyTemplate: {
        model: '{{input.model}}',
        messages: [{ role: 'user', content: '{{input.prompt}}' }],
        temperature: '{{input.temperature}}',
      },
    },
    credentialTypes: ['openai'],
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'action-text-summarize',
    name: 'Summarize Text',
    version: 1,
    category: 'ai',
    type: 'action',
    shape: 'rectangle',
    color: '#14B8A6',
    icon: 'file-text',
    description: 'Summarize text using AI',
    inputSchema: [
      {
        key: 'text',
        type: 'textarea',
        label: 'Text to Summarize',
        required: true,
      },
      {
        key: 'length',
        type: 'select',
        label: 'Summary Length',
        required: false,
        default: 'medium',
        options: [
          { value: 'short', label: 'Short' },
          { value: 'medium', label: 'Medium' },
          { value: 'long', label: 'Long' },
        ],
      },
    ],
    outputSchema: [
      { key: 'summary', type: 'string', description: 'Summarized text' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://ai/summarize',
    },
    credentialTypes: ['openai', 'anthropic'],
    isSystem: true,
    isPublished: true,
  },

  // ==================== CONDITION & FLOW NODES ====================
  {
    key: 'condition-if',
    name: 'IF Condition',
    version: 1,
    category: 'condition',
    type: 'condition',
    shape: 'diamond',
    color: '#F59E0B',
    icon: 'git-branch',
    description: 'Branch workflow based on condition',
    inputSchema: [
      {
        key: 'condition',
        type: 'text',
        label: 'Condition',
        required: true,
        placeholder: '{{$node.previous.status}} === "success"',
      },
    ],
    outputSchema: [
      { key: 'result', type: 'boolean', description: 'Condition result' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://if',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'condition-switch',
    name: 'Switch',
    version: 1,
    category: 'condition',
    type: 'condition',
    shape: 'diamond',
    color: '#EC4899',
    icon: 'git-branch',
    description: 'Multi-way branch based on value',
    inputSchema: [
      {
        key: 'value',
        type: 'text',
        label: 'Value to Check',
        required: true,
      },
      {
        key: 'cases',
        type: 'textarea',
        label: 'Cases (JSON)',
        required: true,
        placeholder: '[{"value": "case1", "path": "path1"}]',
      },
    ],
    outputSchema: [
      { key: 'path', type: 'string', description: 'Selected path' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://switch',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'utility-split',
    name: 'Split',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'hexagon',
    color: '#6366F1',
    icon: 'split',
    description: 'Split execution into parallel branches',
    inputSchema: [
      {
        key: 'branches',
        type: 'number',
        label: 'Number of Branches',
        required: true,
        default: 2,
      },
    ],
    outputSchema: [
      { key: 'branches', type: 'number', description: 'Branch count' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://split',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'utility-merge',
    name: 'Merge',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'hexagon',
    color: '#8B5CF6',
    icon: 'merge',
    description: 'Merge parallel branches',
    inputSchema: [],
    outputSchema: [
      { key: 'merged', type: 'object', description: 'Merged data' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://merge',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'utility-loop',
    name: 'Loop',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'hexagon',
    color: '#10B981',
    icon: 'repeat',
    description: 'Loop over items',
    inputSchema: [
      {
        key: 'items',
        type: 'textarea',
        label: 'Items (JSON Array)',
        required: true,
        placeholder: '["item1", "item2", "item3"]',
      },
    ],
    outputSchema: [
      { key: 'results', type: 'array', description: 'Loop results' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://loop',
    },
    isSystem: true,
    isPublished: true,
  },

  // ==================== UTILITY NODES ====================
  {
    key: 'utility-wait',
    name: 'Wait/Delay',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'rectangle',
    color: '#64748B',
    icon: 'clock',
    description: 'Wait for specified duration',
    inputSchema: [
      {
        key: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        required: true,
        default: 5,
      },
    ],
    outputSchema: [
      { key: 'waited', type: 'number', description: 'Duration waited' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://wait',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'utility-set',
    name: 'Set Variables',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'rectangle',
    color: '#0EA5E9',
    icon: 'edit',
    description: 'Set or transform variables',
    inputSchema: [
      {
        key: 'values',
        type: 'textarea',
        label: 'Values (JSON)',
        required: true,
        placeholder: '{"key": "value"}',
      },
    ],
    outputSchema: [
      { key: 'values', type: 'object', description: 'Set values' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://set',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'utility-javascript',
    name: 'JavaScript Code',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'rectangle',
    color: '#F59E0B',
    icon: 'code',
    description: 'Execute JavaScript code (sandboxed)',
    inputSchema: [
      {
        key: 'code',
        type: 'code',
        label: 'JavaScript Code',
        required: true,
        placeholder: 'return { result: input.value * 2 };',
      },
    ],
    outputSchema: [
      { key: 'result', type: 'any', description: 'Code execution result' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://javascript',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'utility-json-parse',
    name: 'Parse JSON',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'rectangle',
    color: '#8B5CF6',
    icon: 'braces',
    description: 'Parse JSON string',
    inputSchema: [
      {
        key: 'json',
        type: 'textarea',
        label: 'JSON String',
        required: true,
      },
    ],
    outputSchema: [
      { key: 'parsed', type: 'object', description: 'Parsed object' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://json/parse',
    },
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'utility-formatter',
    name: 'Format Data',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'rectangle',
    color: '#06B6D4',
    icon: 'align-left',
    description: 'Format and transform data',
    inputSchema: [
      {
        key: 'input',
        type: 'textarea',
        label: 'Input Data',
        required: true,
      },
      {
        key: 'format',
        type: 'select',
        label: 'Output Format',
        required: true,
        options: [
          { value: 'json', label: 'JSON' },
          { value: 'csv', label: 'CSV' },
          { value: 'xml', label: 'XML' },
        ],
      },
    ],
    outputSchema: [
      { key: 'formatted', type: 'string', description: 'Formatted data' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://formatter',
    },
    isSystem: true,
    isPublished: true,
  },

  // ==================== STORAGE NODES ====================
  {
    key: 'action-file-upload',
    name: 'Upload File',
    version: 1,
    category: 'storage',
    type: 'action',
    shape: 'rectangle',
    color: '#F59E0B',
    icon: 'upload',
    description: 'Upload file to cloud storage',
    inputSchema: [
      {
        key: 'file',
        type: 'file',
        label: 'File',
        required: true,
      },
      {
        key: 'path',
        type: 'text',
        label: 'Path',
        required: true,
        placeholder: 'folder/filename.ext',
      },
    ],
    outputSchema: [
      { key: 'url', type: 'string', description: 'File URL' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://storage/upload',
    },
    credentialTypes: ['aws_s3', 'gcp_storage', 'azure_storage'],
    isSystem: true,
    isPublished: true,
  },

  // ==================== SOCIAL MEDIA NODES ====================
  {
    key: 'action-slack-send',
    name: 'Slack - Send Message',
    version: 1,
    category: 'social',
    type: 'action',
    shape: 'rectangle',
    color: '#4A154B',
    icon: 'message-square',
    description: 'Send message to Slack channel',
    inputSchema: [
      {
        key: 'channel',
        type: 'text',
        label: 'Channel',
        required: true,
        placeholder: '#general',
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
      },
    ],
    outputSchema: [
      { key: 'ts', type: 'string', description: 'Message timestamp' },
    ],
    apiConfig: {
      method: 'POST',
      url: 'https://slack.com/api/chat.postMessage',
      headers: {
        'Authorization': 'Bearer {{credentials.token}}',
        'Content-Type': 'application/json',
      },
      bodyTemplate: {
        channel: '{{input.channel}}',
        text: '{{input.message}}',
      },
    },
    credentialTypes: ['slack'],
    isSystem: true,
    isPublished: true,
  },

  {
    key: 'action-discord-send',
    name: 'Discord - Send Message',
    version: 1,
    category: 'social',
    type: 'action',
    shape: 'rectangle',
    color: '#5865F2',
    icon: 'message-circle',
    description: 'Send message to Discord channel',
    inputSchema: [
      {
        key: 'webhookUrl',
        type: 'text',
        label: 'Webhook URL',
        required: true,
      },
      {
        key: 'content',
        type: 'textarea',
        label: 'Message',
        required: true,
      },
    ],
    outputSchema: [
      { key: 'id', type: 'string', description: 'Message ID' },
    ],
    apiConfig: {
      method: 'POST',
      url: '{{input.webhookUrl}}',
      headers: {
        'Content-Type': 'application/json',
      },
      bodyTemplate: {
        content: '{{input.content}}',
      },
    },
    isSystem: true,
    isPublished: true,
  },

  // ==================== ERROR HANDLING NODES ====================
  {
    key: 'utility-error-handler',
    name: 'Error Handler',
    version: 1,
    category: 'utility',
    type: 'utility',
    shape: 'hexagon',
    color: '#EF4444',
    icon: 'alert-triangle',
    description: 'Handle errors from previous nodes',
    inputSchema: [
      {
        key: 'action',
        type: 'select',
        label: 'Action on Error',
        required: true,
        options: [
          { value: 'retry', label: 'Retry' },
          { value: 'continue', label: 'Continue' },
          { value: 'stop', label: 'Stop Workflow' },
        ],
      },
    ],
    outputSchema: [
      { key: 'handled', type: 'boolean', description: 'Error handled' },
    ],
    apiConfig: {
      method: 'INTERNAL',
      url: 'internal://error/handler',
    },
    isSystem: true,
    isPublished: true,
  },
];

/**
 * Seed node definitions to database
 */
const seedNodeDefinitions = async () => {
  try {
    console.log('🌱 Seeding node definitions...');

    let created = 0;
    let updated = 0;

    for (const nodeDef of nodeDefinitions) {
      const existing = await NodeDefinition.findOne({ key: nodeDef.key });

      if (existing) {
        // Update existing
        await NodeDefinition.updateOne({ key: nodeDef.key }, nodeDef);
        updated++;
      } else {
        // Create new
        await NodeDefinition.create(nodeDef);
        created++;
      }
    }

    console.log(`✅ Node definitions seeded: ${created} created, ${updated} updated`);
  } catch (error) {
    console.error('❌ Failed to seed node definitions:', error);
  }
};

export default seedNodeDefinitions;
