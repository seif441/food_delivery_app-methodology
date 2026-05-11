package com.system.food_delivery_app.service;

import com.system.food_delivery_app.model.DeliveryAddress;
import com.system.food_delivery_app.repository.DeliveryAddressRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class DeliveryAddressService {

    private final DeliveryAddressRepository deliveryAddressRepository;

    public DeliveryAddressService(DeliveryAddressRepository deliveryAddressRepository) {
        this.deliveryAddressRepository = deliveryAddressRepository;
    }

    public Optional<DeliveryAddress> findById(Long id) {
        return deliveryAddressRepository.findById(id);
    }

    public List<DeliveryAddress> findAddressesByUserId(Long userId) {
        return deliveryAddressRepository.findByUserId(userId);
    }

    public DeliveryAddress save(DeliveryAddress address) {
        return deliveryAddressRepository.save(address);
    }

    public Optional<DeliveryAddress> update(Long id, DeliveryAddress updatedAddress) {
        return deliveryAddressRepository.findById(id).map(existingAddress -> {
            existingAddress.setStreetAddress(updatedAddress.getStreetAddress());
            existingAddress.setCity(updatedAddress.getCity());
            existingAddress.setPostalCode(updatedAddress.getPostalCode());
            existingAddress.setAdditionalInfo(updatedAddress.getAdditionalInfo());
            
            return deliveryAddressRepository.save(existingAddress);
        });
    }

    public void deleteById(Long id) {
        deliveryAddressRepository.deleteById(id);
    }
}