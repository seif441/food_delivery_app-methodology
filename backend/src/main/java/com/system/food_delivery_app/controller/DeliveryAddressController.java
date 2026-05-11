package com.system.food_delivery_app.controller;

import com.system.food_delivery_app.model.DeliveryAddress;
import com.system.food_delivery_app.service.DeliveryAddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class DeliveryAddressController {

    private final DeliveryAddressService deliveryAddressService;
    public DeliveryAddressController(DeliveryAddressService deliveryAddressService) {
        this.deliveryAddressService = deliveryAddressService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryAddress>> getAddressesByUser(@RequestParam Long userId) {
        List<DeliveryAddress> addresses = deliveryAddressService.findAddressesByUserId(userId);
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryAddress> getAddressById(@PathVariable Long id) {
        return deliveryAddressService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DeliveryAddress> createAddress(@Valid @RequestBody DeliveryAddress address) {
        DeliveryAddress createdAddress = deliveryAddressService.save(address);
        return new ResponseEntity<>(createdAddress, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryAddress> updateAddress(@PathVariable Long id, @Valid @RequestBody DeliveryAddress addressDetails) {
        return deliveryAddressService.update(id, addressDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        if (deliveryAddressService.findById(id).isPresent()) {
            deliveryAddressService.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}