package com.system.food_delivery_app.service;

import org.springframework.stereotype.Service;
import com.system.food_delivery_app.model.Cart;
import com.system.food_delivery_app.model.CartItem;
import com.system.food_delivery_app.model.Customer;
import com.system.food_delivery_app.model.Product;
import com.system.food_delivery_app.repository.CartRepository;
import com.system.food_delivery_app.repository.CustomerRepository;
import com.system.food_delivery_app.repository.ProductRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class CartService {
    
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public CartService(CartRepository cartRepository, 
                       ProductRepository productRepository, 
                       CustomerRepository customerRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional
    public Cart getOrCreateCart(Long customerId) {
        if (customerId == null) throw new IllegalArgumentException("Customer ID cannot be null");
        
        Cart cart = cartRepository.findByCustomerId(customerId);
        
        if (cart == null) {
            Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
            
            cart = new Cart();
            cart.setCustomer(customer);
            cart.setItems(new ArrayList<>());
            cart = cartRepository.save(cart);
        }
        
        cart.calculateTotal();
        return cart;
    }

    public Cart getCart(Long cartId) {
        if (cartId == null) throw new IllegalArgumentException("Cart ID cannot be null");
        
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with ID: " + cartId));
        cart.calculateTotal();
        return cart;
    }

    @Transactional
    public Cart addItemToCart(Long cartId, Long productId, int quantity) {
        if (cartId == null || productId == null) throw new IllegalArgumentException("IDs required");
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
        
        Cart cart = getCart(cartId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.isAvailable()) {
            throw new RuntimeException("Product '" + product.getName() + "' is not available");
        }
        
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.calculateSubTotal();
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setCart(cart);
            newItem.calculateSubTotal();
            cart.getItems().add(newItem);
        }
        
        cart.calculateTotal();
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItemFromCart(Long cartId, Long productId) {
        if (cartId == null || productId == null) throw new IllegalArgumentException("IDs required");
        
        Cart cart = getCart(cartId);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));

        cart.calculateTotal();
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItemQuantity(Long cartId, Long productId, int quantity) {
        if (quantity <= 0) return removeItemFromCart(cartId, productId);
        
        Cart cart = getCart(cartId);
        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            item.setQuantity(quantity);
            item.calculateSubTotal();
            cart.calculateTotal();
            return cartRepository.save(cart);
        }
        
        throw new RuntimeException("Item not found");
    }

    @Transactional
    public void clearCart(Long cartId) {
        if (cartId == null) throw new IllegalArgumentException("Cart ID cannot be null");
        
        Cart cart = getCart(cartId);
        cart.getItems().clear();
        cart.calculateTotal(); 
        cartRepository.save(cart);
    }
    
    @Transactional
    public void deleteCart(Long cartId) {
        cartRepository.deleteById(cartId);
    }
}