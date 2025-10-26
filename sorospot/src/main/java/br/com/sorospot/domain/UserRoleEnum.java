package br.com.sorospot.domain;

public enum UserRoleEnum {
    USER("USER"),
    ADMIN("ADMIN"),
    PUBLIC_ENTITIES("PUBLIC_ENTITIES");

    private final String role;

    UserRoleEnum(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public static UserRoleEnum fromString(String role) {
        if (role == null) {
            return null;
        }
        for (UserRoleEnum userRole : UserRoleEnum.values()) {
            if (userRole.role.equalsIgnoreCase(role)) {
                return userRole;
            }
        }
        return null;
    }

    public boolean equals(String role) {
        return this.role.equalsIgnoreCase(role);
    }

    public boolean isAdmin() {
        return this == ADMIN;
    }

    public boolean isUser() {
        return this == USER;
    }

    public boolean isPublicEntity() {
        return this == PUBLIC_ENTITIES;
    }
}
