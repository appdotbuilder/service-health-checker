import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import all schemas
import {
  authInputSchema,
  fetchAccountsInputSchema,
  fetchProjectsInputSchema,
  fetchServicesInputSchema,
  executeTestInputSchema,
  executeAllTestsInputSchema,
  githubConfigInputSchema,
  createTestDefinitionInputSchema,
  updateTestDefinitionInputSchema
} from './schema';

// Import all handlers
import { fetchAccounts } from './handlers/fetch_accounts';
import { fetchProjects } from './handlers/fetch_projects';
import { fetchServices } from './handlers/fetch_services';
import { syncTestDefinitions, getTestDefinitions } from './handlers/sync_test_definitions';
import { executeTest } from './handlers/execute_test';
import { executeAllTests } from './handlers/execute_all_tests';
import { getAccountDashboard, getProjectDashboard, getServiceDashboard } from './handlers/get_dashboard_data';
import { createTestDefinition, updateTestDefinition, deleteTestDefinition, getTestDefinitionById } from './handlers/manage_test_definitions';
import { getTestResultsByService, getTestResultsByProject, getTestResultsByAccount, getTestResultHistory } from './handlers/get_test_results';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Data fetching from external APIs
  fetchAccounts: publicProcedure
    .input(fetchAccountsInputSchema)
    .mutation(({ input }) => fetchAccounts(input)),

  fetchProjects: publicProcedure
    .input(fetchProjectsInputSchema)
    .mutation(({ input }) => fetchProjects(input)),

  fetchServices: publicProcedure
    .input(fetchServicesInputSchema)
    .mutation(({ input }) => fetchServices(input)),

  // Test definition management (GitHub sync)
  syncTestDefinitions: publicProcedure
    .input(githubConfigInputSchema)
    .mutation(({ input }) => syncTestDefinitions(input)),

  getTestDefinitions: publicProcedure
    .query(() => getTestDefinitions()),

  // Test execution
  executeTest: publicProcedure
    .input(executeTestInputSchema)
    .mutation(({ input }) => executeTest(input)),

  executeAllTests: publicProcedure
    .input(executeAllTestsInputSchema)
    .mutation(({ input }) => executeAllTests(input)),

  // Dashboard data
  getAccountDashboard: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .query(({ input }) => getAccountDashboard(input.accountId)),

  getProjectDashboard: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input }) => getProjectDashboard(input.projectId)),

  getServiceDashboard: publicProcedure
    .input(z.object({ serviceId: z.string() }))
    .query(({ input }) => getServiceDashboard(input.serviceId)),

  // Administrative interface for test management
  createTestDefinition: publicProcedure
    .input(createTestDefinitionInputSchema)
    .mutation(({ input }) => createTestDefinition(input)),

  updateTestDefinition: publicProcedure
    .input(updateTestDefinitionInputSchema)
    .mutation(({ input }) => updateTestDefinition(input)),

  deleteTestDefinition: publicProcedure
    .input(z.object({ testId: z.string() }))
    .mutation(({ input }) => deleteTestDefinition(input.testId)),

  getTestDefinitionById: publicProcedure
    .input(z.object({ testId: z.string() }))
    .query(({ input }) => getTestDefinitionById(input.testId)),

  // Test results retrieval
  getTestResultsByService: publicProcedure
    .input(z.object({ serviceId: z.string() }))
    .query(({ input }) => getTestResultsByService(input.serviceId)),

  getTestResultsByProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ input }) => getTestResultsByProject(input.projectId)),

  getTestResultsByAccount: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .query(({ input }) => getTestResultsByAccount(input.accountId)),

  getTestResultHistory: publicProcedure
    .input(z.object({ 
      serviceId: z.string(), 
      testDefinitionId: z.string(), 
      limit: z.number().int().positive().default(50) 
    }))
    .query(({ input }) => getTestResultHistory(input.serviceId, input.testDefinitionId, input.limit)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();