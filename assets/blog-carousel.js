document.addEventListener('DOMContentLoaded', function () {
  if (typeof Swiper === 'undefined') {
    console.warn('Swiper not found');
    return;
  }

  document.querySelectorAll('.blog__carousel').forEach((carousel) => {
    const swiperWrapper = carousel.querySelector('.swiper-wrapper');
    if (!swiperWrapper) return;

    new Swiper(carousel, {
      slidesPerView: 1.2,
      spaceBetween: 16,
      navigation: {
        nextEl: carousel.querySelector('.swiper-button-next'),
        prevEl: carousel.querySelector('.swiper-button-prev'),
      },
      breakpoints: {
        768: { slidesPerView: 2.5 },
        1024: { slidesPerView: 3.5 },
      },
    });
  });
});