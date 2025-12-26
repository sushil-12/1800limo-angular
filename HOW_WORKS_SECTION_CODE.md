# How 1-800-LIMO.COM Works Section - Full Code

## Overview
This section displays a 4-step process flow with auto-rotating animation that cycles through each step every 3 seconds. It includes responsive design for both desktop and mobile devices.

---

## 1. HTML Template (home.component.html)

```html
<!-- HOW WORKS -->
<section class="how_works_wrapper">
	<div class="container-fluid">
		<h2>How <span>1-800-LIMO.COM</span> Works</h2>
		<div class="row steps-container">

            <!-- Desktop Progress Line -->
            <div class="steps-line-bg d-none d-md-block"></div> 
            <div class="steps-line-progress d-none d-md-block" [style.width.%]="progressWidth"></div>

            <!-- Mobile Progress Line (Vertical) -->
            <div class="steps-line-mobile d-md-none"></div>
            <div class="steps-line-progress-mobile d-md-none" [style.height.%]="progressWidth"></div>

            <div class="col-12 col-md-3 step-item" [class.active]="currentActiveStep === 1" data-step="1">
                <img src="../../../../assets/images/how-1800-works/step1.png" alt="Step 1" class="step-img">

                <div class="step-icon-box">
                    <i class="fa-solid fa-globe" style="font-size: 12px;"></i>
                </div>

                <div class="step-label">STEP 1</div>
                <div class="step-sub-desc">Enter Pickup and Dropoff Location</div>
            </div>

            <div class="col-12 col-md-3 step-item" [class.active]="currentActiveStep === 2" data-step="2">
                <img src="../../../../assets/images/how-1800-works/step2.png" alt="Step 2" class="step-img">

                <div class="step-icon-box">
                    <i class="fa-solid fa-car" style="font-size: 18px;"></i>
                </div>

                <div class="step-label">STEP 2</div>
                <div class="step-sub-desc">Select The Vehicle That Meets Your Requirements</div>
            </div>

            <div class="col-12 col-md-3 step-item" [class.active]="currentActiveStep === 3" data-step="3">
                <img src="../../../../assets/images/how-1800-works/step3.png" alt="Step 3" class="step-img">

                <div class="step-icon-box">
                    <i class="fa-solid fa-dollar-sign" style="font-size: 18px;"></i>
                </div>

                <div class="step-label">STEP 3</div>
                <div class="step-sub-desc">Check Price According to Vehicle</div>
            </div>

            <div class="col-12 col-md-3 step-item" [class.active]="currentActiveStep === 4" data-step="4">
                <img src="../../../../assets/images/how-1800-works/step4.png" alt="Step 4" class="step-img">

                <div class="step-icon-box">
                    <i class="fa-regular fa-circle-check" style="font-size: 18px;"></i>
                </div>

                <div class="step-label">STEP 4</div>
                <div class="step-sub-desc">Preview Details & Confirm Booking</div>
            </div>

        </div>
	</div>
</section>
```

---

## 2. CSS Styles (style.css)

### Desktop Styles

```css
/* Main Wrapper */
.how_works_wrapper {
	background-color: transparent !important;
	padding: 30px !important;
	margin: 25px 50px;
	border-radius: 20px;
}

.how_works_wrapper h2 {
	font-weight: 600;
	font-size: 34px;
	line-height: 130%;
	text-transform: capitalize;
	color: #000;
	text-align: center;
	margin-bottom: 20px;
}

.how_works_wrapper h2 span {
	font-weight: 600;
	font-size: 34px;
	line-height: 130%;
	text-transform: capitalize;
	color: var(--orange-color);
}

/* Timeline Line styling */
.steps-container {
	position: relative;
	margin: 0 -15px; /* Compensate for step-item padding */
}

@media (min-width: 768px) {
	.steps-container .step-item {
		padding: 0 20px; /* More spacing on desktop between steps */
	}
}

/* The horizontal gray line background */
.steps-line-bg {
	position: absolute;
	top: 50%; /* Align with the icon center */
	left: 0;
	width: 100%;
	height: 4px;
	background-color: var(--light-gray);
	z-index: 0;
	transform: translateY(-50%);
}

.steps-line-bg.d-none.d-md-block {
	top: 68%;
	background: var(--orange-color);
}

/* The colored orange line (Progress) */
.steps-line-progress {
	position: absolute;
	top: 50%;
	left: 0;
	width: 25%; /* Dynamically updated via Angular binding */
	height: 4px;
	background: linear-gradient(90deg, var(--primary-orange) 0%, rgba(243, 147, 61, 0.8) 50%, var(--primary-orange) 100%);
	background-size: 200% 100%;
	z-index: 1;
	transform: translateY(-50%);
	transition: width 0.5s ease;
	border-radius: 2px;
	box-shadow: 0 2px 8px rgba(243, 147, 61, 0.4);
	animation: progressFlow 3s ease infinite;
}

/* Individual Step Styling */
.step-item {
	position: relative;
	z-index: 2; /* Keep above the line */
	text-align: center;
	padding: 0 15px; /* Add horizontal spacing between steps */
}

/* Screenshot Images */
.step-img {
	width: 100%;
	max-width: 280px;
	border-radius: 8px;
	box-shadow: 0 4px 6px rgba(0,0,0,0.1);
	margin: 0 auto 25px auto;
	opacity: 0.6; /* Dim inactive images */
	transition: all 0.5s ease;
	border: 1px solid #eee;
	height: 185px;
	object-fit: cover;
	display: block;
}

@media (min-width: 992px) {
	.step-img {
		max-width: 300px;
		margin: 0 auto 30px auto;
	}
}

.step-item.active .step-img {
	opacity: 1;
	transform: scale(1.05);
	box-shadow: 0 8px 20px rgba(243, 147, 61, 0.3);
	border: 2px solid var(--orange-color);
}

/* Icon Circles */
.step-icon-box {
	width: 40px;
	height: 40px;
	background-color: #fff;
	border: 2px solid var(--light-gray);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 20px auto;
	color: var(--text-gray);
	font-size: 1.2rem;
	transition: all 0.5s ease;
}

/* Active Step Icon Styling */
.step-item.active .step-icon-box {
	background-color: var(--orange-color);
	border-color: var(--orange-color);
	color: #fff;
	box-shadow: 0 0 0 8px rgba(246, 139, 31, 0.2);
	animation: stepPulse 2s ease-in-out infinite;
}

/* Text Styling */
.step-label {
	font-weight: 700;
	text-transform: uppercase;
	font-size: 0.9rem;
	margin-bottom: 5px;
	color: #333;
}

.step-sub-desc {
	font-size: 1rem;
	color: black;
	line-height: 1.4;
	font-weight: 500;
}

/* Active Background Card Effect */
.step-item.active::after {
	content: '';
	position: absolute;
	top: 20%;
	bottom: -20px;
	left: 10px;
	right: 10px;
	background: linear-gradient(135deg, rgba(243, 147, 61, 0.05) 0%, rgba(243, 147, 61, 0.02) 100%);
	z-index: -1;
	border-radius: 12px;
}

/* Animation Keyframes */
@keyframes stepPulse {
	0%, 100% {
		transform: scale(1);
		box-shadow: 0 0 0 8px rgba(246, 139, 31, 0.2);
	}
	50% {
		transform: scale(1.05);
		box-shadow: 0 0 0 12px rgba(246, 139, 31, 0.15);
	}
}

@keyframes progressFlow {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}
```

### Mobile Styles (max-width: 767px)

```css
@media (max-width: 767px) {
	.how_works_wrapper {
		padding: 15px 10px !important;
		margin: 10px 0 !important;
		border-radius: 12px;
	}

	.how_works_wrapper h2,
	.how_works_wrapper h2 span {
		font-size: 22px;
		margin-bottom: 30px;
		line-height: 1.3;
	}

	/* Hide desktop progress lines on mobile */
	.steps-line-bg.d-none.d-md-block,
	.steps-line-progress.d-none.d-md-block {
		display: none !important;
	}

	/* Mobile Progress Line (Vertical) */
	.steps-line-mobile {
		position: absolute;
		left: 20px;
		top: 0;
		bottom: 0;
		width: 3px;
		background-color: rgba(243, 147, 61, 0.2);
		z-index: 0;
		border-radius: 2px;
	}

	.steps-line-progress-mobile {
		position: absolute;
		left: 20px;
		top: 0;
		width: 3px;
		height: 25%; /* Dynamically updated via Angular binding */
		background: linear-gradient(180deg, var(--primary-orange) 0%, rgba(243, 147, 61, 0.8) 100%);
		z-index: 1;
		transition: height 0.5s ease;
		border-radius: 2px;
		box-shadow: 0 2px 8px rgba(243, 147, 61, 0.4);
	}

	.steps-container {
		padding: 0;
		position: relative;
	}

	.step-item {
		margin-bottom: 20px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		background: #fff;
		border-radius: 10px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
		position: relative;
		z-index: 2;
	}

	.step-item:last-child {
		margin-bottom: 0;
	}

	.step-item:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.step-item.active {
		background: linear-gradient(135deg, rgba(243, 147, 61, 0.05) 0%, rgba(243, 147, 61, 0.02) 100%);
		border: 1px solid rgba(243, 147, 61, 0.2);
	}

	.step-img {
		width: 100% !important;
		max-width: 100%;
		height: auto !important;
		min-height: 140px;
		max-height: 140px;
		object-fit: cover;
		border-radius: 8px;
		margin-bottom: 10px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
		transition: all 0.3s ease;
	}

	.step-item.active .step-img {
		box-shadow: 0 4px 12px rgba(243, 147, 61, 0.2);
		border: 2px solid var(--orange-color);
		transform: scale(1.01);
	}

	.step-icon-box {
		width: 32px !important;
		height: 32px !important;
		margin-bottom: 8px !important;
		border-width: 2px !important;
		position: relative;
		z-index: 3;
		transition: all 0.3s ease;
	}

	.step-icon-box i {
		font-size: 14px !important;
	}

	.step-item.active .step-icon-box {
		box-shadow: 0 0 0 4px rgba(246, 139, 31, 0.1);
		transform: scale(1.03);
		animation: stepPulseMobile 2s ease-in-out infinite;
	}

	.step-label {
		font-size: 12px;
		font-weight: 700;
		margin-bottom: 4px;
		color: #333;
		letter-spacing: 0.3px;
		text-transform: uppercase;
		line-height: 1.2;
	}

	.step-sub-desc {
		font-size: 12px;
		line-height: 1.4;
		color: #555;
		font-weight: 500;
		padding: 0;
		max-width: 100%;
		margin: 0;
	}

	/* Mobile pulse animation (reduced intensity) */
	@keyframes stepPulseMobile {
		0%, 100% {
			transform: scale(1.05);
			box-shadow: 0 0 0 6px rgba(246, 139, 31, 0.12);
		}
		50% {
			transform: scale(1.08);
			box-shadow: 0 0 0 8px rgba(246, 139, 31, 0.1);
		}
	}
}

/* Extra small devices (phones, 480px and down) */
@media only screen and (max-width: 480px) {
	.how_works_wrapper {
		padding: 12px 8px !important;
		margin: 8px 0 !important;
	}

	.how_works_wrapper h2,
	.how_works_wrapper h2 span {
		font-size: 18px;
		margin-bottom: 20px;
		line-height: 1.2;
	}

	.step-item {
		padding: 8px;
		margin-bottom: 16px;
	}

	.step-img {
		min-height: 120px;
		max-height: 120px;
		margin-bottom: 8px;
	}

	.step-icon-box {
		width: 28px !important;
		height: 28px !important;
		margin-bottom: 6px !important;
	}

	.step-icon-box i {
		font-size: 12px !important;
	}

	.step-label {
		font-size: 11px;
		margin-bottom: 3px;
	}

	.step-sub-desc {
		font-size: 11px;
		line-height: 1.3;
	}

	.steps-line-mobile {
		left: 12px;
		width: 2px;
	}

	.steps-line-progress-mobile {
		left: 12px;
		width: 2px;
	}
}
```

---

## 3. TypeScript Logic (home.component.ts)

### Component Properties

```typescript
// Step rotation properties for "How Works" section
currentActiveStep: number = 1;
stepRotationInterval: any;
progressWidth: number = 25; // Progress line width percentage
```

### Component Implementation

```typescript
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';

export class HomeComponent implements OnInit, OnDestroy {
	// ... other properties ...
	
	// Step rotation properties for "How Works" section
	currentActiveStep: number = 1;
	stepRotationInterval: any;
	progressWidth: number = 25; // Progress line width percentage

	// ... constructor and other methods ...

	// Initialize step rotation animation for "How Works" section
	initStepRotation() {
		// Clear any existing interval
		if (this.stepRotationInterval) {
			clearInterval(this.stepRotationInterval);
		}

		// Start with step 1
		this.currentActiveStep = 1;
		this.progressWidth = 25;

		// Rotate through steps every 3 seconds
		this.stepRotationInterval = setInterval(() => {
			// Move to next step
			this.currentActiveStep = (this.currentActiveStep % 4) + 1;

			// Update progress line width based on active step
			switch (this.currentActiveStep) {
				case 1:
					this.progressWidth = 25;
					break;
				case 2:
					this.progressWidth = 50;
					break;
				case 3:
					this.progressWidth = 75;
					break;
				case 4:
					this.progressWidth = 100;
					break;
			}
		}, 3000); // 3 seconds per step
	}

	ngOnDestroy(): void {
		// Clean up step rotation interval
		if (this.stepRotationInterval) {
			clearInterval(this.stepRotationInterval);
		}
	}
}
```

### Initialization Call

Add this in your `fetchHomePageData()` method or `ngAfterViewInit()`:

```typescript
// Initialize all carousels after data is loaded
setTimeout(() => {
	this.initClientCarousel();
	this.initOtherCarousels();
	this.initStepRotation(); // Initialize step rotation animation
}, 100);
```

---

## 4. CSS Variables Used

Make sure these CSS variables are defined in your styles:

```css
:root {
	--orange-color: #f3933d; /* or your orange color */
	--primary-orange: #f3933d; /* or your primary orange */
	--light-gray: #e0e0e0; /* or your light gray */
	--text-gray: #666; /* or your text gray */
}
```

---

## 5. Features

- **Auto-rotation**: Steps cycle automatically every 3 seconds (1→2→3→4→1)
- **Progress indicator**: Animated progress line shows current step progress
- **Responsive design**: Different layouts for desktop and mobile
- **Smooth animations**: CSS transitions and keyframe animations
- **Active state highlighting**: Active step has enhanced styling
- **Mobile-optimized**: Compact layout with vertical progress line on mobile

---

## 6. Image Assets Required

The following images should be placed in `src/assets/images/how-1800-works/`:
- `step1.png` - Screenshot for Step 1
- `step2.png` - Screenshot for Step 2
- `step3.png` - Screenshot for Step 3
- `step4.png` - Screenshot for Step 4

---

## 7. Dependencies

- Angular Framework
- Font Awesome icons (for step icons)
- Bootstrap classes (for responsive grid and utilities)

---

## Notes for Enhancement

- The animation duration can be adjusted (currently 3 seconds per step)
- Progress line colors can be customized via CSS variables
- Icon sizes and spacing can be adjusted for different screen sizes
- Image dimensions can be optimized for better performance
- Additional animations or effects can be added to enhance the visual appeal

