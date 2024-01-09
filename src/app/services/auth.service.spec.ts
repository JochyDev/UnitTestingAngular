import { TestBed } from '@angular/core/testing';
import { AuthService } from "./auth.service";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TokenService } from './token.service';
import { Auth } from '../../models/auth.model';
import { environment } from '../../environments/environment';

describe("AuthService", () => {
  let authService: AuthService;
  let tokenService: TokenService;
  let httpController: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        AuthService,
        TokenService,
      ]
    });
    authService = TestBed.inject(AuthService);
    tokenService = TestBed.inject(TokenService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  })

  it('should be create', () => {
    expect(authService).toBeTruthy();
  })

  describe('tests for login', () => {
    it('should return a token', (doneFn) => {
      //Arrange
      const mockData: Auth = {
        access_token: '121212'
      };
      const email = 'nico@gmail.com';
      const password = '1212';
      //Act
      authService.login(email, password)
      .subscribe((data) => {
        expect(data).toEqual(mockData)
        //Assert
        doneFn()
      })

      // http config
      const url = `${environment.API_URL}/api/v1/auth/login`
      const req = httpController.expectOne(url)
      req.flush(mockData);
    })

    it('should call saveToken', (doneFn) => {
      //Arrange
      const mockData: Auth = {
        access_token: '121212'
      };
      const email = 'nico@gmail.com';
      const password = '1212';

      spyOn(tokenService, 'saveToken').and.callThrough();
      //Act
      authService.login(email, password)
      .subscribe((data) => {
        expect(data).toEqual(mockData)
        expect(tokenService.saveToken).toHaveBeenCalledTimes(1);
        expect(tokenService.saveToken).toHaveBeenCalledOnceWith('121212');
        //Assert
        doneFn()
      })

      // http config
      const url = `${environment.API_URL}/api/v1/auth/login`
      const req = httpController.expectOne(url)
      req.flush(mockData);
    })
  })
});
