package com.example.travel.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoleID")
    private Integer roleID;

    @Column(name = "RoleName", unique = true, nullable = false, length = 50)
    private String roleName;

    // Constructors
    public Role() {
    }

    public Role(Integer roleID) {
        this.roleID = roleID;
    }

    public Role(Integer roleID, String roleName) {
        this.roleID = roleID;
        this.roleName = roleName;
    }

    // Getters and Setters
    public Integer getRoleID() {
        return roleID;
    }

    public void setRoleID(Integer roleID) {
        this.roleID = roleID;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}
