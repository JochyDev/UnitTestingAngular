import { TestBed } from '@angular/core/testing';
import { ProductsService } from "./product.service";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment.development';
import { genarateManyProducts, geneateOneProduct } from '../../models/product.mock';
import { CreateProductDTO, Product, UpdateProductDTO } from '../../models/product.model';
import { HTTP_INTERCEPTORS, HttpStatusCode } from '@angular/common/http';
import { TokenInterceptor } from '../interceptors/token.interceptor';
import { TokenService } from './token.service';

describe("ProductsService", () => {
  let productService: ProductsService;
  let tokenService: TokenService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        ProductsService,
        TokenService,
        {
          provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true
        }
      ]
    });
    productService = TestBed.inject(ProductsService);
    tokenService = TestBed.inject(TokenService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  })
 
  it('should be created', () => {
    expect(productService).toBeTruthy();
  });

  describe('tests for getAllSimple', () => {
    it('should return a product list', (doneFn) => {
      //Arrange
      const mockData: Product[] = genarateManyProducts(2);
      spyOn(tokenService, 'getToken').and.returnValue('123')
      //Act
      productService.getAllSimple()
      .subscribe((data) => {
        expect(data.length).toEqual(mockData.length)
        expect(data).toEqual(mockData)
        //Assert
        doneFn()
      })

      // http config
      const url = `${environment.API_URL}/api/v1/products`
      const req = httpController.expectOne(url)
      const headers = req.request.headers;
      expect(headers.get('Authorization')).toEqual(`Bearer ${123}`)
      req.flush(mockData);
    })
  })

  describe('tests for getAll', () => {
    it('should return a product list', (doneFn) => {
      //Arrange
      const mockData: Product[] = genarateManyProducts(3);
      //Act
      productService.getAll()
      .subscribe((data) => {
        expect(data.length).toEqual(mockData.length)
        //Assert
        doneFn()
      })

      // http config
      const url = `${environment.API_URL}/api/v1/products`
      const req = httpController.expectOne(url)
      req.flush(mockData);
    })

    it('should return a product list with taxes', (doneFn) => {
      //Arrange
      const mockData: Product[] = [
        {
          ...geneateOneProduct(),
          price: 100, //100 *.19 = 19
        },
        {
          ...geneateOneProduct(),
          price: 200, //200 *.19 = 38
        },
        {
          ...geneateOneProduct(),
          price: 0, //0 *.19 = 0
        },
        {
          ...geneateOneProduct(),
          price: -100, // = 0
        }
      ]

      //Act
      productService.getAll()
      .subscribe((data) => {
        expect(data.length).toEqual(mockData.length)
        expect(data[0].taxes).toEqual(19)
        expect(data[1].taxes).toEqual(38)
        expect(data[2].taxes).toEqual(0)
        expect(data[3].taxes).toEqual(0)
        //Assert
        doneFn()
      })

      // http config
      const url = `${environment.API_URL}/api/v1/products`
      const req = httpController.expectOne(url)
      req.flush(mockData);
    })

    it('should send query params with limit 10 and offset 3', (doneFn) => {
      //Arrange
      const mockData: Product[] = genarateManyProducts(3);
      const limit = 10;
      const offset = 3;
      //Act
      productService.getAll(limit, offset)
      .subscribe((data) => {
        //Assert
        expect(data.length).toEqual(mockData.length)
        doneFn()
      })

      // http config
      const url = `${environment.API_URL}/api/v1/products?limit=${limit}&offset=${offset}`
      const req = httpController.expectOne(url)
      req.flush(mockData);
      const params = req.request.params;
      expect(params.get('limit')).toEqual(`${limit}`)
      expect(params.get('offset')).toEqual(`${offset}`)
    })

  })

  describe('test for create', () => {
    it('should return a new  product', (doneFn) => {
      //Arrange
      const mockData = geneateOneProduct();
      const dto: CreateProductDTO = {
        title: 'New Product',
        price: 100,
        images: ['img'],
        description: 'bla bla bla',
        categoryId: 12
      }
      //Act
      productService.create({...dto})
      .subscribe(data => {
        expect(data).toEqual(mockData)
        doneFn();
      })
      //Assert
      const url = `${environment.API_URL}/api/v1/products`
      const req = httpController.expectOne(url)
      req.flush(mockData);
      expect(req.request.body).toEqual(dto)
      expect(req.request.method).toEqual('POST')
    })
  })

  describe('test for update', () => {
    it('should return a updated product', (doneFn) => {
      //Arrange
      const mockData = geneateOneProduct();
      const dto: UpdateProductDTO = {
        title: 'New Product',
        description: 'bla bla bla',
      }
      //Act
      productService.update(mockData.id, {...dto})
      .subscribe(data => {
        expect(data).toEqual(mockData)
        doneFn();
      })
      //Assert
      const url = `${environment.API_URL}/api/v1/products/${mockData.id}`
      const req = httpController.expectOne(url)
      req.flush(mockData);
      expect(req.request.body).toEqual(dto)
      expect(req.request.method).toEqual('PUT')
    })
  })

  describe('test for delete', () => {
    it('should delete a product', (doneFn) => {
      //Arrange
      const mockData = true;
      const productId = '1'
      //Act
      productService.delete(productId)
      .subscribe(data => {
        expect(data).toEqual(true)
        doneFn();
      })
      //Assert
      const url = `${environment.API_URL}/api/v1/products/${productId}`
      const req = httpController.expectOne(url)
      req.flush(mockData);
      expect(req.request.method).toEqual('DELETE')
    })
  })

  describe('test for getOne', () => {
    it('should return the right msg when status code is 404', (doneFn) => {
      //Arrange
      const productId = '1'
      const msgError = '404 message'
      const mockError = {
        status: HttpStatusCode.NotFound,
        statusText: msgError
      }
      //Act
      productService.getOne(productId)
      .subscribe({
        error: (error) => {
          //Assert
          expect(error).toEqual('El producto no existe');
          doneFn()
        }
      })

      //http config
      const url = `${environment.API_URL}/api/v1/products/${productId}`
      const req = httpController.expectOne(url)
      expect(req.request.method).toEqual('GET')
      req.flush(msgError, mockError);
    })
    it('should return the right msg when status code is 409', (doneFn) => {
      //Arrange
      const productId = '1'
      const msgError = '409 message'
      const mockError = {
        status: HttpStatusCode.Conflict,
        statusText: msgError
      }
      //Act
      productService.getOne(productId)
      .subscribe({
        error: (error) => {
          //Assert
          expect(error).toEqual('Algo esta fallando en el server');
          doneFn()
        }
      })

      //http config
      const url = `${environment.API_URL}/api/v1/products/${productId}`
      const req = httpController.expectOne(url)
      expect(req.request.method).toEqual('GET')
      req.flush(msgError, mockError);
    })
    it('should return the right msg when status code is 401', (doneFn) => {
      //Arrange
      const productId = '1'
      const msgError = '401 message'
      const mockError = {
        status: HttpStatusCode.Unauthorized,
        statusText: msgError
      }
      //Act
      productService.getOne(productId)
      .subscribe({
        error: (error) => {
          //Assert
          expect(error).toEqual('No estas permitido');
          doneFn()
        }
      })

      //http config
      const url = `${environment.API_URL}/api/v1/products/${productId}`
      const req = httpController.expectOne(url)
      expect(req.request.method).toEqual('GET')
      req.flush(msgError, mockError);
    })
    it('should return the right msg when don\'t are status code', (doneFn) => {
      //Arrange
      const productId = '1'
      const msgError = 'Error message'
      const mockError = {
        status: HttpStatusCode.InternalServerError,
        statusText: msgError
      }
      //Act
      productService.getOne(productId)
      .subscribe({
        error: (error) => {
          //Assert
          expect(error).toEqual('Ups algo salio mal');
          doneFn()
        }
      })

      //http config
      const url = `${environment.API_URL}/api/v1/products/${productId}`
      const req = httpController.expectOne(url)
      expect(req.request.method).toEqual('GET')
      req.flush(msgError, mockError);
    })

    it('should return a one product', (doneFn) => {
      //Arrange
      const mockData = geneateOneProduct();
      const productId = '1'
      //Act
      productService.getOne(productId)
      .subscribe(data => {
        expect(data).toEqual(mockData)
        doneFn();
      })
      //Assert
      const url = `${environment.API_URL}/api/v1/products/${productId}`
      const req = httpController.expectOne(url)
      expect(req.request.method).toEqual('GET')
      req.flush(mockData);
    })
  })

});
