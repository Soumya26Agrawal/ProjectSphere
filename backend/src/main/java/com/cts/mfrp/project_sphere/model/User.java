package com.cts.mfrp.project_sphere .model;


import com.cts.mfrp.project_sphere.Enum.Role;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(name = "employee_id", nullable = false, unique = true)
    private Long employeeId;    //different from userid, userid is for the system

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number")
    private Long phoneNumber;

    @OneToMany(orphanRemoval = true)
    private List<Ticket> reportedTickets=new ArrayList<>();

    @OneToMany(orphanRemoval = true)
    private List<Ticket> assignedTickets=new ArrayList<>();
    @Enumerated(EnumType.STRING)
    @Column(name = "system_role", nullable = false)
    private Role role;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
