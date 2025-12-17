/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAudit from "../adminAudit.js";
import type * as adminEvents from "../adminEvents.js";
import type * as analytics_calculations from "../analytics/calculations.js";
import type * as analytics_index from "../analytics/index.js";
import type * as analytics_mutations from "../analytics/mutations.js";
import type * as analytics_queries from "../analytics/queries.js";
import type * as analytics_types from "../analytics/types.js";
import type * as analytics_validation from "../analytics/validation.js";
import type * as analytics from "../analytics.js";
import type * as billingAnalytics_calculations from "../billingAnalytics/calculations.js";
import type * as billingAnalytics_index from "../billingAnalytics/index.js";
import type * as billingAnalytics_mutations from "../billingAnalytics/mutations.js";
import type * as billingAnalytics_queries from "../billingAnalytics/queries.js";
import type * as billingAnalytics_types from "../billingAnalytics/types.js";
import type * as billingAnalytics_validation from "../billingAnalytics/validation.js";
import type * as billingAnalytics from "../billingAnalytics.js";
import type * as campaignAnalytics_calculations from "../campaignAnalytics/calculations.js";
import type * as campaignAnalytics_index from "../campaignAnalytics/index.js";
import type * as campaignAnalytics_mutations from "../campaignAnalytics/mutations.js";
import type * as campaignAnalytics_queries from "../campaignAnalytics/queries.js";
import type * as campaignAnalytics_types from "../campaignAnalytics/types.js";
import type * as campaignAnalytics_validation from "../campaignAnalytics/validation.js";
import type * as campaignAnalytics from "../campaignAnalytics.js";
import type * as crossDomainAnalytics_aggregationQueries from "../crossDomainAnalytics/aggregationQueries.js";
import type * as crossDomainAnalytics_calculations from "../crossDomainAnalytics/calculations.js";
import type * as crossDomainAnalytics_domainQueries from "../crossDomainAnalytics/domainQueries.js";
import type * as crossDomainAnalytics_index from "../crossDomainAnalytics/index.js";
import type * as crossDomainAnalytics_mailboxQueries from "../crossDomainAnalytics/mailboxQueries.js";
import type * as crossDomainAnalytics_mutations from "../crossDomainAnalytics/mutations.js";
import type * as crossDomainAnalytics_queries from "../crossDomainAnalytics/queries.js";
import type * as crossDomainAnalytics_timeSeriesQueries from "../crossDomainAnalytics/timeSeriesQueries.js";
import type * as crossDomainAnalytics_types from "../crossDomainAnalytics/types.js";
import type * as crossDomainAnalytics_validation from "../crossDomainAnalytics/validation.js";
import type * as crossDomainAnalytics from "../crossDomainAnalytics.js";
import type * as domainAnalytics_calculations from "../domainAnalytics/calculations.js";
import type * as domainAnalytics_index from "../domainAnalytics/index.js";
import type * as domainAnalytics_mutations from "../domainAnalytics/mutations.js";
import type * as domainAnalytics_queries from "../domainAnalytics/queries.js";
import type * as domainAnalytics_types from "../domainAnalytics/types.js";
import type * as domainAnalytics_validation from "../domainAnalytics/validation.js";
import type * as domainAnalytics from "../domainAnalytics.js";
import type * as index from "../index.js";
import type * as leadAnalytics_calculations from "../leadAnalytics/calculations.js";
import type * as leadAnalytics_index from "../leadAnalytics/index.js";
import type * as leadAnalytics_mutations from "../leadAnalytics/mutations.js";
import type * as leadAnalytics_queries from "../leadAnalytics/queries.js";
import type * as leadAnalytics_types from "../leadAnalytics/types.js";
import type * as leadAnalytics_validation from "../leadAnalytics/validation.js";
import type * as leadAnalytics from "../leadAnalytics.js";
import type * as mailboxAnalytics_aggregators from "../mailboxAnalytics/aggregators.js";
import type * as mailboxAnalytics_calculations from "../mailboxAnalytics/calculations.js";
import type * as mailboxAnalytics_dataFetchers from "../mailboxAnalytics/dataFetchers.js";
import type * as mailboxAnalytics_healthQueries from "../mailboxAnalytics/healthQueries.js";
import type * as mailboxAnalytics_index from "../mailboxAnalytics/index.js";
import type * as mailboxAnalytics_mutations from "../mailboxAnalytics/mutations.js";
import type * as mailboxAnalytics_queries from "../mailboxAnalytics/queries.js";
import type * as mailboxAnalytics_types from "../mailboxAnalytics/types.js";
import type * as mailboxAnalytics_validation from "../mailboxAnalytics/validation.js";
import type * as mailboxAnalytics_warmupQueries from "../mailboxAnalytics/warmupQueries.js";
import type * as mailboxAnalytics from "../mailboxAnalytics.js";
import type * as sequenceStepAnalytics from "../sequenceStepAnalytics.js";
import type * as templateAnalytics_calculations from "../templateAnalytics/calculations.js";
import type * as templateAnalytics_index from "../templateAnalytics/index.js";
import type * as templateAnalytics_mutations from "../templateAnalytics/mutations.js";
import type * as templateAnalytics_queries from "../templateAnalytics/queries.js";
import type * as templateAnalytics_types from "../templateAnalytics/types.js";
import type * as templateAnalytics_validation from "../templateAnalytics/validation.js";
import type * as templateAnalytics from "../templateAnalytics.js";
import type * as utils_analyticsAggregators from "../utils/analyticsAggregators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminAudit: typeof adminAudit;
  adminEvents: typeof adminEvents;
  "analytics/calculations": typeof analytics_calculations;
  "analytics/index": typeof analytics_index;
  "analytics/mutations": typeof analytics_mutations;
  "analytics/queries": typeof analytics_queries;
  "analytics/types": typeof analytics_types;
  "analytics/validation": typeof analytics_validation;
  analytics: typeof analytics;
  "billingAnalytics/calculations": typeof billingAnalytics_calculations;
  "billingAnalytics/index": typeof billingAnalytics_index;
  "billingAnalytics/mutations": typeof billingAnalytics_mutations;
  "billingAnalytics/queries": typeof billingAnalytics_queries;
  "billingAnalytics/types": typeof billingAnalytics_types;
  "billingAnalytics/validation": typeof billingAnalytics_validation;
  billingAnalytics: typeof billingAnalytics;
  "campaignAnalytics/calculations": typeof campaignAnalytics_calculations;
  "campaignAnalytics/index": typeof campaignAnalytics_index;
  "campaignAnalytics/mutations": typeof campaignAnalytics_mutations;
  "campaignAnalytics/queries": typeof campaignAnalytics_queries;
  "campaignAnalytics/types": typeof campaignAnalytics_types;
  "campaignAnalytics/validation": typeof campaignAnalytics_validation;
  campaignAnalytics: typeof campaignAnalytics;
  "crossDomainAnalytics/aggregationQueries": typeof crossDomainAnalytics_aggregationQueries;
  "crossDomainAnalytics/calculations": typeof crossDomainAnalytics_calculations;
  "crossDomainAnalytics/domainQueries": typeof crossDomainAnalytics_domainQueries;
  "crossDomainAnalytics/index": typeof crossDomainAnalytics_index;
  "crossDomainAnalytics/mailboxQueries": typeof crossDomainAnalytics_mailboxQueries;
  "crossDomainAnalytics/mutations": typeof crossDomainAnalytics_mutations;
  "crossDomainAnalytics/queries": typeof crossDomainAnalytics_queries;
  "crossDomainAnalytics/timeSeriesQueries": typeof crossDomainAnalytics_timeSeriesQueries;
  "crossDomainAnalytics/types": typeof crossDomainAnalytics_types;
  "crossDomainAnalytics/validation": typeof crossDomainAnalytics_validation;
  crossDomainAnalytics: typeof crossDomainAnalytics;
  "domainAnalytics/calculations": typeof domainAnalytics_calculations;
  "domainAnalytics/index": typeof domainAnalytics_index;
  "domainAnalytics/mutations": typeof domainAnalytics_mutations;
  "domainAnalytics/queries": typeof domainAnalytics_queries;
  "domainAnalytics/types": typeof domainAnalytics_types;
  "domainAnalytics/validation": typeof domainAnalytics_validation;
  domainAnalytics: typeof domainAnalytics;
  index: typeof index;
  "leadAnalytics/calculations": typeof leadAnalytics_calculations;
  "leadAnalytics/index": typeof leadAnalytics_index;
  "leadAnalytics/mutations": typeof leadAnalytics_mutations;
  "leadAnalytics/queries": typeof leadAnalytics_queries;
  "leadAnalytics/types": typeof leadAnalytics_types;
  "leadAnalytics/validation": typeof leadAnalytics_validation;
  leadAnalytics: typeof leadAnalytics;
  "mailboxAnalytics/aggregators": typeof mailboxAnalytics_aggregators;
  "mailboxAnalytics/calculations": typeof mailboxAnalytics_calculations;
  "mailboxAnalytics/dataFetchers": typeof mailboxAnalytics_dataFetchers;
  "mailboxAnalytics/healthQueries": typeof mailboxAnalytics_healthQueries;
  "mailboxAnalytics/index": typeof mailboxAnalytics_index;
  "mailboxAnalytics/mutations": typeof mailboxAnalytics_mutations;
  "mailboxAnalytics/queries": typeof mailboxAnalytics_queries;
  "mailboxAnalytics/types": typeof mailboxAnalytics_types;
  "mailboxAnalytics/validation": typeof mailboxAnalytics_validation;
  "mailboxAnalytics/warmupQueries": typeof mailboxAnalytics_warmupQueries;
  mailboxAnalytics: typeof mailboxAnalytics;
  sequenceStepAnalytics: typeof sequenceStepAnalytics;
  "templateAnalytics/calculations": typeof templateAnalytics_calculations;
  "templateAnalytics/index": typeof templateAnalytics_index;
  "templateAnalytics/mutations": typeof templateAnalytics_mutations;
  "templateAnalytics/queries": typeof templateAnalytics_queries;
  "templateAnalytics/types": typeof templateAnalytics_types;
  "templateAnalytics/validation": typeof templateAnalytics_validation;
  templateAnalytics: typeof templateAnalytics;
  "utils/analyticsAggregators": typeof utils_analyticsAggregators;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
