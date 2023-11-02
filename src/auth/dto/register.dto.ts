import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    readonly nickname: string

    @IsEmail()
    readonly email: string

    @IsString()
    @MinLength(6)
    readonly password: string
}