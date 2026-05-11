package com.system.food_delivery_app.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("STAFF")
public class Staff extends User {
    public Staff() {
        super();
    }
}