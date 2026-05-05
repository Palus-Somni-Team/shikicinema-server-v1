import { PaginationQueryDto } from '../dto/pagination-query.dto';

export function toLimit(limit: PaginationQueryDto['limit']) {
    return isFinite(limit) ? limit : undefined;
}