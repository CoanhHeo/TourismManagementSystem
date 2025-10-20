package com.example.travel.dto;

public class PromotionStatsDTO {
    private int total;
    private int active;
    private int expired;
    private int upcoming;

    public PromotionStatsDTO() {
    }

    public PromotionStatsDTO(int total, int active, int expired, int upcoming) {
        this.total = total;
        this.active = active;
        this.expired = expired;
        this.upcoming = upcoming;
    }

    // Getters and Setters
    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getActive() {
        return active;
    }

    public void setActive(int active) {
        this.active = active;
    }

    public int getExpired() {
        return expired;
    }

    public void setExpired(int expired) {
        this.expired = expired;
    }

    public int getUpcoming() {
        return upcoming;
    }

    public void setUpcoming(int upcoming) {
        this.upcoming = upcoming;
    }
}
