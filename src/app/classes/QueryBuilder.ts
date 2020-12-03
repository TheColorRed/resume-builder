import { Subject } from 'rxjs'
import { environment } from '../../environments/environment'
import { GraphQLClientService, IConnection } from '../services/graphql/graphql.service'

export enum QueryType {
  Select = 'Select', Insert = 'Insert', Update = 'Update', Delete = 'Delete', Upsert = 'Upsert'
}

type Vars = string | undefined | IGraphQLWhere | number

export interface IPaginationResult<T> {
  count: number
  total: number
  page: number
  pages: number
  isLastPage: boolean
  isFirstPage: boolean
  results: T[]
}

export enum SortDirection {
  Asc = 'asc', Desc = 'desc',
  AscNullFirst = 'asc_nulls_first',
  AscNullLast = 'asc_nulls_last',
  DescNullFirst = 'asc_nulls_first',
  DescNullLast = 'asc_nulls_last',
}

interface IGraphQLWhereJoin {
  _and?: IGraphQLWhere | IGraphQLWhere[]
  _not?: IGraphQLWhere | IGraphQLWhere[]
  _or?: IGraphQLWhere | IGraphQLWhere[]
}

interface IGraphQLWhereComparison {
  _contained_in?: {}
  _contains?: {}
  _eq?: {}
  _gt?: number
  _gte?: number
  _ilike?: string
  _in?: {} | {}[]
  _is_null?: boolean
  _like?: string
  _lt?: number
  _lte?: number
  _neq?: {}
  _nilike?: {}
  _nin?: {} | {}[]
  _nlike?: string
  _nsimilar?: string
  _similar?: string
  // [key: string]: IGraphQLWhere | {};
}

type IGraphQLWhere = { [key: string]: IGraphQLWhereComparison | {} } & IGraphQLWhereJoin

export class QueryBuilder {
  private _table: string | string[] = '';
  private _constraintUpsert?: string = undefined;
  private _columnsUpsert: string[] = [];
  private _tableAlias: string | undefined = '';
  private _where?: IGraphQLWhere = undefined;
  private _whereUpsert?: IGraphQLWhere = undefined;
  private _distinct?: string = undefined;
  private _select: string | string[] = '';
  private _limit = 1000;
  private _offset = 0;
  private _primary?: object
  private _order: { column: string, direction: SortDirection } = {
    column: '', direction: SortDirection.Asc
  };
  private _set?: object
  private _insert?: {}[]
  private _queryType: QueryType = QueryType.Select;

  private readonly NOTHING_SELECTED = 'No items were selected.';

  private readonly paginationBehavior: Subject<IPaginationResult<unknown>> = new Subject<IPaginationResult<unknown>>();
  public readonly $pagination = this.paginationBehavior.asObservable();

  private readonly _defaultPaginationState: IPaginationResult<{}> = {
    count: 0, total: 0, page: 1, pages: -1, results: [],
    isFirstPage: false, isLastPage: false
  };

  private _lastQueryData: IPaginationResult<{}> = this._defaultPaginationState;

  private _debug = false;

  public constructor(private readonly queryBuilderService: GraphQLClientService) { }

  /**
   * Turns on debugging for the query.
   */
  public get debug() {
    this._debug = true
    return this
  }

  /**
   * Sets the endpoint for this query.
   * @param connection The endpoint for the query.
   */
  public connection(connection: IConnection) {
    this.queryBuilderService.endpoint = connection.endpoint
    this.queryBuilderService.headers = connection.headers || {}
    return this
  }

  /**
   * Sets the base table for the query.
   * @param tableName The name of the base table.
   */
  public table(tableName: string, alias?: string) {
    this._table = tableName
    this._tableAlias = alias
    return this
  }

  /**
   * Tables to add to the existing table.
   * @param tableNames List of tables.
   */
  public addTables(...tableNames: string[]) {
    if (Array.isArray(this._table)) {
      this._table.push(...tableNames)
    } else {
      this._table = [this._table, ...tableNames]
    }
    return this
  }

  public primary(primary: object) {
    this._primary = primary
    return this
  }

  /**
   * A graphql column selection string.
   * @param columns The column names to select.
   */
  public select(columns: string) {
    this._select = columns
    return this
  }

  /**
   * Creates the where clause.
   * @param columns A where clause object.
   */
  public where(columns?: IGraphQLWhere) {
    this._where = columns
    return this
  }

  /**
   * Creates a delete query with a where clause.
   * @param columns A where clause object.
   */
  public deleteWhere(columns?: IGraphQLWhere) {
    this.where(columns)
    this._queryType = QueryType.Delete
    return this
  }

  /**
   * Sets a field as distinct.
   * @param field Distinct field
   */
  public distinct(field: string) {
    this._distinct = field
    return this
  }

  /**
   * Sets the offset for the query and optionally a limit.
   * @param offset The offset to start at.
   * @param limit The number of items to return.
   */
  public offset(offset: number, limit?: number) {
    this._offset = offset
    if (limit) {
      this._limit = limit
    }
    return this
  }

  /**
   * Sets the order of the results.
   * @param column The column to order by.
   * @param direction The direction in which to order the items.
   */
  public order(column: string, direction: SortDirection) {
    this._order = { column, direction }
    return this
  }

  /**
   * Shorthand for ordering in descending order
   * @param column The column name.
   */
  public orderDesc(column: string) {
    return this.order(column, SortDirection.Desc)
  }

  /**
   * Shorthand for ordering in ascending order.
   * @param column The column name.
   */
  public orderAsc(column: string) {
    return this.order(column, SortDirection.Asc)
  }

  /**
   * Sets the number of items to return.
   * @param limit The number of items.
   */
  public limit(limit: number) {
    this._limit = limit
    return this
  }

  /**
   * Sets the data for an update mutation.
   * @param item The data for the update.
   */
  public set(item: object) {
    this._set = item
    this._queryType = QueryType.Update
    return this
  }

  /**
   * Sets the data for an insert mutation.
   * @param items The items to insert into the table.
   */
  public insert<T>(...items: T[]) {
    this._insert = items
    this._queryType = QueryType.Insert
    return this
  }

  /**
   * Sets the data for an insert mutation.
   * If there is a conflict, then an upsert is performed using the constraint.
   *
   * @param {string} constraint The constraint that will trigger the upsert.
   * @param {string[]} columns The columns that will be updated.
   * @param {[IGraphQLWhere]} where A where constraint on the columns to update.
   */
  public upsert<T>(constraint: string, items: T | T[], columns: string[], where?: IGraphQLWhere): this
  /**
   * Sets the data for an insert mutation.
   * If there is a conflict, then an upsert is performed using the primary key.
   *
   * @param {string[]} columns The columns that will be updated.
   * @param {[IGraphQLWhere]} where A where constraint on the columns to update.
   */
  public upsert<T>(items: T | T[], columns: string[], where?: IGraphQLWhere): this
  public upsert<T>(...args: (string | string[] | T | T[] | IGraphQLWhere)[]) {
    const items = (typeof args[0] === 'string' ? args[1] : args[0]) as T | T[]
    Array.isArray(items) ? this.insert(...items) : this.insert(items)
    this._columnsUpsert = (typeof args[0] === 'string' ? args[2] : args[1]) as string[]
    this._whereUpsert = (typeof args[0] === 'string' ? args[3] : args[2]) as IGraphQLWhere | undefined
    this._constraintUpsert = typeof args[0] === 'string' ? args[0] : undefined
    this._queryType = QueryType.Upsert
    return this
  }

  /**
   * Get the number of items from a query.
   */
  public count() {
    const sub = new Subject<number>()
    const distinct = `, distinct_on: ${this._distinct}`

    const query = `query ($where: ${this._table}_bool_exp) {
      count: ${this._table}_aggregate (where: $where ${this._distinct ? distinct : ''}) {
        aggregate {
          count
        }
      }
    }`

    const vars = {
      where: this._where
    }

    this.queryBuilderService.query<{ count: { aggregate: { count: number } } }>(query, vars).then(result => {
      this.log(query, vars, result)
      sub.next(result.count.aggregate.count)
      sub.unsubscribe()
    }).catch(err => {
      this.log(query, undefined, err)
      sub.error(err)
      sub.unsubscribe()
    })
    return sub.asObservable()
  }

  /**
   * Checks if there is at least one item in the table that matches.
   */
  public exists() {
    const sub = new Subject<boolean>()
    this.count().subscribe(result => {
      sub.next(result > 0)
      sub.unsubscribe()
    })
    return sub.asObservable()
  }

  /**
   * Gets the first item in a result set.
   */
  public first<T>() {
    if (this._select.length === 0) {
      throw new Error(`${this.NOTHING_SELECTED} On table "${this._table}"`)
    }
    const sub = new Subject<T>()
    const limit = this._limit

    this.limit(1)
    this.get<T>()
      .subscribe(result => {
        this.limit(limit)
        if (Array.isArray(result) && result.length > 0) {
          sub.next(result?.[0])
        } else {
          sub.next(result || {} as T)
        }
        sub.unsubscribe()
      })
    return sub.asObservable()
  }

  /**
   * Runs the built query.
   * @param tableAlias An alias name for the return data.
   */
  public get<T>() {
    const sub = new Subject<T>()
    this.queryCombined<T>(this).subscribe(result => {
      const alias = this._tableAlias ? this._tableAlias : this._table
      const table = Array.isArray(alias) ? alias[0] : alias
      sub.next(result[table])
    })
    return sub.asObservable()
  }

  /**
   * Builds a single graphql "query" query using multiple Query Builders.
   * @param builders An array of query strings.
   */
  public queryCombined<T>(...builders: QueryBuilder[]) {
    for (const builder of builders) {
      if (builder._select.length === 0) {
        throw new Error(`${this.NOTHING_SELECTED} On table "${builder._table}"`)
      }
    }
    const sub = new Subject<T>()
    const params: string[] = []
    const vars: { [key: string]: {} | undefined } = {}
    let query = 'query (\n'

    // Build the query variable parameters
    // Don't add a where if we have a primary key
    params.push(...builders.map((b, idx) => !b._primary ? `$where_${idx}: ${b._table}_bool_exp` : ''))
    params.push(...builders.map((b, idx) => !b._primary ? `$limit_${idx}: Int` : ''))
    params.push(...builders.map((b, idx) => !b._primary ? `$offset_${idx}: Int` : ''))
    // Add primary variables to the parameters
    builders.forEach((builder, builderIdx) => {
      if (builder._primary) {
        Object.entries(builder._primary).forEach(([key, value], primaryIdx) => {
          const type = typeof value === 'string' ? 'String' :
            typeof value === 'number' ? 'Int' : 'String'
          params.push(`$primary_${builderIdx}_${primaryIdx}: ${type}!`)
        })
      }
    })
    query += `\t${params.filter(String).join(',\n\t')}`

    query += '\n){\n'
    // Build the queries
    builders.forEach((builder, builderIdx) => {
      const distinct = `, distinct_on: ${builder._distinct}`
      const alias = builder._tableAlias ? builder._tableAlias : builder._table
      if (builder._primary) {
        // Adds primary search.
        const items = Object.entries(builder._primary).map(([key, value], primaryIdx) => {
          return `${key}: $primary_${builderIdx}_${primaryIdx}`
        }).join(',')
        query += `\t${alias}: ${builder._table}_by_pk (${items}) {\n`
      } else {
        // Adds a basic search.
        query += `\t${alias}: ${builder._table} (where: $where_${builderIdx}, limit: $limit_${builderIdx}, offset: $offset_${builderIdx} ${builder._distinct ? distinct : ''}) {\n`
      }
      // Close the query before adding the next
      query += builder._select
      query += '\n\t}\n'

      // Add the variables
      // Don't add a where if we have a primary key
      if (!builder._primary) {
        vars[`where_${builderIdx}`] = builder._where
        vars[`limit_${builderIdx}`] = builder._limit
        vars[`offset_${builderIdx}`] = builder._offset
      } else {
        Object.entries(builder._primary).forEach(([key, value], primaryIdx) => {
          vars[`primary_${builderIdx}_${primaryIdx}`] = value
        })
      }
    })
    // Close the root query string: "query (...) {..."
    query += '}'

    // Perform the query
    this.queryBuilderService.query<T>(query, vars).then(result => {
      this.log(query, vars, result)
      sub.next(result)
      sub.unsubscribe()
    }).catch(err => {
      this.log(query, vars, err)
      sub.error(err)
      sub.unsubscribe()
    })
    return sub.asObservable()
  }

  /**
   * Builds a single graphql "mutation" query using multiple Query Builders.
   * @param builders An array of query strings.
   */
  public mutateCombined<T>(...builders: QueryBuilder[]) {
    for (const builder of builders) {
      if (builder._select.length === 0) {
        throw new Error(`${this.NOTHING_SELECTED} On table "${builder._table}"`)
      }
    }
    const sub = new Subject<T>()
    const params: string[] = []
    const vars: { [key: string]: {} } = {}
    try {
      this.testCombinedMutation(builders)
    } catch (e) {
      throw e
    }
    let query = 'mutation (\n'

    params.push(...builders.map((b, idx) => b._set ? `$set_${idx}: ${b._table}_set_input` : '').filter(String))
    params.push(...builders.map((b, idx) => b._insert ? `$insert_${idx}: ${b._table}_insert_input!` : '').filter(String))
    params.push(...builders.map((b, idx) => b._where ? `$where_${idx}: ${b._table}_bool_exp!` : ''))
    params.push(...builders.map((b, idx) => b._whereUpsert ? `$where_${idx}: ${b._table}_bool_exp!` : ''))
    params.push(...builders.map((b, idx) => b._columnsUpsert ? `$conflict_cols_${idx}: [${b._table}_update_column!]!` : ''))
    params.push(...builders.map((b, idx) => b._queryType === QueryType.Upsert ? `$constraint_${idx}: ${b._table}_constraint!` : '').filter(String))
    builders.forEach((builder, builderIdx) => {
      if (builder._primary) {
        Object.entries(builder._primary).forEach(([key, value], primaryIdx) => {
          const type = typeof value === 'string' ? 'String' :
            typeof value === 'number' ? 'Int' : 'String'
          params.push(`$primary_${builderIdx}_${primaryIdx}: ${type}!`)
        })
      }
    })
    query += `\t${params.filter(String).join(',\n\t')}`
    query += '\n){\n'
    // Build the queries
    builders.forEach((builder, builderIdx) => {
      const alias = builder._tableAlias ? builder._tableAlias : builder._table
      let table = ''
      // get the table to use
      if ([QueryType.Insert, QueryType.Upsert].includes(builder._queryType)) {
        const one = builder._insert && builder._insert.length === 1 ? '_one' : ''
        table = `insert_${builder._table}${one}`
      } else {
        const type = builder._queryType.toLowerCase()
        const pk = builder._primary ? '_by_pk' : ''
        table = `${type}_${builder._table}${pk}`
      }
      query += `\t${alias}: ${table}`
      const items = builder._primary && Object.entries(builder._primary).map(([key, value], primaryIdx) => {
        return `${key}: $primary_${builderIdx}_${primaryIdx}`
      }).join(',')

      // Create the parameter list on the table
      if ([QueryType.Insert, QueryType.Upsert].includes(builder._queryType)) {
        query += '('
        if (builder._insert && builder._insert.length === 1) {
          query += `object: $insert_${builderIdx}`
        } else {
          query += `objects: $insert_${builderIdx}`
        }

        // Create an upsert
        if (builder._queryType === QueryType.Upsert && builder._columnsUpsert) {
          const constraint = builder._constraintUpsert ? builder._constraintUpsert : `${builder._table}_pk`
          const where = builder._whereUpsert ? `, where: $where_${builderIdx}\n` : ''
          vars[`constraint_${builderIdx}`] = constraint
          query += `, on_conflict: {\nconstraint:$constraint_${builderIdx},\nupdate_columns:$conflict_cols_${builderIdx}\n${where}}`
        }
        query += `){\n`
      } else if (builder._queryType === QueryType.Update) {
        if (builder._primary && items) {
          query += `(pk_columns: {${items}}, _set: $set_${builderIdx}){\n`
        } else {
          query += `(where: $where_${builderIdx}, _set: $set_${builderIdx}){\n`
        }
      } else if (builder._queryType === QueryType.Delete) {
        if (builder._primary && items) {
          query += `(${items}){`
        } else {
          query += `(where: $where_${builderIdx}){\n`
        }
      }
      // Close the query before adding the next
      if (
        (!builder._primary && builder._queryType === QueryType.Update) ||
        (!builder._primary && builder._queryType === QueryType.Delete)
      ) {
        query += `\t\taffected_rows\n`
        query += `\t\treturning {
          ${builder._select}
        }`
      } else {
        query += `\t\t${builder._select}`
      }
      query += '\n\t}\n'

      // Add the variables
      // Don't add a where if we have a primary key
      if (builder._primary) {
        Object.entries(builder._primary).forEach(([key, value], primaryIdx) => {
          vars[`primary_${builderIdx}_${primaryIdx}`] = value
        })
      } else if (builder._where) {
        vars[`where_${builderIdx}`] = builder._where
      }
      if (builder._whereUpsert) {
        vars[`where_${builderIdx}`] = builder._whereUpsert
      }
      if (builder._columnsUpsert) {
        vars[`conflict_cols_${builderIdx}`] = builder._columnsUpsert
      }
      if (builder._set) {
        vars[`set_${builderIdx}`] = builder._set
      }
      if (builder._insert) {
        if (builder._insert && builder._insert.length === 1) {
          vars[`insert_${builderIdx}`] = builder._insert[0]
        } else {
          vars[`insert_${builderIdx}`] = builder._insert
        }
      }
    })
    query += '}'

    // Perform the query
    this.queryBuilderService.query<T>(query, vars).then(result => {
      this.log(query, vars, result)
      sub.next(result)
      sub.unsubscribe()
    }).catch(err => {
      this.log(query, vars, err)
      sub.error(err)
      sub.unsubscribe()
    })

    return sub.asObservable()
  }

  /**
   * Runs an aggregation query.
   * @param aggregation The aggregation.
   * @param tableAlias An alias name for the return data.
   */
  public aggregate<T>(aggregation: string, tableAlias?: string) {
    if (this._select.length === 0) {
      throw new Error(`${this.NOTHING_SELECTED} On table "${this._table}"`)
    }
    const sub = new Subject()
    const alias = tableAlias ? tableAlias : this._table

    const query = `query {
      ${alias}: ${this._table}: ${this._table}_aggregate {
        aggregate {
          ${aggregation}
        }
        nodes {
          ${this._select}
        }
      }
    }`

    this.queryBuilderService.query<T>(query).then(result => {
      this.log(query, undefined, result)
      sub.next(result)
      sub.unsubscribe()
    }).catch(err => {
      this.log(query, undefined, err)
      sub.error(err)
      sub.unsubscribe()
    })
    return sub.asObservable()
  }


  /**
   * Runs a pagination query.
   */
  public paginate<T>() {
    if (this._select.length === 0) {
      throw new Error(`${this.NOTHING_SELECTED} On table "${this._table}"`)
    }

    const query = `query (
      $limit: Int!,
      $offset: Int!,
      $order: [${this._table}_order_by!],
      $where: ${this._table}_bool_exp
    ) {
      count: ${this._table}_aggregate (where: $where) {
        aggregate {
          count
        }
      }
      data: ${this._table}(where: $where, limit: $limit, offset: $offset, order_by: $order) {
        ${this._select}
      }
    }`
    const vars = {
      limit: this._limit,
      offset: this._offset,
      where: this._where,
      ...(this._order.column && { order: { [this._order.column]: this._order.direction } })
    }

    this.queryBuilderService
      .query<{ data: T[]; count: { aggregate: { count: number } } }>(query, vars)
      .then(result => {
        this.log(query, vars, result)
        const total = result['count']?.aggregate?.count || 0
        const page = (this._offset / this._limit) + 1
        const pages = Math.ceil(total / this._limit)

        this._lastQueryData = {
          results: result['data'] as T[],
          count: result['data'].length,
          total,
          pages,
          page,
          isFirstPage: page === 1,
          isLastPage: page === pages
        }
        this.paginationBehavior.next(this._lastQueryData)
      }).catch(err => {
        this.log(query, vars, err)
      })
    return this
  }

  /**
   * Gets a page in the pagination result.
   * @param page The page to get.
   */
  public getPage(page: number) {
    if (page < this._lastQueryData.pages && page > 0) {
      this._offset = (page * this._limit) - this._limit
      this.paginate()
    } else if (page > this._lastQueryData.pages) {
      this.lastPage()
    } else {
      this._offset = 0
      this.firstPage()
    }
    return this
  }

  /**
   * Gets the next page in the pagination set.
   * **Note:** Pagination must have already been called at least once.
   */
  public nextPage() {
    if (this._lastQueryData.page > -1) {
      this._offset += this._limit
      this.paginate()
    }
    return this
  }

  /**
   * Gets the previous page in the pagination set.
   * **Note:** Pagination must have already been called at least once.
   */
  public previousPage() {
    if (this._lastQueryData.page > 0) {
      this._offset -= this._limit
      this._offset = this._offset < 0 ? 0 : this._offset
      this.paginate()
    }
    return this
  }

  /**
   * Gets the first page in the pagination set.
   */
  public firstPage<T>() {
    this._offset = 0
    this.paginate<T>()
    return this
  }

  /**
   * Gets the last page in the pagination set.
   * **Note:** Pagination must have already been called at least once.
   */
  public lastPage() {
    this._offset = (this._lastQueryData.pages * this._limit) - this._limit
    this.paginate()
    return this
  }

  /**
   * Runs a mutation on this query.
   */
  public mutate<T>() {
    return this.mutateCombined<T>(this)
  }

  private testCombinedMutation(builders: QueryBuilder[]) {
    for (const builder of builders) {
      if (builder._queryType === QueryType.Select || !builder._queryType) {
        throw new Error(`Table "${builder._table}" is not a correct query type.`)
      }
      if (builder._queryType === QueryType.Update && !builder._set) {
        throw new Error(`Table "${builder._table}" does not have a set value.`)
      }
      if (builder._queryType === QueryType.Insert && !builder._insert) {
        throw new Error(`Table "${builder._table}" does not have a insert value value.`)
      }
      if (
        [QueryType.Update, QueryType.Delete].includes(builder._queryType) &&
        !builder._primary && !builder._where
      ) {
        throw new Error(`Table "${builder._table}" must have a primary key or where clause to perform a "${builder._queryType}"`)
      }
      if (builder._where && Object.keys(builder._where).length === 0) {
        throw new Error(`Table ${builder._table} must have at least one column in the where clause.`)
      }
    }
  }

  /**
   * Logs a query to the console. Executes "query" but not "mutation".
   * @param query The query string to evaluate.
   * @param variables The variables to evaluate.
   */
  private log(query: string, variables?: object, result?: {}) {
    if (!environment.production && this._debug) {
      this.logToConsole(query, variables, result)
    }
  }

  /**
   * Logs the information to the console from a "query" or "mutation" query.
   * @param query The query to evaluate.
   * @param variables The variables to evaluate.
   * @param result A query result.
   */
  private logToConsole(query: string, variables?: object, result?: {}) {
    if (!environment.production && this._debug) {
      const padSize = 80
      console.log(`-- Begin Query `.padEnd(padSize, '-'))
      console.log(query)
      if (variables) {
        console.log(`---- Variables `.padEnd(padSize, '-'))
        console.log(variables)
      }
      if (result) {
        console.log(`---- result `.padEnd(padSize, '-'))
        console.log(result)
      }
      console.log(`-- End Query `.padEnd(padSize, '-'))
    }
  }

}