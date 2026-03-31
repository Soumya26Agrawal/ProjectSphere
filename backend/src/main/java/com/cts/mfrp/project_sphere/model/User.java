package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true)
    private Long employeeId;
    private String firstName;
    private String lastName;
    private String email;

    @JsonIgnore
    private String password;

    @Column(name = "phone_number")
    private Long phoneNumber;

    @OneToMany(mappedBy = "reporter", fetch=FetchType.LAZY, orphanRemoval = true)
//    @JsonIgnore
//    @Builder.Default
    private List<Ticket> reportedTickets = new ArrayList<>();

    @OneToMany(mappedBy = "assignee", fetch=FetchType.LAZY, orphanRemoval = true)
//    @JsonIgnore
//    @Builder.Default
    private List<Ticket> assignedTickets = new ArrayList<>();

    @OneToMany(mappedBy = "manager")
    @JsonIgnore
    @Builder.Default
    private List<Project> managedProjects = new ArrayList<>();

//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonIgnore
//    @Builder.Default
//    private List<ProjectTeam> teams = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(isActive);
    }
}