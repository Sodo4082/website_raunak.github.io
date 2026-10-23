(function () {
  "use strict";

  var home = document.querySelector(".vt320-home");
  if (!home) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var svgNamespace = "http://www.w3.org/2000/svg";

  function createBinaryRow() {
    var row = "";
    for (var index = 0; index < 60; index += 1) {
      var bits = (65 + Math.floor(Math.random() * 58)).toString(2).padStart(7, "0");
      row += bits.split("").join(" ") + "    ";
    }
    return row + row;
  }

  document.getElementById("b1").textContent = createBinaryRow();
  document.getElementById("b2").textContent = createBinaryRow();

  var regressionCard = document.getElementById("c1");
  var regressionReadout = document.getElementById("ro");
  var regressionLine = document.getElementById("ln");
  var regressionBand = document.getElementById("bd");
  var regressionPoints = document.getElementById("gp");
  var regressionStatus = document.getElementById("st1");
  var regressionGeneration = 0;
  var regressionPointCount = 32;
  var regressionX = [];
  var regressionY = [];
  var randomSeed = 7;

  function seededRandom() {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return randomSeed / 2147483647;
  }

  for (var regressionIndex = 0; regressionIndex < regressionPointCount; regressionIndex += 1) {
    var regressionValue = (regressionIndex + seededRandom() * 0.8) / regressionPointCount;
    regressionX.push(regressionValue);
    regressionY.push(0.18 + 0.68 * regressionValue + (seededRandom() - 0.5) * 0.24);
  }

  var treeCard = document.getElementById("c2");
  var treeReadout = document.getElementById("ro2");
  var treePoints = document.getElementById("gp2");
  var treePath = document.getElementById("pt");
  var treeStatus = document.getElementById("st2");
  var treeGeneration = 0;
  var treePointCount = 44;
  var treeX = [];
  var treeY = [];
  var prefixSum = [0];
  var prefixSquareSum = [0];
  var treeDepth = 5;
  var troot;

  for (var treeIndex = 0; treeIndex < treePointCount; treeIndex += 1) {
    var treeValue = (treeIndex + seededRandom() * 0.8) / treePointCount;
    treeX.push(treeValue);
    treeY.push(0.5 + 0.34 * Math.sin(treeValue * 7.2) + (seededRandom() - 0.5) * 0.1);
  }
  for (var sumIndex = 0; sumIndex < treePointCount; sumIndex += 1) {
    prefixSum.push(prefixSum[sumIndex] + treeY[sumIndex]);
    prefixSquareSum.push(prefixSquareSum[sumIndex] + treeY[sumIndex] * treeY[sumIndex]);
  }

  function scaleX(value) { return 20 + value * 360; }
  function scaleY(value) { return 205 - value * 180; }

  function regressionLoss(slope, intercept) {
    var totalLoss = 0;
    for (var index = 0; index < regressionPointCount; index += 1) {
      var error = slope * regressionX[index] + intercept - regressionY[index];
      totalLoss += error * error;
    }
    return totalLoss / regressionPointCount;
  }

  function regressionR2(slope, intercept) {
    var mean = 0;
    var totalVariance = 0;
    var residual = 0;
    for (var index = 0; index < regressionPointCount; index += 1) mean += regressionY[index];
    mean /= regressionPointCount;
    for (var pointIndex = 0; pointIndex < regressionPointCount; pointIndex += 1) {
      totalVariance += Math.pow(regressionY[pointIndex] - mean, 2);
      residual += Math.pow(regressionY[pointIndex] - slope * regressionX[pointIndex] - intercept, 2);
    }
    return 1 - residual / totalVariance;
  }

  function gradientStep(slope, intercept) {
    var slopeGradient = 0;
    var interceptGradient = 0;
    for (var index = 0; index < regressionPointCount; index += 1) {
      var error = slope * regressionX[index] + intercept - regressionY[index];
      slopeGradient += error * regressionX[index];
      interceptGradient += error;
    }
    return [
      slope - 0.7 * slopeGradient / regressionPointCount,
      intercept - 0.7 * interceptGradient / regressionPointCount
    ];
  }

  function drawRegression(slope, intercept) {
    regressionLine.setAttribute("x1", scaleX(0));
    regressionLine.setAttribute("y1", scaleY(intercept));
    regressionLine.setAttribute("x2", scaleX(1));
    regressionLine.setAttribute("y2", scaleY(slope + intercept));
    var uncertainty = Math.sqrt(regressionLoss(slope, intercept));
    regressionBand.setAttribute("points", [
      scaleX(0) + "," + scaleY(intercept + uncertainty),
      scaleX(1) + "," + scaleY(slope + intercept + uncertainty),
      scaleX(1) + "," + scaleY(slope + intercept - uncertainty),
      scaleX(0) + "," + scaleY(intercept - uncertainty)
    ].join(" "));
    regressionBand.style.opacity = regressionLine.style.opacity || 0;
  }

  function formatRegression(epoch, slope, intercept) {
    return "epoch " + ("00" + epoch).slice(-3) + "/150  loss " + regressionLoss(slope, intercept).toFixed(4) +
      "  w=" + slope.toFixed(2) + " b=" + intercept.toFixed(2);
  }

  function finishRegression(slope, intercept) {
    var score = regressionR2(slope, intercept).toFixed(2);
    regressionReadout.innerHTML = formatRegression(150, slope, intercept) +
      "\n> converged · R² = " + score + "<span class=\"cur\"></span>";
    regressionStatus.className = "pill";
    regressionStatus.textContent = "● converged · R² " + score;
  }

  function resetRegression() {
    regressionGeneration += 1;
    regressionPoints.innerHTML = "";
    regressionLine.style.opacity = 0;
    regressionBand.setAttribute("points", "");
    regressionStatus.className = "pill";
    regressionStatus.textContent = "● idle";
    regressionReadout.textContent = "";
  }

  function startRegression() {
    resetRegression();
    var currentGeneration = regressionGeneration;
    var slope = -0.6;
    var intercept = 0.9;
    var epoch = 0;
    regressionStatus.className = "pill run";
    regressionStatus.textContent = "● fitting…";

    for (var index = 0; index < regressionPointCount; index += 1) {
      var circle = document.createElementNS(svgNamespace, "circle");
      circle.setAttribute("cx", scaleX(regressionX[index]));
      circle.setAttribute("cy", scaleY(regressionY[index]));
      circle.setAttribute("r", 3);
      if (!reducedMotion) circle.style.opacity = 0;
      regressionPoints.appendChild(circle);
    }
    var circles = regressionPoints.children;

    if (reducedMotion) {
      for (var step = 0; step < 150; step += 1) {
        var nextStep = gradientStep(slope, intercept);
        slope = nextStep[0];
        intercept = nextStep[1];
      }
      drawRegression(slope, intercept);
      regressionLine.style.opacity = 1;
      finishRegression(slope, intercept);
      return;
    }

    drawRegression(slope, intercept);
    for (var revealIndex = 0; revealIndex < circles.length; revealIndex += 1) {
      (function (circle, index) {
        window.setTimeout(function () {
          if (currentGeneration === regressionGeneration) circle.style.opacity = 1;
        }, index * 26);
      })(circles[revealIndex], revealIndex);
    }
    window.setTimeout(function () {
      if (currentGeneration !== regressionGeneration) return;
      regressionLine.style.opacity = 1;
      (function descend() {
        if (currentGeneration !== regressionGeneration) return;
        var nextStep = gradientStep(slope, intercept);
        slope = nextStep[0];
        intercept = nextStep[1];
        epoch += 1;
        drawRegression(slope, intercept);
        if (epoch < 150) {
          regressionReadout.textContent = formatRegression(epoch, slope, intercept);
          window.requestAnimationFrame(descend);
        } else finishRegression(slope, intercept);
      })();
    }, regressionPointCount * 26 + 300);
  }

  function segmentError(start, end) {
    var sum = prefixSum[end] - prefixSum[start];
    return prefixSquareSum[end] - prefixSquareSum[start] - sum * sum / (end - start);
  }

  function buildTree(low, high, depth) {
    var node = {
      low: low,
      high: high,
      mean: (prefixSum[high] - prefixSum[low]) / (high - low),
      leftX: low ? (treeX[low - 1] + treeX[low]) / 2 : 0,
      rightX: high < treePointCount ? (treeX[high - 1] + treeX[high]) / 2 : 1
    };
    if (depth < treeDepth && high - low >= 4) {
      var bestError = 1e9;
      var bestSplit = -1;
      for (var split = low + 2; split <= high - 2; split += 1) {
        var candidateError = segmentError(low, split) + segmentError(split, high);
        if (candidateError < bestError) {
          bestError = candidateError;
          bestSplit = split;
        }
      }
      if (bestSplit > 0) {
        node.left = buildTree(low, bestSplit, depth + 1);
        node.right = buildTree(bestSplit, high, depth + 1);
      }
    }
    return node;
  }

  troot = buildTree(0, treePointCount, 0);

  function getTreeSegments(depth) {
    var segments = [];
    (function visit(node, currentDepth) {
      if (currentDepth === depth || !node.left) segments.push(node);
      else {
        visit(node.left, currentDepth + 1);
        visit(node.right, currentDepth + 1);
      }
    })(troot, 0);
    return segments;
  }

  function drawTree(depth) {
    var segments = getTreeSegments(depth);
    var path = "";
    var totalLoss = 0;
    segments.forEach(function (segment, index) {
      path += (index ? "L" : "M") + scaleX(segment.leftX) + " " + scaleY(segment.mean) +
        "L" + scaleX(segment.rightX) + " " + scaleY(segment.mean);
      totalLoss += segmentError(segment.low, segment.high);
    });
    treePath.setAttribute("d", path);
    var mean = prefixSum[treePointCount] / treePointCount;
    var totalVariance = prefixSquareSum[treePointCount] - treePointCount * mean * mean;
    return { leaves: segments.length, loss: totalLoss / treePointCount, r2: 1 - totalLoss / totalVariance };
  }

  function formatTree(depth, result) {
    return "tree depth " + depth + "/" + treeDepth + "  leaves " + result.leaves + "  loss " + result.loss.toFixed(4);
  }

  function resetTree() {
    treeGeneration += 1;
    treePoints.innerHTML = "";
    treePath.setAttribute("d", "");
    treePath.style.opacity = 0;
    treeReadout.textContent = "";
    treeStatus.className = "pill";
    treeStatus.textContent = "● idle";
  }

  function startTree() {
    resetTree();
    var currentGeneration = treeGeneration;
    treeStatus.className = "pill run";
    treeStatus.textContent = "● growing…";
    for (var index = 0; index < treePointCount; index += 1) {
      var circle = document.createElementNS(svgNamespace, "circle");
      circle.setAttribute("cx", scaleX(treeX[index]));
      circle.setAttribute("cy", scaleY(treeY[index]));
      circle.setAttribute("r", 3);
      if (!reducedMotion) circle.style.opacity = 0;
      treePoints.appendChild(circle);
    }
    var circles = treePoints.children;

    function finishTree() {
      var result = drawTree(treeDepth);
      treePath.style.opacity = 1;
      var score = result.r2.toFixed(2);
      treeReadout.innerHTML = formatTree(treeDepth, result) +
        "\n> fitted · R² = " + score + "<span class=\"cur\"></span>";
      treeStatus.className = "pill";
      treeStatus.textContent = "● fitted · R² " + score;
    }

    if (reducedMotion) {
      finishTree();
      return;
    }
    for (var revealIndex = 0; revealIndex < circles.length; revealIndex += 1) {
      (function (circle, index) {
        window.setTimeout(function () {
          if (currentGeneration === treeGeneration) circle.style.opacity = 1;
        }, index * 22);
      })(circles[revealIndex], revealIndex);
    }
    window.setTimeout(function () {
      if (currentGeneration !== treeGeneration) return;
      treePath.style.opacity = 1;
      var depth = 0;
      (function growTree() {
        if (currentGeneration !== treeGeneration) return;
        var result = drawTree(depth);
        if (depth < treeDepth) {
          treeReadout.textContent = formatTree(depth, result);
          depth += 1;
          window.setTimeout(growTree, 550);
        } else finishTree();
      })();
    }, treePointCount * 22 + 300);
  }

  function observeReplay(element, onEnter, onExit) {
    if (!("IntersectionObserver" in window)) {
      onEnter();
      return;
    }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) onEnter();
        else onExit();
      });
    }, { threshold: 0.35 }).observe(element);
  }

  observeReplay(regressionCard, startRegression, resetRegression);
  observeReplay(treeCard, startTree, resetTree);

  var revealItems = Array.prototype.slice.call(home.querySelectorAll(".rv"));
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      var order = 0;
      entries.forEach(function (entry) {
        var item = entry.target;
        window.clearTimeout(item._revealTimer);
        if (entry.isIntersecting) {
          item.style.transitionDelay = (order++ * 0.1) + "s";
          item.classList.add("in");
          item._revealTimer = window.setTimeout(function () { item.style.transitionDelay = ""; }, 1500);
        } else {
          item.style.transitionDelay = "";
          item.classList.remove("in");
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("in"); });
  }

  home.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      var bounds = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - bounds.left + "px");
      card.style.setProperty("--my", event.clientY - bounds.top + "px");
    });
  });

  home.classList.add("vt320-ready");
  var sectionLinks = Array.prototype.slice.call(home.querySelectorAll(".m a"));
  var sections = sectionLinks.map(function (link) { return home.querySelector(link.getAttribute("href")); });
  var progress = document.getElementById("vt320-progress");
  var hero = document.getElementById("top");
  var scrollFramePending = false;

  function updateScrollState() {
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var scrollPosition = window.scrollY || document.documentElement.scrollTop;
    progress.style.transform = "scaleX(" + (maxScroll > 0 ? scrollPosition / maxScroll : 0) + ")";
    if (!reducedMotion) {
      var heroHeight = hero.offsetHeight;
      var fade = Math.max(0, Math.min(1, (scrollPosition - heroHeight * 0.6) / (heroHeight * 0.35)));
      hero.style.opacity = 1 - fade;
    }
    var activeIndex = -1;
    sections.forEach(function (section, index) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.4) activeIndex = index;
    });
    sectionLinks.forEach(function (link, index) { link.classList.toggle("on", index === activeIndex); });
    scrollFramePending = false;
  }

  function scheduleScrollUpdate() {
    if (!scrollFramePending) {
      window.requestAnimationFrame(updateScrollState);
      scrollFramePending = true;
    }
  }

  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
  window.addEventListener("keydown", function (event) {
    var sectionNumber = parseInt(event.key, 10);
    if (sectionNumber >= 1 && sectionNumber <= sections.length && !event.metaKey && !event.ctrlKey && !event.altKey) {
      sections[sectionNumber - 1].scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  });
  home.addEventListener("click", function (event) {
    var anchor = event.target.closest("a[href^='#']");
    if (!anchor) return;
    var target = anchor.getAttribute("href");
    if (target === "#") return;
    var destination = home.querySelector(target);
    if (!destination) return;
    event.preventDefault();
    destination.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  });
  updateScrollState();

  var themeButton = document.getElementById("th");
  var themeRoot = document.documentElement;
  var sidebar = home.querySelector(".side");
  var sidebarTrack = home.querySelector(".side-scroll-track");
  var sidebarThumb = home.querySelector(".side-scroll-thumb");

  function updateSidebarScrollbar() {
    var trackHeight = sidebarTrack.clientHeight;
    var scrollRange = sidebar.scrollHeight - sidebar.clientHeight;
    var thumbHeight = scrollRange > 0
      ? Math.max(26, trackHeight * sidebar.clientHeight / sidebar.scrollHeight)
      : trackHeight;
    var thumbRange = Math.max(0, trackHeight - thumbHeight);
    var progress = scrollRange > 0 ? sidebar.scrollTop / scrollRange : 0;
    sidebarThumb.style.height = thumbHeight + "px";
    sidebarThumb.style.transform = "translateY(" + (thumbRange * progress) + "px)";
    sidebarTrack.setAttribute("aria-valuenow", Math.round(progress * 100).toString());
    sidebarTrack.setAttribute("aria-valuetext", Math.round(progress * 100) + "% scrolled");
  }

  var sidebarDrag = null;
  function setSidebarScrollFromPointer(pointerY) {
    var trackBounds = sidebarTrack.getBoundingClientRect();
    var thumbHeight = sidebarThumb.getBoundingClientRect().height;
    var availableTrack = trackBounds.height - thumbHeight;
    var scrollRange = sidebar.scrollHeight - sidebar.clientHeight;
    if (availableTrack <= 0 || scrollRange <= 0) return;
    var position = Math.max(0, Math.min(1, (pointerY - trackBounds.top - thumbHeight / 2) / availableTrack));
    sidebar.scrollTop = position * scrollRange;
  }

  sidebarTrack.addEventListener("pointerdown", function (event) {
    if (sidebar.scrollHeight <= sidebar.clientHeight) return;
    event.preventDefault();
    if (event.target === sidebarThumb) {
      sidebarDrag = { pointerId: event.pointerId, startY: event.clientY, startScroll: sidebar.scrollTop };
      sidebarTrack.setPointerCapture(event.pointerId);
    } else {
      setSidebarScrollFromPointer(event.clientY);
    }
  });
  sidebarTrack.addEventListener("pointermove", function (event) {
    if (!sidebarDrag || sidebarDrag.pointerId !== event.pointerId) return;
    var trackTravel = sidebarTrack.clientHeight - sidebarThumb.getBoundingClientRect().height;
    if (trackTravel > 0) {
      var scrollRange = sidebar.scrollHeight - sidebar.clientHeight;
      sidebar.scrollTop = sidebarDrag.startScroll + (event.clientY - sidebarDrag.startY) * scrollRange / trackTravel;
    }
  });
  function endSidebarDrag(event) {
    if (sidebarDrag && sidebarDrag.pointerId === event.pointerId) sidebarDrag = null;
  }
  sidebarTrack.addEventListener("pointerup", endSidebarDrag);
  sidebarTrack.addEventListener("pointercancel", endSidebarDrag);
  sidebarTrack.addEventListener("keydown", function (event) {
    var step = event.key === "PageUp" || event.key === "PageDown" ? sidebar.clientHeight * 0.8 : 40;
    if (event.key === "ArrowUp" || event.key === "PageUp") sidebar.scrollTop -= step;
    else if (event.key === "ArrowDown" || event.key === "PageDown") sidebar.scrollTop += step;
    else if (event.key === "Home") sidebar.scrollTop = 0;
    else if (event.key === "End") sidebar.scrollTop = sidebar.scrollHeight;
    else return;
    event.preventDefault();
  });

  sidebar.addEventListener("scroll", updateSidebarScrollbar, { passive: true });
  window.addEventListener("resize", updateSidebarScrollbar);
  updateSidebarScrollbar();

  if (!themeRoot.dataset.theme) {
    themeRoot.dataset.theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function currentTheme() { return themeRoot.dataset.theme; }
  function updateThemeLabel() { themeButton.textContent = currentTheme() === "light" ? "[dark]" : "[light]"; }
  themeButton.addEventListener("click", function () {
    themeRoot.dataset.theme = currentTheme() === "light" ? "dark" : "light";
    updateThemeLabel();
    hideThemeTip();
  });
  updateThemeLabel();

  var themeTip = document.getElementById("tip");
  var themeTipDismissed = false;
  function hideThemeTip() {
    themeTipDismissed = true;
    themeTip.classList.remove("show");
  }
  function positionThemeTip() {
    var buttonBounds = themeButton.getBoundingClientRect();
    var tipWidth = themeTip.offsetWidth;
    var tipHeight = themeTip.offsetHeight;
    var below = buttonBounds.top < tipHeight + 24;
    var left = Math.max(8, Math.min(buttonBounds.left, window.innerWidth - tipWidth - 8));
    themeTip.style.left = left + "px";
    themeTip.style.top = (below ? buttonBounds.bottom + 12 : buttonBounds.top - tipHeight - 12) + "px";
    themeTip.classList.toggle("down", below);
    themeTip.style.setProperty("--arrow-x", Math.max(14, Math.min(tipWidth - 28, buttonBounds.left + buttonBounds.width / 2 - left - 7)) + "px");
  }
  window.addEventListener("resize", positionThemeTip);
  window.addEventListener("scroll", function () {
    if (themeTip.classList.contains("show")) positionThemeTip();
  }, { passive: true });
  window.setTimeout(function () {
    if (!themeTipDismissed && currentTheme() === "light") {
      positionThemeTip();
      themeTip.classList.add("show");
      window.setTimeout(hideThemeTip, 15000);
    }
  }, 1800);
})();