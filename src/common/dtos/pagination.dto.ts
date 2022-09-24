import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType()
export class PaginationInputType {
    @Field(type => Int, { defaultValue: 1 })
    page: number;
}

@ObjectType()
export class PaginationOutputType extends CoreOutput {
    @Field(type => Int, { nullable: true })
    totalPages?: number;
}

