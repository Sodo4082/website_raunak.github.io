(function () {
  "use strict";

  var root = document.querySelector(".vt320-home");
  if (!root) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealItems = Array.prototype.slice.call(root.querySelectorAll(".rv"));
  var navLinks = Array.prototype.slice.call(root.querySelectorAll(".vt320-nav ul a[href^='#']"));
  var sections = navLinks.map(function (link) {
    return root.querySelector(link.getAttribute("href"));
  }).filter(Boolean);
  var progress = root.querySelector("#vt320-progress");
  var hero = root.querySelector(".hero");
  var ticking = false;

  function makeBinary() {
    var sequence = "";
    for (var index = 0; index < 60; index += 1) {
      var bits = (65 + Math.floor(Math.random() * 58)).toString(2).padStart(7, "0");
      sequence += bits.split("").join(" ") + "    ";
    }
    return sequence + sequence;
  }

  root.querySelectorAll("[data-binary]").forEach(function (line) {
    line.textContent = makeBinary();
  });

  var terminal = root.querySelector("#vt320-terminal");
  var terminalGeneration = 0;
  var terminalLines = terminal ? [
    { kind: "command", text: "whoami" },
    { kind: "output", text: terminal.dataset.name + " · " + terminal.dataset.bio },
    { kind: "command", text: "pwd" },
    { kind: "output", text: "/" + terminal.dataset.location.toLowerCase().replace(/\s*\/\s*/g, "/") },
    { kind: "command", text: "ls topics/" },
    { kind: "output", text: "machine-learning/  optimization/  bayesian-statistics/" },
    { kind: "command", text: "ls sections/" },
    { kind: "output", text: "about/  index/  blog/  contact/" }
  ] : [];

  function clearTerminal() {
    terminalGeneration += 1;
    if (terminal) terminal.textContent = "";
  }

  function renderTerminalLine(lineIndex, generation, animate) {
    if (!terminal || generation !== terminalGeneration || lineIndex >= terminalLines.length) return;
    var line = terminalLines[lineIndex];
    var row = document.createElement("div");
    terminal.appendChild(row);

    if (line.kind === "output") {
      row.className = "terminal-output";
      row.textContent = line.text;
      if (lineIndex === terminalLines.length - 1) {
        var outputCursor = document.createElement("span");
        outputCursor.className = "terminal-cursor";
        outputCursor.setAttribute("aria-hidden", "true");
        row.appendChild(outputCursor);
      }
      if (animate) window.setTimeout(function () {
        renderTerminalLine(lineIndex + 1, generation, true);
      }, 250);
      return;
    }

    var prompt = document.createElement("span");
    prompt.className = "terminal-prompt";
    prompt.textContent = terminal.dataset.prompt + "@home:~$ ";
    var command = document.createElement("span");
    row.appendChild(prompt);
    row.appendChild(command);

    if (!animate) {
      command.textContent = line.text;
      return;
    }

    var cursor = document.createElement("span");
    cursor.className = "terminal-cursor";
    cursor.setAttribute("aria-hidden", "true");
    row.appendChild(cursor);
    var character = 0;
    function typeCharacter() {
      if (generation !== terminalGeneration) return;
      command.textContent = line.text.slice(0, character);
      character += 1;
      if (character <= line.text.length) {
        window.setTimeout(typeCharacter, 70);
      } else {
        cursor.remove();
        window.setTimeout(function () {
          renderTerminalLine(lineIndex + 1, generation, true);
        }, 300);
      }
    }
    typeCharacter();
  }

  function startTerminal() {
    if (!terminal) return;
    clearTerminal();
    var generation = terminalGeneration;
    if (reducedMotion) {
      terminalLines.forEach(function (_, lineIndex) {
        renderTerminalLine(lineIndex, generation, false);
      });
    } else {
      window.setTimeout(function () {
        renderTerminalLine(0, generation, true);
      }, 400);
    }
  }

  if (terminal && "IntersectionObserver" in window) {
    var terminalObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startTerminal();
        else clearTerminal();
      });
    }, { threshold: 0.3 });
    terminalObserver.observe(terminal);
  } else if (terminal) {
    startTerminal();
  }

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) { item.classList.add("in"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        var item = entry.target;
        window.clearTimeout(item._vt320Timer);
        if (entry.isIntersecting) {
          item.style.transitionDelay = (index * 0.14) + "s";
          item.classList.add("in");
          item._vt320Timer = window.setTimeout(function () {
            item.style.transitionDelay = "";
          }, 1800);
        } else {
          item.style.transitionDelay = "";
          item.classList.remove("in");
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(function (item) { observer.observe(item); });
  }

  root.classList.add("vt320-ready");

  function updateScrollState() {
    var documentElement = document.documentElement;
    var maxScroll = documentElement.scrollHeight - window.innerHeight;
    var scrollPosition = window.scrollY || documentElement.scrollTop;
    if (progress) {
      progress.style.transform = "scaleX(" + (maxScroll > 0 ? scrollPosition / maxScroll : 0) + ")";
    }

    if (hero && !reducedMotion) {
      var fade = Math.min(1, scrollPosition / (window.innerHeight * 0.6));
      hero.style.opacity = 1 - fade;
      hero.style.transform = "translateY(" + (scrollPosition * 0.2) + "px)";
    }

    var activeIndex = -1;
    sections.forEach(function (section, index) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.4) {
        activeIndex = index;
      }
    });
    navLinks.forEach(function (link, index) {
      link.classList.toggle("on", index === activeIndex);
    });
    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  root.addEventListener("click", function (event) {
    var link = event.target.closest("a[href^='#']");
    if (!link) return;
    var destination = root.querySelector(link.getAttribute("href"));
    if (!destination) return;
    event.preventDefault();
    destination.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  });

  updateScrollState();
})();