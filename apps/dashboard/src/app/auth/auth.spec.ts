import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token on successful login', () => {
    const mockResponse = { accessToken: 'fake-jwt-token' };
    const credentials = { email: 'test@test.com', password: 'password' };

    service.login(credentials).subscribe();

    const req = httpTestingController.expectOne('/api/auth/login');
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);

    expect(localStorage.getItem('jwt_token')).toEqual('fake-jwt-token');
    expect(service.getToken()).toEqual('fake-jwt-token');
  });

  it('should remove token on logout', () => {
    localStorage.setItem('jwt_token', 'test-token');

    service.logout();

    expect(localStorage.getItem('jwt_token')).toBeNull();
  });
});
