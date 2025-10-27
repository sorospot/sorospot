package br.com.sorospot.domains;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "occurrence")
public class Occurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(length = 500, nullable = false)
    private String description;

    @Deprecated
    @Column(length = 100)
    private String photo;

    @Column(length = 100)
    private String status;

    @Column(length = 100)
    private String address;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(nullable = false)
    private Boolean deleted;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "title", length = 100)
    private String title;

    private String color;

    public Occurrence() {}

    @OneToMany(mappedBy = "occurrence", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Photo> photos = new java.util.ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (deleted == null) deleted = false;
        createdAt = LocalDateTime.now(); 
    }

    public Occurrence(User user, Category category, String description, String photo, String status, String address, 
    BigDecimal latitude, BigDecimal longitude, Boolean deleted, LocalDateTime createdAt, LocalDateTime lastUpdated) {
        this.user = user;
        this.category = category;
        this.description = description;
        this.photo = photo;
        this.status = status;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.deleted = deleted;
        this.createdAt = createdAt;
        this.lastUpdated = lastUpdated;
    }

    public Integer getId() { 
        return id;
    }
    public void setId(Integer id) {
         this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getPhoto() {
         return photo; 
    }

    public void setPhoto(String photo) {
         this.photo = photo; 
    }

    public java.util.List<Photo> getPhotos() {
         return photos; 
    }

    public void setPhotos(java.util.List<Photo> photos) {
         this.photos = photos; 
    }

    public String getColor() {
         return color; 
    }

    public void setColor(String color) {
         this.color = color; 
    }

    public String getTitle() {
         return title;
    }

    public void setTitle(String title) {
         this.title = title; 
    }

    @Override
    public String toString() {
        return "Occurrence{" +
                "id=" + id +
                ", user=" + user.getName() +
                ", category=" + category.getType() +
                ", description='" + description + '\'' +
                ", photo='" + photo + '\'' +
                ", status='" + status + '\'' +
                ", address='" + address + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", deleted=" + deleted +
                ", createdAt=" + createdAt +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}
