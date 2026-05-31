import { IsArray, ArrayMaxSize, ArrayMinSize, IsInt, IsPositive } from 'class-validator';

export class GetBatchByIdsDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1000)
    @IsInt({ each: true })
    @IsPositive({ each: true })
    ids!: number[];
}
