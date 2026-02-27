(function () {
  "use strict";

  function initCardsSlider() {
    var sections = document.querySelectorAll(".cards-slider");
    if (!sections.length || !window.Swiper) {
      return;
    }

    sections.forEach(function (section) {
      var el = section.querySelector(".swiper");
      if (!el) {
        return;
      }

      var nextEl = section.querySelector(".reviews-next");
      var prevEl = section.querySelector(".reviews-prev");

      var options = {
        loop: true,
        centeredSlides: true,
        slidesPerView: 2.5,
        spaceBetween: 20,
        speed: 900,
        touchRatio: 1,
        slideToClickedSlide: true,
        effect: "coverflow",
        coverflowEffect: {
          rotate: 0,
          stretch: 80,
          depth: 0,
          modifier: 1,
          slideShadows: false,
          scale: 0.65,
        },
        breakpoints: {
          320: {
            slidesPerView: 1.6,
            spaceBetween: 0,
            coverflowEffect: {
              stretch: 40,
            },
          },
          768: {
            slidesPerView: 1.5,
            spaceBetween: 0,
            coverflowEffect: {
              stretch: 150,
            },
          },
          992: {
            slidesPerView: 2.35,
            spaceBetween: 20,
            coverflowEffect: {
              stretch: 80,
            },
          },
          1200: {
            slidesPerView: 2.5,
            spaceBetween: 20,
          },
        },
      };

      if (nextEl && prevEl) {
        options.navigation = {
          nextEl: nextEl,
          prevEl: prevEl,
        };
      }

      new Swiper(el, options);
    });
  }

  function initInfoSlider() {
    var el = document.querySelector(".info-slider .swiper");
    if (!el || !window.Swiper) {
      return;
    }

    new Swiper(el, {
      loop: false,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      speed: 900,
      spaceBetween: 40,
      watchOverflow: true,
    });
  }

  function initArrowAnimation() {
    var arrows = document.querySelectorAll(".arrow");
    if (!arrows.length) {
      return;
    }

    arrows.forEach(function (arrow) {
      arrow.addEventListener("click", function (event) {
        event.preventDefault();
        if (!arrow.classList.contains("animate")) {
          arrow.classList.add("animate");
          setTimeout(function () {
            arrow.classList.remove("animate");
          }, 1600);
        }
      });

      arrow.addEventListener("touchstart", function (event) {
        event.preventDefault();
        if (!arrow.classList.contains("animate")) {
          arrow.classList.add("animate");
          setTimeout(function () {
            arrow.classList.remove("animate");
          }, 1600);
        }
      });
    });
  }

  function initAll() {
    initCardsSlider();
    initInfoSlider();
    initArrowAnimation();
  }

  window.addEventListener("load", function () {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(initAll, { timeout: 1000 });
    } else {
      setTimeout(initAll, 200);
    }
  });
})();
