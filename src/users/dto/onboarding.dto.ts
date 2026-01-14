import { IsString, MinLength, MaxLength } from 'class-validator';

export class OnboardingDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    companyName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    category: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    address: string;
}