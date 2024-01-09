import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProductsService } from '../../services/product.service';
import { Product } from '../../../models/product.model';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CurrencyPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit{
  productService = inject(ProductsService)
  products: Product[] = [];

  ngOnInit(): void {
    this.getAllProducts()
  }

  getAllProducts(){
    this.productService.getAllSimple()
    .subscribe( products => {
      this.products = products
    })
  }
}
