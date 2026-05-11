package com.system.food_delivery_app.service;

import com.system.food_delivery_app.dto.ProductDTO;
import com.system.food_delivery_app.model.Category;
import com.system.food_delivery_app.model.Product;
import com.system.food_delivery_app.repository.CategoryRepository;
import com.system.food_delivery_app.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Product addProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + productDTO.getCategoryId()));

        Product product = new Product();
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setImageUrl(productDTO.getImageUrl());

        if (productDTO.getAvailable() != null) {
            product.setAvailable(productDTO.getAvailable());
        } else {
            product.setAvailable(true);
        }

        product.setCategory(category);

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public Product updateProduct(Long id, ProductDTO productDTO) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDTO.getName());
            product.setDescription(productDTO.getDescription());
            product.setPrice(productDTO.getPrice());
            product.setImageUrl(productDTO.getImageUrl());
            
            if (productDTO.getAvailable() != null) {
                product.setAvailable(productDTO.getAvailable());
            }

            if (product.getCategory() == null || !product.getCategory().getId().equals(productDTO.getCategoryId())) {
                Category newCategory = categoryRepository.findById(productDTO.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found with ID: " + productDTO.getCategoryId()));
                product.setCategory(newCategory);
            }

            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }
    public Product toggleAvailability(Long id) {
    return productRepository.findById(id).map(product -> {
        product.setAvailable(!product.isAvailable());
        return productRepository.save(product);
    }).orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
}
}