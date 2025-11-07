import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TourService } from '../../../app/core/services/api/tour.service';
import { AuthService } from '../../../app/core/services/api/auth.service';
import { ToastService } from '../../../app/shared/services/toast.service';
import { Tour, User } from '../../../app/shared/models/interfaces';
import { LanguageSwitcherComponent } from '../../../app/shared/components/language-switcher.component';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div class="tour-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-top">
            <div class="logo-section">
              <i class="logo-icon">🌍</i>
              <span class="brand-name">TravelViet</span>
            </div>
            
            <!-- Language Switcher -->
            <app-language-switcher></app-language-switcher>
            
            <!-- User Profile Section -->
            <div class="user-section">
              <!-- ===== AUTHENTICATED VIEW (Logged In User) ===== -->
              <div *ngIf="currentUser" class="authenticated-view">
                <div class="user-profile-simple">
                  <div class="user-welcome">
                    <i class="welcome-icon">👋</i>
                    <span class="greeting-text">Xin chào, {{ currentUser.fullname || currentUser.fullname }}</span>
                  </div>
                  <div class="user-actions">
                    <button class="action-btn profile-btn" (click)="viewProfile()" [title]="'AUTH.PROFILE' | translate">
                      <i class="btn-icon">👤</i>
                      {{ 'AUTH.PROFILE' | translate }}
                    </button>
                    <button class="action-btn bookings-btn" (click)="viewBookings()" [title]="'COMMON.MY_BOOKINGS' | translate">
                      <i class="btn-icon">📋</i>
                      {{ 'COMMON.MY_BOOKINGS' | translate }}
                    </button>
                    <button class="logout-btn-simple" (click)="logout()" [title]="'COMMON.LOGOUT' | translate">
                      <i class="btn-icon">🚪</i>
                      {{ 'COMMON.LOGOUT' | translate }}
                    </button>
                  </div>
                </div>
                
                <!-- User Status Badge -->
                                <div class="user-status-badge">
                  <span class="status-indicator {{ getUserStatusClass(currentUser.status || 'active') }}"></span>
                  <span class="status-text">{{ getUserStatusText(currentUser.status || 'active') }}</span>
                </div>
              </div>
              
              <!-- ===== GUEST VIEW (Not Logged In) ===== -->
              <div *ngIf="!currentUser" class="guest-view">
                <div class="guest-welcome">
                  <i class="guest-icon">🌟</i>
                </div>
                <div class="guest-actions">
                  <button class="auth-btn login-btn" (click)="navigateToLogin()" [title]="'COMMON.LOGIN' | translate">
                    <i class="btn-icon">🔑</i>
                    <span>{{ 'COMMON.LOGIN' | translate }}</span>
                  </button>
                  <button class="auth-btn register-btn" (click)="navigateToRegister()" [title]="'COMMON.REGISTER' | translate">
                    <i class="btn-icon">👤</i>
                    <span>{{ 'COMMON.REGISTER' | translate }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="header-main">
            <h1 class="main-title">
              <i class="icon">🌍</i>
              {{ 'TOUR.LIST_TITLE' | translate }}
            </h1>
            <p class="subtitle">{{ 'TOUR.SUBTITLE' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-box">
            <i class="search-icon">🔍</i>
            <input 
              type="text" 
              [placeholder]="'TOUR.SEARCH_PLACEHOLDER' | translate"
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              class="search-input"
            />
          </div>
          <div class="filter-buttons">
            <button 
              class="filter-btn" 
              [class.active]="selectedFilter === 'all'"
              (click)="setFilter('all')"
            >
              {{ 'TOUR.FILTER_ALL' | translate }}
            </button>
            <button 
              class="filter-btn" 
              [class.active]="selectedFilter === 'popular'"
              (click)="setFilter('popular')"
            >
              {{ 'TOUR.FILTER_POPULAR' | translate }}
            </button>
            <button 
              class="filter-btn" 
              [class.active]="selectedFilter === 'new'"
              (click)="setFilter('new')"
            >
              {{ 'TOUR.FILTER_NEW' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ 'TOUR.LOADING' | translate }}</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <div class="error-content">
          <i class="error-icon">⚠️</i>
          <h3>{{ 'TOUR.ERROR_TITLE' | translate }}</h3>
          <p>{{ error }}</p>
          <button class="retry-btn" (click)="loadTours()">{{ 'TOUR.RETRY' | translate }}</button>
        </div>
      </div>

      <!-- Tours Grid -->
      <div *ngIf="!loading && !error" class="tours-section">
        <div class="tours-header">
          <h2>
            <span class="tours-count">{{ filteredTours.length }}</span>
            {{ 'TOUR.TOURS_FOUND' | translate }}
          </h2>
          <div class="view-toggle">
            <button 
              class="view-btn" 
              [class.active]="viewMode === 'grid'"
              (click)="viewMode = 'grid'"
              [title]="'TOUR.VIEW_GRID' | translate"
            >
              ⊞
            </button>
            <button 
              class="view-btn" 
              [class.active]="viewMode === 'list'"
              (click)="viewMode = 'list'"
              [title]="'TOUR.VIEW_LIST' | translate"
            >
              ☰
            </button>
          </div>
        </div>

        <!-- No Results -->
        <div *ngIf="filteredTours.length === 0" class="no-results">
          <div class="no-results-content">
            <i class="no-results-icon">🔍</i>
            <h3>{{ 'TOUR.NO_TOURS_FOUND' | translate }}</h3>
            <p>{{ 'TOUR.NO_TOURS_MESSAGE' | translate }}</p>
          </div>
        </div>

        <!-- Tours Grid View -->
        <div *ngIf="viewMode === 'grid'" class="tours-grid">
          <div *ngFor="let tour of filteredTours; trackBy: trackByTourId" class="tour-card">
            <div class="tour-image">
              <img 
                [src]="getDefaultImage(tour)" 
                [alt]="getTourName(tour)"
                (error)="onImageError($event)"
              />
              <div class="tour-badge">
                <span class="badge-text">{{ getBadgeText(tour) }}</span>
              </div>
            </div>
            
            <div class="tour-content">
              <div class="tour-header">
                <h3 class="tour-title">{{ getTourName(tour) }}</h3>
                <div class="tour-rating">
                  <span class="stars">★★★★★</span>
                  <span class="rating-text">(5.0)</span>
                </div>
              </div>
              
              <div class="tour-details">
                <div class="detail-item">
                  <i class="detail-icon">📍</i>
                  <span>{{ getTourDestination(tour) }}</span>
                </div>
                <div class="detail-item" >
                  <i class="detail-icon">⏰</i>
                  <span>{{ '3 ngày 2 đêm' }}</span>
                </div>
                <div class="detail-item" >
                  <i class="detail-icon">👥</i>
                  <span>{{ 'Tối đa 20' }} {{ 'TOUR.MAX_GUESTS' | translate }}</span>
                </div>
              </div>

              <div class="tour-description" *ngIf="tour.description">
                <p>{{ tour.description || 'Khám phá những điểm đến tuyệt vời với dịch vụ chuyên nghiệp và trải nghiệm đáng nhớ.' }}</p>
              </div>

              <div class="tour-footer">
                <div class="price-section" *ngIf="getTourPrice(tour) > 0">
                  <span class="price-label">{{ 'TOUR.PRICE_FROM' | translate }}</span>
                  <span class="price">{{ formatPrice(getTourPrice(tour)) }}</span>
                  <span class="price-unit">{{ 'TOUR.PRICE_PER_PERSON' | translate }}</span>
                </div>
                <div class="tour-actions">
                  <button class="btn-secondary" (click)="viewTourDetails(tour)">
                    {{ 'TOUR.DETAILS' | translate }}
                  </button>
                  <button class="btn-primary" (click)="bookTour(tour)">
                    {{ 'TOUR.BOOK_TOUR' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tours List View -->
        <div *ngIf="viewMode === 'list'" class="tours-list">
          <div *ngFor="let tour of filteredTours; trackBy: trackByTourId" class="tour-list-item">
            <div class="tour-list-image">
              <img 
                [src]="getDefaultImage(tour)" 
                [alt]="getTourName(tour)"
                (error)="onImageError($event)"
              />
            </div>
            
            <div class="tour-list-content">
              <div class="tour-list-header">
                <h3 class="tour-list-title">{{ getTourName(tour) }}</h3>
                <div class="tour-list-price" *ngIf="getTourPrice(tour) > 0">
                  <span class="price">{{ formatPrice(getTourPrice(tour)) }}</span>
                  <span class="price-unit">₫</span>
                </div>
              </div>
              
              <div class="tour-list-details">
                <span class="detail-item">
                  <i class="detail-icon">📍</i>
                  {{ getTourDestination(tour) }}
                </span>
                <span class="detail-item">
                  <i class="detail-icon">⏰</i>
                  {{ '3 ngày 2 đêm' }}
                </span>
                <span class="detail-item">
                  <i class="detail-icon">★</i>
                  5.0 (125 đánh giá)
                </span>
              </div>

              <div class="tour-list-description">
                <p>{{ tour.description || 'Khám phá những điểm đến tuyệt vời với dịch vụ chuyên nghiệp và trải nghiệm đáng nhớ.' }}</p>
              </div>

              <div class="tour-list-actions">
                <button class="btn-outline" (click)="viewTourDetails(tour)">
                  {{ 'TOUR.VIEW_DETAILS' | translate }}
                </button>
                <button class="btn-primary" (click)="bookTour(tour)">
                  {{ 'TOUR.BOOK_NOW' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tour-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header-section {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
      padding: 20px 20px 60px 20px;
      color: white;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 2rem;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
      display: inline-block;
      transform: rotate(0deg);
    }

    .brand-name {
      font-size: 1.5rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .user-section {
      display: flex;
      align-items: center;
    }

    /* User Profile Styles */
    .user-profile {
      display: flex;
      align-items: center;
      gap: 15px;
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.15);
      padding: 10px 15px;
      border-radius: 25px;
      backdrop-filter: blur(10px);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .avatar-icon {
      font-size: 1.2rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      line-height: 1;
    }

    .user-status {
      font-size: 0.75rem;
      opacity: 0.8;
      margin-top: 2px;
    }

    .user-menu {
      position: relative;
    }

    .menu-btn {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.15);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .menu-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }

    .menu-icon {
      font-size: 1rem;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      padding: 8px 0;
      min-width: 200px;
      z-index: 1000;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #333;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
    }

    .menu-item:hover {
      background: #f8f9fa;
    }

    .logout-btn:hover {
      background: #fee;
      color: #dc3545;
    }

    .item-icon {
      font-size: 1rem;
      width: 20px;
    }

    .menu-divider {
      height: 1px;
      background: #e9ecef;
      margin: 8px 0;
    }

    /* ===== AUTHENTICATED VIEW STYLES ===== */
    .authenticated-view {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: flex-end;
    }

    .user-profile-simple {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(255, 255, 255, 0.15);
      padding: 15px 20px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .user-welcome {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .welcome-icon {
      font-size: 1.2rem;
      animation: wave 2s ease-in-out infinite;
    }

    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(20deg); }
      75% { transform: rotate(-20deg); }
    }

    .greeting-text {
      color: white;
      font-weight: 600;
      font-size: 1rem;
    }

    .user-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 15px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-size: 13px;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }

    .profile-btn:hover {
      background: rgba(74, 144, 226, 0.3);
    }

    .bookings-btn:hover {
      background: rgba(52, 168, 83, 0.3);
    }

    .logout-btn-simple {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: rgba(220, 53, 69, 0.2);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: white;
      border-radius: 15px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-size: 13px;
    }

    .logout-btn-simple:hover {
      background: rgba(220, 53, 69, 0.4);
      border-color: rgba(220, 53, 69, 0.6);
      transform: translateY(-2px);
    }

    .user-status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.1);
      padding: 6px 12px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    .status-indicator.active {
      background: #4caf50;
    }

    .status-indicator.pending {
      background: #ff9800;
    }

    .status-indicator.suspended {
      background: #f44336;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .status-text {
      color: white;
      font-size: 12px;
      font-weight: 500;
    }

    /* ===== GUEST VIEW STYLES ===== */
    .guest-view {
      display: flex;
      flex-direction: column;
      gap: 15px;
      align-items: center;
      text-align: center;
      max-width: 350px;
    }

    .guest-welcome {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.1);
      padding: 12px 20px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .guest-icon {
      font-size: 1.5rem;
      animation: sparkle 3s ease-in-out infinite;
    }

    @keyframes sparkle {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(10deg); }
    }

    .guest-message {
      color: white;
      font-weight: 600;
      font-size: 1rem;
    }

    .guest-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .auth-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-size: 14px;
      text-decoration: none;
    }

    .auth-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .login-btn {
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.3), rgba(103, 178, 111, 0.3));
      border-color: rgba(74, 144, 226, 0.5);
    }

    .login-btn:hover {
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.5), rgba(103, 178, 111, 0.5));
      border-color: rgba(74, 144, 226, 0.8);
    }

    .register-btn {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(255, 152, 0, 0.3));
      border-color: rgba(255, 193, 7, 0.5);
    }

    .register-btn:hover {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.5), rgba(255, 152, 0, 0.5));
      border-color: rgba(255, 193, 7, 0.8);
    }

    .guest-benefits {
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
    }

    .benefit-text {
      color: white;
      font-size: 13px;
      font-style: italic;
      opacity: 0.9;
    }

    .btn-icon {
      font-size: 1rem;
      display: inline-block;
      transform: rotate(0deg);
    }

    .header-main {
      text-align: center;
    }

    .main-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .main-title .icon {
      margin-right: 15px;
      font-size: 3.5rem;
      display: inline-block;
      transform: rotate(0deg);
    }

    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 0;
    }

    .search-section {
      background: white;
      padding: 30px 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .search-box {
      position: relative;
      max-width: 500px;
      margin: 0 auto;
    }

    .search-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%) rotate(0deg) !important;
      font-size: 1.2rem;
      color: #666;
      display: inline-block;
      font-style: normal !important;
      vertical-align: middle;
    }

    .search-input {
      width: 100%;
      padding: 15px 15px 15px 50px;
      border: 2px solid #e1e5e9;
      border-radius: 50px;
      font-size: 16px;
      outline: none;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .search-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .filter-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 10px 25px;
      border: 2px solid #e1e5e9;
      background: white;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .filter-btn:hover, .filter-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .loading-container, .error-container {
      text-align: center;
      padding: 60px 20px;
      color: white;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-content {
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 15px;
      max-width: 400px;
      margin: 0 auto;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 20px;
    }

    .retry-btn {
      padding: 12px 30px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 20px;
      transition: all 0.3s ease;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .tours-section {
      background: #f8f9fa;
      min-height: 600px;
      padding: 40px 20px;
    }

    .tours-header {
      max-width: 1200px;
      margin: 0 auto 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .tours-header h2 {
      color: #333;
      margin: 0;
    }

    .tours-count {
      color: #667eea;
      font-weight: 700;
    }

    .view-toggle {
      display: flex;
      gap: 5px;
    }

    .view-btn {
      width: 40px;
      height: 40px;
      border: 2px solid #e1e5e9;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 18px;
    }

    .view-btn:hover, .view-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .no-results {
      text-align: center;
      padding: 80px 20px;
    }

    .no-results-content {
      max-width: 400px;
      margin: 0 auto;
    }

    .no-results-icon {
      font-size: 4rem;
      opacity: 0.5;
      margin-bottom: 20px;
    }

    .tours-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 30px;
    }

    .tour-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .tour-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .tour-image {
      position: relative;
      height: 220px;
      overflow: hidden;
    }

    .tour-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .tour-card:hover .tour-image img {
      transform: scale(1.05);
    }

    .tour-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(102, 126, 234, 0.9);
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .tour-content {
      padding: 25px;
    }

    .tour-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .tour-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #333;
      margin: 0;
      line-height: 1.3;
      flex: 1;
      margin-right: 10px;
    }

    .tour-rating {
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    .stars {
      color: #ffc107;
      font-size: 14px;
    }

    .rating-text {
      color: #666;
      font-size: 14px;
    }

    .tour-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 15px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .detail-icon {
      font-size: 16px;
      width: 20px;
      display: inline-block;
      transform: rotate(0deg);
    }

    .tour-description {
      margin-bottom: 20px;
    }

    .tour-description p {
      color: #666;
      line-height: 1.5;
      margin: 0;
      font-size: 14px;
    }

    .tour-footer {
      border-top: 1px solid #f0f0f0;
      padding-top: 20px;
    }

    .price-section {
      display: flex;
      align-items: baseline;
      gap: 5px;
      margin-bottom: 15px;
    }

    .price-label {
      color: #666;
      font-size: 14px;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e74c3c;
    }

    .price-unit {
      color: #666;
      font-size: 14px;
    }

    .tour-actions {
      display: flex;
      gap: 10px;
    }

    .btn-primary, .btn-secondary, .btn-outline {
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      flex: 1;
      text-align: center;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #667eea;
      border: 2px solid #e1e5e9;
    }

    .btn-secondary:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .tours-list {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .tour-list-item {
      background: white;
      border-radius: 15px;
      padding: 20px;
      display: flex;
      gap: 20px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .tour-list-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }

    .tour-list-image {
      width: 200px;
      height: 150px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .tour-list-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .tour-list-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .tour-list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .tour-list-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #333;
      margin: 0;
      flex: 1;
    }

    .tour-list-price {
      display: flex;
      align-items: baseline;
      gap: 5px;
      white-space: nowrap;
    }

    .tour-list-details {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .tour-list-description {
      flex: 1;
      margin-bottom: 15px;
    }

    .tour-list-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-top {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .logo-section {
        justify-content: center;
      }

      .user-profile {
        flex-direction: column;
        gap: 15px;
      }

      .user-profile-simple {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
      }

      .user-actions {
        width: 100%;
        justify-content: center;
      }

      .action-btn,
      .logout-btn-simple {
        flex: 1;
        justify-content: center;
        min-width: 80px;
      }

      .guest-actions {
        flex-direction: column;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }

      .auth-btn {
        width: 100%;
        justify-content: center;
      }

      .dropdown-menu {
        left: 0;
        right: 0;
        margin: 0 20px;
      }

      .main-title {
        font-size: 2rem;
      }

      .search-container {
        flex-direction: column;
        gap: 12px;
      }

      .search-box {
        width: 100%;
      }

      .filter-controls {
        width: 100%;
        flex-direction: column;
        gap: 10px;
      }

      .filter-btn,
      .view-toggle-btn {
        width: 100%;
        justify-content: center;
      }

      .tours-header {
        flex-direction: column;
        text-align: center;
        gap: 15px;
      }

      .view-toggle {
        justify-content: center;
        width: 100%;
      }

      .tours-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 0 10px;
      }

      .tour-card {
        margin: 0;
      }

      .tour-image {
        height: 220px;
      }

      .tour-header {
        flex-direction: column;
        gap: 8px;
      }

      .tour-price {
        text-align: left;
      }

      .tour-actions {
        flex-direction: column;
        gap: 10px;
      }

      .view-btn,
      .book-btn {
        width: 100%;
        justify-content: center;
      }

      .tour-list-item {
        flex-direction: column;
      }

      .tour-list-image {
        width: 100%;
        height: 200px;
      }

      .tour-list-header {
        flex-direction: column;
        gap: 10px;
      }

      .tour-list-actions {
        width: 100%;
        flex-direction: column;
      }

      .tour-list-actions .view-btn,
      .tour-list-actions .book-btn {
        width: 100%;
      }

      /* Hide desktop-only elements */
      .desktop-only {
        display: none !important;
      }

      /* Adjust padding and margins */
      .header-section {
        padding: 15px 10px 40px 10px;
      }

      .search-section {
        padding: 15px 10px;
      }

      .tours-section {
        padding: 15px 10px;
      }
    }

    @media (max-width: 480px) {
      .header-section {
        padding: 15px 15px 40px 15px;
      }

      .logo-icon {
        font-size: 1.5rem;
      }

      .brand-name {
        font-size: 1.2rem;
      }

      .main-title {
        font-size: 1.75rem;
      }

      .subtitle {
        font-size: 0.9rem;
      }

      .user-info {
        padding: 8px 12px;
      }

      .user-name {
        font-size: 0.85rem;
      }

      .user-status {
        font-size: 0.7rem;
      }

      .action-btn,
      .logout-btn-simple {
        font-size: 12px;
        padding: 6px 10px;
      }

      .auth-btn {
        padding: 8px 16px;
        font-size: 13px;
      }

      .search-section {
        padding: 20px 15px;
      }

      .tours-section {
        padding: 20px 15px;
      }

      .tour-card {
        margin: 0 10px;
      }

      .tour-image {
        height: 200px;
      }

      .tour-title {
        font-size: 1.1rem;
      }

      .tour-description {
        font-size: 0.85rem;
      }

      .detail-item {
        font-size: 0.85rem;
      }

      .price-value {
        font-size: 1.3rem;
      }

      .btn-icon {
        font-size: 1rem;
      }
    }

    /* Extra small devices (< 375px) */
    @media (max-width: 374px) {
      .header-section {
        padding: 10px 8px 30px 8px;
      }

      .logo-icon {
        font-size: 1.3rem;
      }

      .brand-name {
        font-size: 1rem;
      }

      .main-title {
        font-size: 1.5rem;
      }

      .user-actions {
        flex-direction: column;
        gap: 6px;
      }

      .action-btn,
      .logout-btn-simple {
        width: 100%;
      }

      .tours-grid {
        gap: 15px;
      }

      .tour-card {
        margin: 0 5px;
      }
    }

    /* Landscape mode adjustments */
    @media (max-height: 500px) and (orientation: landscape) {
      .header-section {
        padding: 10px 15px 20px 15px;
      }

      .header-main {
        display: none;
      }

      .main-title {
        font-size: 1.5rem;
      }

      .tour-image {
        height: 150px;
      }
    }

    /* Touch device optimizations */
    @media (hover: none) and (pointer: coarse) {
      .action-btn,
      .logout-btn-simple,
      .auth-btn,
      .view-btn,
      .book-btn,
      .menu-btn {
        min-height: 44px;
        min-width: 44px;
      }

      .search-box input {
        font-size: 16px; /* Prevent iOS zoom */
      }

      /* Improve touch targets */
      .menu-item {
        min-height: 48px;
        padding: 14px 18px;
      }

      .filter-btn {
        min-height: 44px;
        padding: 12px 18px;
      }
    }
  `]
})
export class TourListComponent implements OnInit {
  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  error: string | null = null;
  loading = true;
  searchTerm = '';
  selectedFilter = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  
  // User profile related properties
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(
    private tourSvc: TourService, 
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadTours();
    
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Close user menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        this.showUserMenu = false;
      }
    });
  }

  loadTours(): void {
    this.loading = true;
    this.error = null;
    
    this.tourSvc.getAll().subscribe({
      next: (tours) => {
        this.tours = tours;
        this.filteredTours = tours;
        this.loading = false;
      },
      error: () => {
        this.error = this.translate.instant('TOUR.ERROR_MESSAGE');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.tours];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(tour => {
        const tourName = (tour.tourName || '').toLowerCase();
        const destination = (tour.touristDestination || '').toLowerCase();
        return tourName.includes(searchLower) || destination.includes(searchLower);
      });
    }

    // Apply category filter
    switch (this.selectedFilter) {
      case 'popular':
        // Sort by total bookings (descending), with tours having bookings first
        filtered = filtered.sort((a, b) => {
          const bookingsA = a.totalBookings || 0;
          const bookingsB = b.totalBookings || 0;
          return bookingsB - bookingsA;
        });
        break;
      case 'new':
        filtered = filtered.slice(-6); // Mock new filter
        break;
    }

    this.filteredTours = filtered;
  }

  trackByTourId(index: number, tour: Tour): number {
    return tour.tourID || 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
  }

  getDefaultImage(tour: Tour): string {
    const defaultImages = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    
    const tourId = this.getTourId(tour);
    return defaultImages[tourId % defaultImages.length];
  }

  getBadgeText(tour: Tour): string {
    const badgeKeys = [
      'TOUR.BADGE_POPULAR',
      'TOUR.BADGE_NEW', 
      'TOUR.BADGE_PROMOTION',
      'TOUR.BADGE_PREMIUM',
      'TOUR.BADGE_BEST_PRICE'
    ];
    const tourId = this.getTourId(tour);
    const key = badgeKeys[tourId % badgeKeys.length];
    return this.translate.instant(key);
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }

  viewTourDetails(tour: Tour): void {
    // TODO: Navigate to tour detail page
    const tourName = this.getTourName(tour);
    const destination = this.getTourDestination(tour);
    const price = this.getTourPrice(tour);
    const priceText = price > 0 ? `\n\nGiá: ${this.formatPrice(price)}₫` : '';
    alert(`Chi tiết tour: ${tourName}${priceText}\nĐiểm đến: ${destination}`);
  }

  bookTour(tour: Tour): void {
    // Navigate to booking page
    const tourId = this.getTourId(tour);
    this.router.navigate(['/tours', tourId, 'book']);
  }

  // User profile methods
  getUserStatus(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.status) {
      case 'ACTIVE': return 'Thành viên đã xác thực';
      case 'PENDING_VERIFICATION': return 'Chờ xác thực';
      case 'SUSPENDED': return 'Tài khoản bị tạm khóa';
      default: return 'Thành viên';
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    // Call logout service
    this.authService.logout();
    
    // Clear local user state
    this.showUserMenu = false;
    this.currentUser = null;
    
    // Show success toast notification
    this.toastService.success('Đã đăng xuất thành công!');
    
    // Navigate to login page after short delay
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 800);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Enhanced profile methods for new UI
  viewProfile(): void {
    // TODO: Implement profile navigation
    alert('Tính năng xem hồ sơ đang được phát triển!');
  }

  viewBookings(): void {
    this.router.navigate(['/my-bookings']);
  }

  getUserStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'active';
      case 'pending_verification':
      case 'pending':
        return 'pending';
      case 'suspended':
        return 'suspended';
      default:
        return 'active';
    }
  }

  getUserStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Tài khoản hoạt động';
      case 'pending_verification':
      case 'pending':
        return 'Chờ xác thực';
      case 'suspended':
        return 'Tài khoản bị khóa';
      default:
        return 'Tài khoản hoạt động';
    }
  }

  // Helper methods
  getTourName(tour: Tour): string {
    return tour.tourName || 'N/A';
  }

  getTourDestination(tour: Tour): string {
    return tour.touristDestination || 'N/A';
  }

  getTourDescription(tour: Tour): string {
    return tour.description || 'Không có mô tả';
  }

  getTourPrice(tour: Tour): number {
    return tour.originalPrice || 0;
  }

  getTourId(tour: Tour): number {
    return tour.tourID || 0;
  }
}