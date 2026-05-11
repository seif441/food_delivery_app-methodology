package com.system.food_delivery_app.controller;

import com.system.food_delivery_app.dto.ProductDTO;
import com.system.food_delivery_app.model.Product;
import com.system.food_delivery_app.service.AdminService;
import com.system.food_delivery_app.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    private final AdminService adminService;

    public ProductController(ProductService productService, AdminService adminService) {
        this.productService = productService;
        this.adminService = adminService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@Valid @RequestBody ProductDTO productDTO) {
        try {
            Product newProduct = productService.addProduct(productDTO);
            return ResponseEntity.ok(newProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }

    @PutMapping("/{id}/toggle-availability")
public ResponseEntity<?> toggleProductAvailability(@PathVariable Long id) {
    try {
        Product updatedProduct = productService.toggleAvailability(id);
        return ResponseEntity.ok(updatedProduct);
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}


@PutMapping("/update/{id}")
public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
    Product updatedProduct = adminService.updateMenuItem(id, product);
    return ResponseEntity.ok(updatedProduct);
}
}
