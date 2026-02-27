(function () {
  "use strict";

  var gsap = window.gsap;
  var hasGsap = gsap && typeof gsap.to === "function";
  var hasElastic = hasGsap && window.Elastic && Elastic.easeOut;
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function getVar(key, elem) {
    return getComputedStyle(elem || document.documentElement).getPropertyValue(
      key,
    );
  }

  function initCheckboxAnimation() {
    var radios = document.querySelectorAll(".radio");
    if (!radios.length) {
      return;
    }

    if (prefersReducedMotion) {
      return;
    }

    radios.forEach(function (elem) {
      var svg = elem.querySelector("svg");
      var input = elem.querySelector("input");
      if (!input || !svg) {
        return;
      }

      input.addEventListener("change", function () {
        if (!input.checked) {
          return;
        }

        if (!hasGsap) {
          input.classList.add("is-checked");
          setTimeout(function () {
            input.classList.remove("is-checked");
          }, 300);
          return;
        }

        gsap.fromTo(
          input,
          {
            "--border-width": "3px",
          },
          {
            "--border-color": getVar("--c-active"),
            "--border-width": "15px",
            duration: 0.2,
          },
        );

        gsap.to(svg, {
          keyframes: [
            {
              "--top-y": "6px",
              "--top-s-x": 1,
              "--top-s-y": 1.25,
              duration: 0.2,
              delay: 0.2,
            },
            {
              "--top-y": "0px",
              "--top-s-x": 1.75,
              "--top-s-y": 1,
              duration: 0.6,
            },
          ],
        });

        gsap.to(svg, {
          keyframes: [
            {
              "--dot-y": "2px",
              duration: 0.3,
              delay: 0.2,
            },
            {
              "--dot-y": "0px",
              duration: 0.3,
            },
          ],
        });

        gsap.to(svg, {
          "--drop-y": "0px",
          duration: 0.6,
          delay: 0.4,
          clearProps: true,
          onComplete: function () {
            input.removeAttribute("style");
          },
        });
      });
    });
  }

  function getPoint(point, i, points, smoothing) {
    var cp = function (current, previous, next, reverse) {
      var p = previous || current;
      var n = next || current;
      var o = {
        length: Math.sqrt(Math.pow(n[0] - p[0], 2) + Math.pow(n[1] - p[1], 2)),
        angle: Math.atan2(n[1] - p[1], n[0] - p[0]),
      };
      var angle = o.angle + (reverse ? Math.PI : 0);
      var length = o.length * smoothing;
      return [
        current[0] + Math.cos(angle) * length,
        current[1] + Math.sin(angle) * length,
      ];
    };

    var cps = cp(points[i - 1], points[i - 2], point, false);
    var cpe = cp(point, points[i - 1], points[i + 1], true);

    return (
      "C " +
      cps[0] +
      "," +
      cps[1] +
      " " +
      cpe[0] +
      "," +
      cpe[1] +
      " " +
      point[0] +
      "," +
      point[1]
    );
  }

  function getPath(update, smoothing, pointsNew) {
    var points = pointsNew || [
      [4, 12],
      [12, update],
      [20, 12],
    ];

    var d = points.reduce(function (acc, point, i, pointsArr) {
      return i === 0
        ? "M " + point[0] + "," + point[1]
        : acc + " " + getPoint(point, i, pointsArr, smoothing);
    }, "");

    return '<path d="' + d + '" />';
  }

  function initDownloadButton() {
    var buttons = document.querySelectorAll(".custom__download__btn");
    if (!buttons.length) {
      return;
    }

    if (prefersReducedMotion) {
      return;
    }

    buttons.forEach(function (button) {
      var duration = 3000;
      var svg = button.querySelector("svg");
      if (!svg) {
        return;
      }

      var svgPath = new Proxy(
        {
          y: null,
          smoothing: null,
        },
        {
          set: function (target, key, value) {
            target[key] = value;
            if (target.y !== null && target.smoothing !== null) {
              svg.innerHTML = getPath(target.y, target.smoothing, null);
            }
            return true;
          },
          get: function (target, key) {
            return target[key];
          },
        },
      );

      button.style.setProperty("--duration", duration);
      svgPath.y = 20;
      svgPath.smoothing = 0;

      button.addEventListener("click", function (event) {
        if (button.classList.contains("loading")) {
          return;
        }

        event.preventDefault();
        button.classList.add("no__click");
        button.classList.add("loading");

        if (!hasGsap) {
          setTimeout(function () {
            button.classList.remove("no__click");
            button.classList.remove("loading");
          }, duration);
          return;
        }

        gsap.to(svgPath, {
          smoothing: 0.3,
          duration: (duration * 0.065) / 1000,
        });

        gsap.to(svgPath, {
          y: 12,
          duration: (duration * 0.265) / 1000,
          delay: (duration * 0.065) / 1000,
          ease: hasElastic ? Elastic.easeOut.config(1.12, 0.4) : "power2.out",
        });

        setTimeout(function () {
          svg.innerHTML = getPath(0, 0, [
            [3, 14],
            [8, 19],
            [21, 6],
          ]);
        }, duration / 2);

        setTimeout(function () {
          button.classList.remove("no__click");
        }, duration);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCheckboxAnimation();
    initDownloadButton();
  });
})();
