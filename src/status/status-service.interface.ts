import { ResponseStatusUptimeDto } from './dto';
import { ResponseStatusDto } from './dto/response-status.dto';

export interface StatusServiceInterface {
  getStatus(): Promise<ResponseStatusDto>;
  getUptime(): Promise<ResponseStatusUptimeDto>;
}
