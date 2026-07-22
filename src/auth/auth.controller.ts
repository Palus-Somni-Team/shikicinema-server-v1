import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { AuthService } from './auth.service';

@Controller('auth')
@ApiExcludeController()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('upload-token')
    @HttpCode(HttpStatus.OK)
    async createUploadToken(@Body() shikimoriToken: { token: string }) {
        const token = await this.authService.createUploadToken(shikimoriToken.token);

        return token;
    }
}
