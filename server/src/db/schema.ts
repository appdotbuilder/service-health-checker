import { text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const statusEnum = pgEnum('status', ['green', 'yellow', 'red']);
export const testTypeEnum = pgEnum('test_type', ['general', 'service_specific']);
export const httpMethodEnum = pgEnum('http_method', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);

// Accounts table
export const accountsTable = pgTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Projects table
export const projectsTable = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  account_id: text('account_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Services table
export const servicesTable = pgTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  endpoint_url: text('endpoint_url').notNull(),
  service_type: text('service_type').notNull(),
  project_id: text('project_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Test definitions table (cached from GitHub)
export const testDefinitionsTable = pgTable('test_definitions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  test_type: testTypeEnum('test_type').notNull(),
  service_types: text('service_types').notNull(), // JSON array as string
  endpoint_path: text('endpoint_path'), // Nullable by default
  http_method: httpMethodEnum('http_method').notNull().default('GET'),
  expected_patterns: text('expected_patterns').notNull(), // JSON array as string
  timeout_ms: integer('timeout_ms').notNull().default(30000),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Test results table
export const testResultsTable = pgTable('test_results', {
  id: text('id').primaryKey(),
  test_definition_id: text('test_definition_id').notNull(),
  service_id: text('service_id').notNull(),
  status: statusEnum('status').notNull(),
  response_data: text('response_data'), // Nullable by default
  matched_pattern: text('matched_pattern'), // Nullable by default
  error_message: text('error_message'), // Nullable by default
  execution_time_ms: integer('execution_time_ms').notNull(),
  executed_at: timestamp('executed_at').defaultNow().notNull()
});

// GitHub configuration table (for test repository settings)
export const githubConfigTable = pgTable('github_config', {
  id: text('id').primaryKey(),
  repository: text('repository').notNull(), // Format: "owner/repo"
  branch: text('branch').notNull().default('main'),
  tests_path: text('tests_path').notNull().default('tests'),
  last_sync: timestamp('last_sync'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type Account = typeof accountsTable.$inferSelect;
export type NewAccount = typeof accountsTable.$inferInsert;

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export type Service = typeof servicesTable.$inferSelect;
export type NewService = typeof servicesTable.$inferInsert;

export type TestDefinition = typeof testDefinitionsTable.$inferSelect;
export type NewTestDefinition = typeof testDefinitionsTable.$inferInsert;

export type TestResult = typeof testResultsTable.$inferSelect;
export type NewTestResult = typeof testResultsTable.$inferInsert;

export type GitHubConfig = typeof githubConfigTable.$inferSelect;
export type NewGitHubConfig = typeof githubConfigTable.$inferInsert;

// Export all tables for proper query building and relations
export const tables = {
  accounts: accountsTable,
  projects: projectsTable,
  services: servicesTable,
  testDefinitions: testDefinitionsTable,
  testResults: testResultsTable,
  githubConfig: githubConfigTable
};