// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  QueryOptions as GeneratedQueryOptions,
  TableQueryOptionalParams,
  TableQueryEntitiesOptionalParams,
  TableQueryEntitiesWithPartitionAndRowKeyResponse,
  TableQueryEntitiesResponse,
  TableInsertEntityOptionalParams,
  TableUpdateEntityOptionalParams,
  TableMergeEntityOptionalParams,
  TableSetAccessPolicyOptionalParams
} from "./generated/models";

/**
 * Contains response data for the getEntity operation.
 */
export interface ListEntitiesResponse<T> extends Omit<TableQueryEntitiesResponse, "value"> {
  /**
   * List of table entities.
   */
  value?: T[];
}

/**
 * OData query parameters.
 */
export interface GetEntityResponse<T> extends TableQueryEntitiesWithPartitionAndRowKeyResponse {
  /**
   * The table entity object.
   */
  value?: T;
}

/**
 * List tables optional parameters.
 */
export type ListTablesOptions = Omit<TableQueryOptionalParams, "queryOptions">;

/**
 * List entities optional parameters.
 */
export type ListEntitiesOptions = Omit<TableQueryEntitiesOptionalParams, "queryOptions">;

/**
 * Create entity optional parameters.
 */
export type CreateEntityOptions = Omit<TableInsertEntityOptionalParams, "tableEntityProperties">;

/**
 * Update entity optional parameters.
 */
export type UpdateEntityOptions = Omit<
  TableUpdateEntityOptionalParams,
  "tableEntityProperties" | "ifMatch"
>;

/**
 * Merge entity optional parameters.
 */
export type MergeEntityOptions = Omit<
  TableMergeEntityOptionalParams,
  "tableEntityProperties" | "ifMatch"
>;

/**
 * Set table access policy optional parameters.
 */
export type SetAccessPolicyOptions = Omit<TableSetAccessPolicyOptionalParams, "tableAcl">;

/**
 * Set table access policy optional parameters.
 */
export interface QueryOptions extends Omit<GeneratedQueryOptions, "select"> {
  /**
   * Select expression using OData notation. Limits the columns on each record to just those requested.
   */
  select?: string[];
}

/**
 * A set of key-value pairs representing the table entity.
 */
export interface Entity {
  /**
   * The PartitionKey property of the entity.
   */
  PartitionKey: string;
  /**
   * The RowKey property of the entity.
   */
  RowKey: string;
  /**
   * Any custom properties of the entity.
   */
  [propertyName: string]: any;
}
