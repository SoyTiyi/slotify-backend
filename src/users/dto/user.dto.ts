import { IsString, IsEmail, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class UserDto {
    @IsString()
    clerkId: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @IsString()
    imageUrl?: string;
}