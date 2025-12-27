import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private isBcryptHash(s: string) {
    // hash bcrypt thường bắt đầu bằng $2a$ / $2b$ / $2y$
    return typeof s === 'string' && s.startsWith('$2');
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

    const dbPass = user.password;

    let ok = false;
    if (this.isBcryptHash(dbPass)) {
      ok = await bcrypt.compare(password, dbPass);
    } else {
      ok = password === dbPass;
    }

    if (!ok) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const access_token = await this.jwt.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
      },
    };
  }
}
