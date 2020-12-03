import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

export interface IConnection {
  endpoint: string
  headers?: AdditionalHeaders
}

/**
 * Additional headers to be sent to the graphql server.
 *
 * @export
 * @interface AdditionalHeaders
 */
export interface AdditionalHeaders {
  'x-hasura-admin-secret'?: any
  [key: string]: string
}

/**
 * The response from the graphql server.
 *
 * @export
 * @interface Response
 * @template T
 */
export interface Response<T extends object> {
  data: T
}

export interface GraphQLClientService {
  websocketEndpoint: string
  onInit(): void
}

export interface IFlatMapPaths {
  [key: string]: string
}

@Injectable()
export class GraphQLClientService {

  /**
   * The endpoint to the graphql server for the current service.
   *
   * @abstract
   * @type {string}
   * @memberof GraphQLClientService
   */
  public endpoint = '';
  /**
   * Headers to be used when sending a query or mutation.
   *
   * @type {AdditionalHeaders}
   * @memberof GraphQLClientService
   */
  public headers: AdditionalHeaders = { 'x-hasura-admin-secret': 'resume-builder' };

  public constructor(
    private readonly httpClient: HttpClient
  ) { }

  /**
   * Executes a query on the graphql endpoint.
   *
   * @template T
   * @param {string} query The query string to execute.
   * @param {object} [variables] Additional variables.
   * @returns
   * @memberof GraphQLClientService
   */
  public async query<T>(query: string, variables?: object) {
    return new Promise<T>((resolve, reject) => {
      const httpQuery = { query, variables }
      const headers = {}
      this.httpClient
        .post(this.endpoint, JSON.stringify(httpQuery), { headers })
        .subscribe((result: any) => {
          if (result.errors) {
            return reject(result.errors)
          }
          return resolve(result.data as T)
        })
    })
  }

  /**
   * Converts a string to a formatted id.
   * - Removes non alphanumeric values
   * - Converts spaces to underscores
   * - Removes 2+ underscores
   *
   * @protected
   * @param {string} input The text to convert.
   * @returns
   * @memberof RoleManagementService
   */
  protected toId(input: string) {
    return input.toLowerCase()
      .replace(/[^a-zA-Z0-9_\s]/g, '')
      .replace(/\s/g, '_')
      .replace(/__*/g, '_')
  }
}