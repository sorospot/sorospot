package br.com.sorospot.domains;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "category")
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String type;
    private String color;
    private boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    @PrePersist
    public void prePersist() { createdAt = LocalDateTime.now(); }

    // getters/setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
