class HeroFeaturesCarousel extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.initSlider();
        this.attachListeners();
        if (document.readyState === 'complete') this.initScrollAnimation();
        else window.addEventListener("load", this.initScrollAnimation.bind(this));
    }

    attachListeners() {
        const slides = this.querySelectorAll('.swiper-slide');

        slides.forEach(slide => {
        const controls = slide.querySelectorAll('[data-control]');
        controls.forEach(control => {
            control.addEventListener('click', () => {
                controls.forEach(controlEl => controlEl.classList.remove('is-active'));
                this.slider.slideTo(Number(control.dataset.control));
            });
        });
        })
    }

    initSlider() {
        this.sliderContainer = this.querySelector('.swiper');
        if (!this.sliderContainer) return;

        this.options = {
            slidesPerView: 1,
            effect: "fade",
            pagination: {
                el: this.querySelector('.swiper-pagination'),
                clickable: true,
            },
            navigation: {
                nextEl: this.querySelector('.swiper-button-next'),
                prevEl: this.querySelector('.swiper-button-prev'),
            },
            autoHeight: true,
            breakpoints: {
                1024: {
                    allowTouchMove: false,
                }
            }
        };
        this.slider = new Swiper(this.sliderContainer, this.options);
        this.slider.on('slideChange', () => {
            const controls = this.querySelectorAll('[data-control]');
            const slides = this.querySelectorAll('.swiper-slide');

            controls.forEach(control => {
                control.classList.remove('is-active');
            })
            slides[this.slider.activeIndex].querySelector(`[data-control="${this.slider.activeIndex}"]`).classList.add('is-active');
        });
    }

    //Scrolling Animation
    initScrollAnimation() {
        this.scrollOffset = window.getComputedStyle(this.sliderContainer).getPropertyValue("top");
        this.slideScrollAmount = 100 / this.dataset.slideCount;
        this.setupScrollAnimation();
        this.initScrollTrigger();
    }

    initScrollTrigger() {
        const stOptions = {
            trigger: this,
            start: `top ${this.scrollOffset}px`,
            end: 'bottom bottom',
            //markers: {startColor:"teal",endColor:"orange"},
            onToggle: (self) => {console.log("toggle");
                document.body.classList.toggle("sticky-carousel-active", self.isActive);
                this.classList.toggle("scrolling-active", self.isActive);
            },
            onUpdate: (self) => this.updateSlider(self.progress.toFixed(2) * 100),
            //onRefresh: ({progress, direction, isActive}) => console.log("OnRefresh - is hero features active?", isActive),
        };

        gsap.registerPlugin(ScrollTrigger);
        this.st = ScrollTrigger.create(stOptions);
        window.addEventListener("resize", this.triggerSTRefresh.bind(this));
    }

    triggerSTRefresh() {
        // Has issues with window resizing, trigger points were way off.
        // This will trigger a ScrollTrigger refresh after a short delay to fix the issue.
        if (!this.st) return;
        setTimeout(this.st.refresh, 500);
    }

    updateSlider(progress) {
        //console.log(`progress:${progress}%`);
        const slideIndex = progress / this.slideScrollAmount;
        //console.log(`slide:${Math.floor(slideIndex)}`);
        this.slider.slideTo(slideIndex);
    }

    setupScrollAnimation() {
        document.body.classList.add("scroll-carousel-animations");
    }
}

customElements.define('hero-features-carousel', HeroFeaturesCarousel);