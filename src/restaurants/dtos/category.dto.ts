import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationInputType, PaginationOutputType } from '../../common/dtos/pagination.dto';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@InputType()
export class CategoryInput extends PaginationInputType {
    @Field(type => String)
    slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutputType {
    @Field(type => Category, { nullable: true })
    category?: Category;
}
