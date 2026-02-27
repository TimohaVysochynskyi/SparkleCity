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

  function initCursorTrail() {
    if (prefersReducedMotion) {
      return;
    }

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    var body = document.body;
    if (!body) {
      return;
    }

    var layer = document.createElement("div");
    layer.className = "cursor-trail";
    layer.setAttribute("aria-hidden", "true");

    var dots = [];
    var points = [];
    var trailLength = 10;
    var baseSize = 17;
    var follow = 0.48;
    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var now = Date.now();
    var lastMoveTime = now;
    var hasPointer = false;
    var isInside = false;
    var tailVisibility = 0;
    var headVisibility = 0;

    for (var i = 0; i < trailLength; i += 1) {
      var dot = document.createElement("span");
      dot.className = "cursor-trail__dot";
      layer.appendChild(dot);
      dots.push(dot);
      points.push({ x: targetX, y: targetY });
    }

    body.appendChild(layer);

    function onPointerMove(event) {
      targetX = event.clientX;
      targetY = event.clientY;
      lastMoveTime = Date.now();
      hasPointer = true;
      isInside = true;
    }

    function onPointerLeave() {
      isInside = false;
    }

    function onVisibilityChange() {
      if (document.hidden) {
        isInside = false;
      }
    }

    function animate() {
      var currentTime = Date.now();
      var idle = currentTime - lastMoveTime > 120;
      var targetTailVisibility = hasPointer && isInside && !idle ? 1 : 0;
      var targetHeadVisibility = hasPointer && isInside ? 1 : 0;

      tailVisibility += (targetTailVisibility - tailVisibility) * 0.12;
      headVisibility += (targetHeadVisibility - headVisibility) * 0.18;

      points[0].x += (targetX - points[0].x) * follow;
      points[0].y += (targetY - points[0].y) * follow;

      for (var j = 1; j < trailLength; j += 1) {
        points[j].x += (points[j - 1].x - points[j].x) * follow;
        points[j].y += (points[j - 1].y - points[j].y) * follow;
      }

      for (var k = 0; k < trailLength; k += 1) {
        var progress = 1 - k / trailLength;
        var size = baseSize * (0.38 + progress * 0.62);
        var alpha =
          k === 0
            ? (0.74 + progress * 0.22) * headVisibility
            : (0.46 + progress * 0.42) * tailVisibility;
        var x = points[k].x - size / 2;
        var y = points[k].y - size / 2;

        dots[k].style.width = size + "px";
        dots[k].style.height = size + "px";
        dots[k].style.opacity = alpha.toFixed(3);
        dots[k].style.transform =
          "translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, 0)";
      }

      window.requestAnimationFrame(animate);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    animate();
  }

  $doc.ready(function () {
    initMobileMenu();
    initMessengerPopup();
    initFormConsent();
    initParallax();
    initPreloader();
    initCursorTrail();
  });
})(jQuery);
