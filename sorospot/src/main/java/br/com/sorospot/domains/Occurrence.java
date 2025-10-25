package br.com.sorospot.domains;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "occurrence")
public class Occurrence {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    @Column(length = 500)
    private String description;
    //@deprecated migrated to Photo entity
    @Deprecated
    private String photo;
    private String color;
    private String title;
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private String status;
    private String address;
    private boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "occurrence", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Photo> photos = new java.util.ArrayList<>();

    @PrePersist
    public void prePersist() { createdAt = LocalDateTime.now(); }

    // getters/setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }
    public java.util.List<Photo> getPhotos() { return photos; }
    public void setPhotos(java.util.List<Photo> photos) { this.photos = photos; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public java.math.BigDecimal getLatitude() { return latitude; }
    public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }
    public java.math.BigDecimal getLongitude() { return longitude; }
    public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
