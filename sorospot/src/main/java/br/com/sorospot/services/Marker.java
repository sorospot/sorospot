package br.com.sorospot.services;

public class Marker {
    private String id;
    private String title;
    private String description;
    private double lat;
    private double lng;

    public Marker() {}

    public Marker(String id, String title, String description, double lat, double lng) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.lat = lat;
        this.lng = lng;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }
    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }
}
