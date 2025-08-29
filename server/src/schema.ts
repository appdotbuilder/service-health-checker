import { z } from 'zod';

// Status enum for test results
export const statusSchema = z.enum(['green', 'yellow', 'red']);
export type Status = z.infer<typeof statusSchema>;

// Auth input schema
export const authInputSchema = z.object({
  apiToken: z.string().min(1, 'API token is required'),
  accountId: z.string().min(1, 'Account ID is required')
});
export type AuthInput = z.infer<typeof authInputSchema>;

// Account schema
export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Account = z.infer<typeof accountSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  account_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Project = z.infer<typeof projectSchema>;

// Service schema
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  endpoint_url: z.string().url(),
  service_type: z.string(),
  project_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Service = z.infer<typeof serviceSchema>;

// Test definition schema (for tests from GitHub)
export const testDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  test_type: z.enum(['general', 'service_specific']),
  service_types: z.array(z.string()), // Which service types this test applies to
  endpoint_path: z.string().optional(), // Optional API endpoint path
  http_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  expected_patterns: z.array(z.object({
    pattern: z.string(), // Regex pattern
    status: statusSchema, // Status if pattern matches
    description: z.string()
  })),
  timeout_ms: z.number().int().positive().default(30000),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type TestDefinition = z.infer<typeof testDefinitionSchema>;

// Test execution result schema
export const testResultSchema = z.object({
  id: z.string(),
  test_definition_id: z.string(),
  service_id: z.string(),
  status: statusSchema,
  response_data: z.string().nullable(), // Raw response from API
  matched_pattern: z.string().nullable(), // Which pattern matched
  error_message: z.string().nullable(),
  execution_time_ms: z.number().int().nonnegative(),
  executed_at: z.coerce.date()
});
export type TestResult = z.infer<typeof testResultSchema>;

// Input schemas for handlers
export const fetchAccountsInputSchema = z.object({
  apiToken: z.string(),
  accountId: z.string()
});
export type FetchAccountsInput = z.infer<typeof fetchAccountsInputSchema>;

export const fetchProjectsInputSchema = z.object({
  apiToken: z.string(),
  accountId: z.string()
});
export type FetchProjectsInput = z.infer<typeof fetchProjectsInputSchema>;

export const fetchServicesInputSchema = z.object({
  apiToken: z.string(),
  projectId: z.string()
});
export type FetchServicesInput = z.infer<typeof fetchServicesInputSchema>;

export const executeTestInputSchema = z.object({
  serviceId: z.string(),
  testDefinitionId: z.string(),
  apiToken: z.string()
});
export type ExecuteTestInput = z.infer<typeof executeTestInputSchema>;

export const executeAllTestsInputSchema = z.object({
  serviceId: z.string(),
  apiToken: z.string()
});
export type ExecuteAllTestsInput = z.infer<typeof executeAllTestsInputSchema>;

// Dashboard data structures
export const serviceDashboardSchema = z.object({
  service: serviceSchema,
  testResults: z.array(testResultSchema),
  overallStatus: statusSchema
});
export type ServiceDashboard = z.infer<typeof serviceDashboardSchema>;

export const projectDashboardSchema = z.object({
  project: projectSchema,
  services: z.array(serviceDashboardSchema),
  overallStatus: statusSchema
});
export type ProjectDashboard = z.infer<typeof projectDashboardSchema>;

export const accountDashboardSchema = z.object({
  account: accountSchema,
  projects: z.array(projectDashboardSchema),
  overallStatus: statusSchema
});
export type AccountDashboard = z.infer<typeof accountDashboardSchema>;

// GitHub repository configuration
export const githubConfigInputSchema = z.object({
  repository: z.string(), // Format: "owner/repo"
  branch: z.string().default('main'),
  testsPath: z.string().default('tests') // Path in repo where test definitions are stored
});
export type GitHubConfigInput = z.infer<typeof githubConfigInputSchema>;

// Test definition creation/update schemas
export const createTestDefinitionInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  test_type: z.enum(['general', 'service_specific']),
  service_types: z.array(z.string()),
  endpoint_path: z.string().optional(),
  http_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  expected_patterns: z.array(z.object({
    pattern: z.string(),
    status: statusSchema,
    description: z.string()
  })),
  timeout_ms: z.number().int().positive().default(30000)
});
export type CreateTestDefinitionInput = z.infer<typeof createTestDefinitionInputSchema>;

export const updateTestDefinitionInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  test_type: z.enum(['general', 'service_specific']).optional(),
  service_types: z.array(z.string()).optional(),
  endpoint_path: z.string().optional(),
  http_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  expected_patterns: z.array(z.object({
    pattern: z.string(),
    status: statusSchema,
    description: z.string()
  })).optional(),
  timeout_ms: z.number().int().positive().optional()
});
export type UpdateTestDefinitionInput = z.infer<typeof updateTestDefinitionInputSchema>;