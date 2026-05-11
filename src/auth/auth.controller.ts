import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user/current-user.decorator';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    //      ↑           ↑
    //  Extracts     Automatically maps +
    //  req.body     validates the body
    //               against SignupDto shape
    return this.authService.signup(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Auth()
  @Get('test')
  test(@CurrentUser() user: { userId: string; email: string }) {
    return { message: 'Protected route working', user };
  }
}
