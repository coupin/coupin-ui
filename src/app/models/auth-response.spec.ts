import { AuthResponse } from './auth-response';
import { User } from './user';

describe('AuthResponse', () => {
  it('should create an instance', () => {
    expect(new AuthResponse('kjdbdjbksb', new User())).toBeTruthy();
  });
});
