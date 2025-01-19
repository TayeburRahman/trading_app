import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          field =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>
        ),
      });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // Create a shallow copy of the query
    const excludeFields = [
      'searchTerm',
      'sort',
      'limit',
      'page',
      'fields',
      'removeUserId',
    ];
    excludeFields.forEach(el => delete queryObj[el]);

    if (this.query.removeUserId) {
      queryObj.user = { $ne: this.query.removeUserId };
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort() {
    const sortField = (this.query?.sort as string) || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sortField.split(',').join(' '));
    return this;
  }

  paginate() {
    const page = Math.max(1, Number(this.query?.page) || 1);
    const limit = Math.max(1, Number(this.query?.limit) || 8);
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields = (this.query?.fields as string)?.split(',').join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Math.max(1, Number(this.query?.page) || 1);
    const limit = Math.max(1, Number(this.query?.limit) || 8);
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
