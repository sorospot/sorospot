package br.com.sorospot.services;

public class GeocodeResult {
    private String formattedAddress;
    private double lat;
    private double lng;
    private String status;

    public GeocodeResult() {}

    public GeocodeResult(String formattedAddress, double lat, double lng, String status) {
        this.formattedAddress = formattedAddress;
        this.lat = lat;
        this.lng = lng;
        this.status = status;
    }

    public String getFormattedAddress() { return formattedAddress; }
    public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }
    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }
    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
