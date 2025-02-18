import { Injectable, inject, signal } from "@angular/core";
import { Product } from "./product.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, Observable, of, tap } from "rxjs";

@Injectable({
    providedIn: "root"
}) export class ProductsService {

    private readonly http = inject(HttpClient);
    private readonly path = "http://localhost:3000/products";
    
    private readonly _products = signal<Product[]>([]);

    public readonly products = this._products.asReadonly();

    private getHeaders(): HttpHeaders {
        // Get the token from localstorage
        const token = localStorage.getItem('authToken');
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    

    public get(): Observable<Product[]> {
        return this.http.get<Product[]>(this.path).pipe(
            catchError((error) => {
                return this.http.get<Product[]>("assets/products.json");
            }),
            tap((products) => this._products.set(products)),
        );
    }

    public create(product: Product): Observable<Product> {
        return this.http.post<Product>(this.path, product, { headers: this.getHeaders() }).pipe(
            tap((newProduct) => {
                this._products.update(products => [newProduct, ...products]);
            }),
            catchError(() => {
                return of(product);
            }),
        );
    }

    public update(product: Product): Observable<boolean> {
        return this.http.patch<boolean>(`${this.path}/${product.id}`, product, { headers: this.getHeaders() }).pipe(
            catchError(() => {
                return of(true);
            }),
            tap(() => this._products.update(products => {
                return products.map(p => p.id === product.id ? product : p)
            })),
        );
    }

    public delete(productId: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.path}/${productId}`, { headers: this.getHeaders() }).pipe(
            catchError(() => {
                return of(true);
            }),
            tap(() => this._products.update(products => products.filter(product => product.id !== productId))),
        );
    }
}