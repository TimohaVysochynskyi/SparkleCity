(function ($) {
  "use strict";

  var $doc = $(document);
  var $win = $(window);
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function setBurgerState($btn, isOpen) {
    $btn.attr("data-open", isOpen ? "open" : "close");
    $btn.toggleClass("active", isOpen);
    $btn.attr("aria-pressed", isOpen ? "true" : "false");
    $btn.attr("aria-expanded", isOpen ? "true" : "false");
    $btn.attr("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  function initMobileMenu() {
    var $burger = $(".burger__btn");
    var $menu = $(".mobile-menu");
    var $overlay = $menu.find(".mobile-menu__overlay");
    var $wrapper = $menu.find(".mobile-menu__wrapper");
    var lastFocused = null;
    var focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    if (!$burger.length || !$menu.length) {
      return;
    }

    function getFocusable() {
      return $wrapper.find(focusableSelector).filter(":visible");
    }

    function trapFocus(event) {
      if (event.key !== "Tab") {
        return;
      }

      var $focusable = getFocusable();
      if (!$focusable.length) {
        return;
      }

      var first = $focusable[0];
      var last = $focusable[$focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function onKeydown(event) {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      trapFocus(event);
    }

    function openMenu() {
      lastFocused = document.activeElement;
      $("html").addClass("no-scroll");
      setBurgerState($burger, true);
      $menu.attr("aria-hidden", "false");
      $menu.fadeIn(500);
      setTimeout(function () {
        $menu.addClass("active");
        var $focusable = getFocusable();
        if ($focusable.length) {
          $focusable.first().focus();
        } else {
          $wrapper.focus();
        }
      }, 250);
      $doc.on("keydown.mobileMenu", onKeydown);
    }

    function closeMenu() {
      $menu.removeClass("active");
      setTimeout(function () {
        $menu.fadeOut(500);
      }, 250);
      setBurgerState($burger, false);
      $menu.attr("aria-hidden", "true");
      $("html").removeClass("no-scroll");
      $doc.off("keydown.mobileMenu");
      if (lastFocused) {
        lastFocused.focus();
      }
    }

    $burger.on("click", function () {
      var isOpen = $burger.attr("data-open") === "open";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    $overlay.on("click", function () {
      closeMenu();
    });

    $menu.on("click", ".menu a", function () {
      closeMenu();
    });
  }

  function initMessengerPopup() {
    var $widget = $(".fixed__phone");
    if (!$widget.length) {
      return;
    }

    var $popup = $widget.find(".fixed__popup");
    var $btn = $widget.find(".fixed__phone-btn");
    var $links = $popup.find("a");

    function setTabState(isOpen) {
      if (isOpen) {
        $popup.removeAttr("inert");
        $links.removeAttr("tabindex");
      } else {
        $popup.attr("inert", "");
        $links.attr("tabindex", "-1");
      }
    }

    function setOpen(isOpen) {
      $popup.toggleClass("active", isOpen);
      $popup.attr("aria-hidden", isOpen ? "false" : "true");
      $btn.attr("aria-expanded", isOpen ? "true" : "false");
      setTabState(isOpen);
    }

    setOpen(false);

    $btn.on("click", function (event) {
      event.stopPropagation();
      setOpen(!$popup.hasClass("active"));
    });

    $popup.on("click", function (event) {
      event.stopPropagation();
    });

    $doc.on("click", function () {
      setOpen(false);
    });

    $doc.on("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });
  }

  function initFormConsent() {
    var $form = $(".wpcf7-form");
    if (!$form.length) {
      return;
    }

    var $submit = $form.find('button[type="submit"]');
    var $check = $form.find(".req_check");

    function updateSubmitState() {
      if ($check.prop("checked")) {
        $submit.removeAttr("disabled");
      } else {
        $submit.attr("disabled", "disabled");
      }
    }

    $submit.attr("disabled", "disabled");
    updateSubmitState();
    $form.on("change", updateSubmitState);
  }

  function initParallax() {
    var $block = $(".parallax-block");
    if (!$block.length) {
      return;
    }

    if (prefersReducedMotion) {
      $block.removeAttr("style");
      return;
    }

    $doc.on("mousemove", function (e) {
      if ($win.width() >= 1025) {
        var x = e.pageX / 10;
        var y = e.pageY / 12;
        $block.css({ transform: "translate(-" + x + "px, -" + y + "px)" });
      } else {
        $block.removeAttr("style");
      }
    });
  }

  function initPreloader() {
    var $preloader = $(".default__preloader");
    if (!$preloader.length) {
      return;
    }

    var minDelay = 900;
    var fadeDuration = prefersReducedMotion ? 0 : 600;
    var startTime = Date.now();

    function hidePreloader() {
      var elapsed = Date.now() - startTime;
      var remaining = Math.max(0, minDelay - elapsed);
      setTimeout(function () {
        $preloader.fadeOut(fadeDuration);
      }, remaining);
    }

    if (document.readyState === "complete") {
      hidePreloader();
    } else {
      $win.on("load", hidePreloader);
    }
  }

  $doc.ready(function () {
    initMobileMenu();
    initMessengerPopup();
    initFormConsent();
    initParallax();
    initPreloader();
  });
})(jQuery);
