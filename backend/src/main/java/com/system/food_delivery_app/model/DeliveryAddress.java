package com.system.food_delivery_app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty; // Changed from JsonIgnore

@Entity
@Table(name = "delivery_addresses")
public class DeliveryAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) 
    private User user;

    @NotBlank
    @Size(max = 255)
    private String streetAddress;

    @NotBlank
    @Size(max = 100)
    private String city;

    @Size(max = 20)
    private String postalCode;
    
    @Size(max = 500)
    private String additionalInfo;

    public DeliveryAddress() {
    }

    public DeliveryAddress(User user, String streetAddress, String city, String postalCode, String additionalInfo) {
        this.user = user;
        this.streetAddress = streetAddress;
        this.city = city;
        this.postalCode = postalCode;
        this.additionalInfo = additionalInfo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    
    public String getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }
}