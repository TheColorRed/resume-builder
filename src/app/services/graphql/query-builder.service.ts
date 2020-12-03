import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'
import { QueryBuilder } from '../../classes/QueryBuilder'
import { GraphQLClientService, IConnection } from './graphql.service'

@Injectable({ providedIn: 'root' })
export class QueryBuilderService {

  public constructor(private readonly httpClient: HttpClient) { }

  /**
   * Starts a query on a root table.
   * @param tableName The name of the table to query.
   * @param alias The table alias.
   */
  public table(tableName: string, alias?: string) {
    const tbl = this.connection(environment.HASURA_API_CONNECTION).table(tableName, alias)
    return {
      select(columns: string) {
        return tbl.select(columns)
      }
    }
  }

  /**
   * Gets a connection to a server.
   * @param connection The connection information.
   */
  public connection(connection: IConnection) {
    return new QueryBuilder(new GraphQLClientService(this.httpClient))
      .connection(connection)
  }

  /**
   * Builds a single graphql query using multiple Query Builders.
   * @param builders An array of query strings.
   */
  public queryCombined<T extends object>(...builders: QueryBuilder[]) {
    return this.connection(environment.HASURA_API_CONNECTION)
      .queryCombined<T>(...builders)
  }

  /**
   * Builds a single graphql mutation query using multiple Query Builders.
   * @param builders An array of query strings.
   */
  public mutateCombined<T extends object>(...builders: QueryBuilder[]) {
    return this.connection(environment.HASURA_API_CONNECTION)
      .mutateCombined<T>(...builders)
  }

  /**
   * Turns on debugging for the query.
   */
  public get debug() {
    return this.connection(environment.HASURA_API_CONNECTION).debug
  }
}