package com.system.food_delivery_app.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User {

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();

    public Customer() {
        super();
    }

    public Customer(String name, String email, String password, String phoneNumber) {
        super(name, email, password, phoneNumber);
    }

    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }
}