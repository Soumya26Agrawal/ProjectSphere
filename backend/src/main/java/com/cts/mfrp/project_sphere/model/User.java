package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.beans.PropertyEditor;
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


    private Long employeeId;
    private String firstName;
    private String lastName;
    private String email;

    private String password;

    @Column(name = "phone_number")
    private Long phoneNumber;

    @OneToMany(mappedBy = "reporter", fetch=FetchType.LAZY, orphanRemoval = true)

    @Builder.Default
    private List<Ticket> reportedTickets = new ArrayList<>();

    @OneToMany(mappedBy = "assignee", fetch=FetchType.LAZY, orphanRemoval = true)

    @Builder.Default
    private List<Ticket> assignedTickets = new ArrayList<>();

    @OneToMany(mappedBy = "manager", fetch=FetchType.LAZY)

    @Builder.Default
    private List<Project> managedProjects = new ArrayList<>();



    @Enumerated(EnumType.STRING)

    private Role role;


    @Builder.Default
    private Boolean isActive = true;

    @ManyToMany(mappedBy = "users")
    @Builder.Default
    private List<ProjectTeam> projectTeams=new ArrayList<>();

    @OneToMany(mappedBy = "designer")
    @Builder.Default
    private List<TestCase> testCasesDesigned=new ArrayList<>();

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