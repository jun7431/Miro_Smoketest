(() => {
  const TRACK_ENDPOINT = "/api/track";
  const SIGNUP_ENDPOINT = "/api/signup";
  const currentPage = document.body.dataset.page || "";
  const trackingState = createTrackingState();

  normalizeLocalDirectoryLinks();
  initPlaceholderPaymentCtas();
  highlightCurrentPage();
  initFaqItems();
  initDemoModule();
  initTrackedCtas();
  initSignupForms();
  trackPageVisit();

  function normalizeLocalDirectoryLinks() {
    if (window.location.protocol !== "file:") {
      return;
    }

    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";

      if (
        !href.endsWith("/") ||
        href.startsWith("/") ||
        /^[a-z][a-z0-9+.-]*:/i.test(href)
      ) {
        return;
      }

      link.setAttribute("href", `${href}index.html`);
    });
  }

  function highlightCurrentPage() {
    if (!currentPage) {
      return;
    }

    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === currentPage) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initFaqItems() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) {
          return;
        }

        document.querySelectorAll(".faq-item").forEach((other) => {
          if (other !== item) {
            other.open = false;
          }
        });
      });
    });
  }

  function initPlaceholderPaymentCtas() {
    document.querySelectorAll("a[data-payment-cta]").forEach((element) => {
      const href = element.getAttribute("href") || "";

      if (!href.includes("YOUR_PAYMENT_LINK")) {
        return;
      }

      element.dataset.cta =
        element.dataset.placeholderCta || element.dataset.cta || "stronger-intent";
      element.textContent =
        element.dataset.placeholderLabel || "I'd pay for priority access";
      element.setAttribute("href", "#");
      element.removeAttribute("data-payment-cta");
      element.removeAttribute("target");
      element.removeAttribute("rel");

      element.addEventListener("click", (event) => {
        event.preventDefault();

        const noteTargetId = element.dataset.placeholderNoteTarget;
        const noteTarget = noteTargetId
          ? document.getElementById(noteTargetId)
          : null;

        if (noteTarget) {
          noteTarget.hidden = false;
        }
      });
    });
  }

  function initDemoModule() {
    document.querySelectorAll("[data-demo-form]").forEach((form) => {
      const placeholder = form.parentElement.querySelector("[data-demo-placeholder]");
      const selection = form.parentElement.querySelector("[data-demo-selection]");
      const result = form.parentElement.querySelector("[data-demo-result]");
      const context = form.parentElement.querySelector("[data-demo-context]");
      const title = form.parentElement.querySelector("[data-demo-title]");
      const summary = form.parentElement.querySelector("[data-demo-summary]");
      const stops = form.parentElement.querySelector("[data-demo-stops]");
      const tip = form.parentElement.querySelector("[data-demo-tip]");
      let hasStarted = false;
      const trackedSelections = new Set();

      form.querySelectorAll("select").forEach((field) => {
        field.addEventListener("change", () => {
          updateDemoSelectionPreview(form, selection);

          if (!hasStarted && hasAnyDemoValue(form)) {
            hasStarted = true;
            void trackInteraction("demo_started", "Demo started", {
              module: form.dataset.demoForm || "demo",
              page_name: currentPage || "",
            });
          }

          trackDemoSelection(field, form, trackedSelections);
        });
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
          return;
        }

        const formData = new FormData(form);
        const area = normalizeFormValue(formData.get("area"));
        const time = normalizeFormValue(formData.get("time"));
        const vibe = normalizeFormValue(formData.get("vibe"));
        const recommendation = buildDemoRecommendation(area, time, vibe);

        void trackInteraction("demo_submitted", "Demo submitted", {
          module: form.dataset.demoForm || "demo",
          area,
          time,
          vibe,
        });

        if (placeholder) {
          placeholder.hidden = true;
        }

        if (context) {
          context.textContent = getDemoSelectionSummary(area, time, vibe);
        }

        if (title) {
          title.textContent = recommendation.title;
        }

        if (summary) {
          summary.textContent = recommendation.summary;
        }

        if (stops) {
          stops.replaceChildren(
            ...recommendation.stops.map((stop, index) => {
              const item = document.createElement("li");
              const itemKicker = document.createElement("span");
              const itemTitle = document.createElement("strong");
              const itemCopy = document.createElement("p");

              itemKicker.className = "demo-stop-kicker";
              itemKicker.textContent = `Pick ${index + 1}`;
              itemTitle.textContent = stop.name;
              itemCopy.textContent = stop.detail;

              item.append(itemKicker, itemTitle, itemCopy);
              return item;
            })
          );
        }

        if (tip) {
          tip.textContent = recommendation.tip;
        }

        if (result) {
          result.hidden = false;
        }

        void trackInteraction("demo_result_viewed", "Demo result viewed", {
          module: form.dataset.demoForm || "demo",
          route_id: recommendation.id,
          area,
          time,
          vibe,
        });
      });
    });
  }

  function initTrackedCtas() {
    document.querySelectorAll("[data-cta]").forEach((element) => {
      element.addEventListener("click", () => {
        const timestamp = new Date().toISOString();
        const buttonText = getElementText(element) || "CTA click";
        const normalizedName =
          element.dataset.cta ||
          element.dataset.paymentCta ||
          normalizeLabel(buttonText);
        const metadata = buildTrackingMetadata(element);

        void sendTrackingEvent(
          {
            type: "cta_click",
            label: buttonText,
            normalized_name: normalizedName,
            page: getPagePath(),
            timestamp,
            session_id: trackingState.sessionId,
            anonymous_id: trackingState.anonymousId,
            metadata,
          },
          { preferBeacon: isNavigatingElement(element) }
        );

        if (isPaymentElement(element)) {
          void sendTrackingEvent(
            {
              type: "payment_click",
              label: buttonText,
              normalized_name: element.dataset.paymentCta || normalizedName,
              page: getPagePath(),
              timestamp,
              session_id: trackingState.sessionId,
              anonymous_id: trackingState.anonymousId,
              metadata,
            },
            { preferBeacon: true }
          );
        }
      });
    });
  }

  function initSignupForms() {
    document.querySelectorAll("[data-signup-form]").forEach((form) => {
      const emailInput = form.querySelector('input[name="email"]');
      const consentInput = form.querySelector('input[name="consent"]');
      const submitButton = form.querySelector('[type="submit"]');
      const status = form.querySelector("[data-form-status]");
      const fields = form.querySelector("[data-form-fields]");
      const successPanel = form.querySelector("[data-form-success]");
      const successEmail = form.querySelector("[data-success-email]");
      const originalLabel = submitButton ? submitButton.textContent : "";
      let hasStarted = false;

      form.addEventListener("focusin", () => {
        if (hasStarted) {
          return;
        }

        hasStarted = true;
        void trackInteraction("signup_started", "Signup started", {
          form_name: form.dataset.signupForm || "signup",
          section: getSectionName(form),
        });
      });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!emailInput || !emailInput.checkValidity()) {
          setStatus(status, "Please enter a valid email address.", true);
          if (emailInput) {
            emailInput.reportValidity();
            emailInput.focus();
          }
          return;
        }

        if (!consentInput || !consentInput.checked) {
          setStatus(status, "Please confirm that Miro can contact you with updates.", true);
          if (consentInput) {
            consentInput.focus();
          }
          return;
        }

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Saving...";
        }

        setStatus(status, "Saving your early-access request...");

        try {
          const payload = getSignupPayload(form);
          await postJson(SIGNUP_ENDPOINT, payload);

          if (hasAdvancedSignupDetails(payload)) {
            void trackInteraction("optional_details_provided", "Optional details provided", {
              form_name: form.dataset.signupForm || "signup",
              provided_fields: getAdvancedSignupFields(payload).join(","),
            });
          }

          if (fields) {
            fields.hidden = true;
          }

          if (successEmail) {
            successEmail.textContent = payload.email;
          }

          if (successPanel) {
            successPanel.hidden = false;
          }

          form.dataset.submitted = "true";
          form.reset();
          setStatus(status, "");
        } catch (error) {
          setStatus(
            status,
            error.message ||
              "Something went wrong while saving your request. Please try again in a moment.",
            true
          );

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalLabel;
          }
        }
      });
    });
  }

  function getSignupPayload(form) {
    const formData = new FormData(form);

    return {
      name: normalizeFormValue(formData.get("name")),
      email: normalizeFormValue(formData.get("email")),
      phone: normalizeFormValue(formData.get("phone")),
      language_or_nationality: normalizeFormValue(
        formData.get("language_or_nationality")
      ),
      use_case: normalizeFormValue(formData.get("use_case")),
      area: normalizeFormValue(formData.get("area")),
      message: normalizeFormValue(formData.get("message")),
      consent: formData.get("consent") === "on",
      page: getPagePath(),
      source: form.dataset.signupForm || "early_access_form",
      referrer: document.referrer || "",
      anonymous_id: trackingState.anonymousId,
      session_id: trackingState.sessionId,
      user_agent: window.navigator.userAgent || "",
      timestamp: new Date().toISOString(),
    };
  }

  function normalizeFormValue(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function hasAdvancedSignupDetails(payload) {
    return getAdvancedSignupFields(payload).length > 0;
  }

  function getAdvancedSignupFields(payload) {
    return ["name", "phone", "language_or_nationality", "message"].filter(
      (fieldName) => Boolean(payload[fieldName])
    );
  }

  function trackPageVisit() {
    void sendTrackingEvent({
      type: "visit",
      label: document.title || "Visit",
      normalized_name:
        currentPage === "home"
          ? "homepage_visit"
          : currentPage
            ? `${currentPage}_visit`
            : "page_visit",
      page: getPagePath(),
      timestamp: new Date().toISOString(),
      referrer: document.referrer || "",
      user_agent: window.navigator.userAgent || "",
      session_id: trackingState.sessionId,
      anonymous_id: trackingState.anonymousId,
      metadata: {
        page_name: currentPage || "",
      },
    });
  }

  function buildTrackingMetadata(element) {
    return {
      anonymous_id: trackingState.anonymousId,
      session_id: trackingState.sessionId,
      button_text: getElementText(element),
      destination_url: getDestinationUrl(element),
      page_name: currentPage || "",
      section: getSectionName(element),
    };
  }

  function trackInteraction(normalizedName, label, metadata = {}, options = {}) {
    return sendTrackingEvent(
      {
        type: options.type || "cta_click",
        label,
        normalized_name: normalizedName,
        page: getPagePath(),
        timestamp: new Date().toISOString(),
        session_id: trackingState.sessionId,
        anonymous_id: trackingState.anonymousId,
        metadata,
      },
      options
    );
  }

  function getElementText(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function getSectionName(element) {
    const section = element.closest("[data-section]");
    return section ? section.getAttribute("data-section") || "" : "";
  }

  function getDestinationUrl(element) {
    const href = element.getAttribute("href");

    if (!href) {
      return "";
    }

    try {
      return new URL(href, window.location.href).toString();
    } catch (error) {
      return href;
    }
  }

  function isNavigatingElement(element) {
    return element.tagName === "A" && element.hasAttribute("href");
  }

  function isPaymentElement(element) {
    return (
      element.hasAttribute("data-payment-cta") ||
      getDestinationUrl(element).includes("buy.stripe.com")
    );
  }

  function getPagePath() {
    return window.location.pathname || "/";
  }

  async function sendTrackingEvent(payload, options) {
    try {
      await postJson(TRACK_ENDPOINT, payload, options);
    } catch (error) {
      console.warn("Tracking request failed.", error);
    }
  }

  async function postJson(url, payload, options = {}) {
    const requestBody = JSON.stringify(payload);

    if (options.preferBeacon && navigator.sendBeacon) {
      const wasQueued = navigator.sendBeacon(
        url,
        new Blob([requestBody], { type: "application/json" })
      );

      if (wasQueued) {
        return { ok: true, transport: "beacon" };
      }
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: requestBody,
      keepalive: Boolean(options.preferBeacon),
    });

    const responseBody = await response
      .json()
      .catch(() => ({ ok: response.ok, error: "Request failed." }));

    if (!response.ok) {
      throw new Error(responseBody.error || "Request failed.");
    }

    return responseBody;
  }

  function setStatus(element, message, isError = false) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.toggle("is-error", Boolean(isError && message));
  }

  function normalizeLabel(value) {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    return normalized || "cta";
  }

  function createTrackingState() {
    return {
      anonymousId: getOrCreateClientId(window.localStorage, "miro_anon_id", "anon"),
      sessionId: getOrCreateClientId(
        window.sessionStorage,
        "miro_session_id",
        "session"
      ),
    };
  }

  function getOrCreateClientId(storage, key, prefix) {
    try {
      const existingValue = storage.getItem(key);

      if (existingValue) {
        return existingValue;
      }

      const createdValue = createClientId(prefix);
      storage.setItem(key, createdValue);
      return createdValue;
    } catch (error) {
      return createClientId(prefix);
    }
  }

  function createClientId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}_${window.crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  function hasAnyDemoValue(form) {
    const formData = new FormData(form);
    return ["area", "time", "vibe"].some((fieldName) =>
      Boolean(normalizeFormValue(formData.get(fieldName)))
    );
  }

  function trackDemoSelection(field, form, trackedSelections) {
    const value = normalizeFormValue(field.value);

    if (!value) {
      return;
    }

    const normalizedName = `demo_input_${field.name}_selected`;
    const dedupeKey = `${field.name}:${value}`;

    if (trackedSelections.has(dedupeKey)) {
      return;
    }

    trackedSelections.add(dedupeKey);
    void trackInteraction(normalizedName, `Demo ${field.name} selected`, {
      module: form.dataset.demoForm || "demo",
      field_name: field.name,
      field_value: value,
    });
  }

  function updateDemoSelectionPreview(form, selection) {
    if (!selection) {
      return;
    }

    const formData = new FormData(form);
    const values = {
      area: DEMO_LABELS.area[normalizeFormValue(formData.get("area"))] || "not set",
      time: DEMO_LABELS.time[normalizeFormValue(formData.get("time"))] || "not set",
      vibe: DEMO_LABELS.vibe[normalizeFormValue(formData.get("vibe"))] || "not set",
    };

    selection.querySelectorAll("[data-demo-chip]").forEach((chip) => {
      const fieldName = chip.dataset.demoChip || "";
      const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      chip.textContent = `${label}: ${values[fieldName] || "not set"}`;
    });

    selection.hidden = !["area", "time", "vibe"].some((fieldName) => {
      return values[fieldName] !== "not set";
    });
  }

  function getDemoSelectionSummary(area, time, vibe) {
    const values = [
      DEMO_LABELS.area[area] || "Area not set",
      DEMO_LABELS.time[time] || "Time not set",
      DEMO_LABELS.vibe[vibe] || "Vibe not set",
    ];

    return values.join(" / ");
  }

  function buildDemoRecommendation(area, time, vibe) {
    const areaConfig = DEMO_LIBRARY[area] || DEMO_LIBRARY.hongdae;
    const routeConfig =
      areaConfig.routes[vibe] ||
      areaConfig.routes[VIBE_FALLBACKS[vibe]] ||
      areaConfig.routes.default;
    const timeLabel = TIME_LABELS[time] || "A quick";

    return {
      id: `${area}_${time}_${vibe}`,
      title: `${areaConfig.label} - ${routeConfig.routeName}`,
      summary: `${timeLabel} route for a ${routeConfig.summaryTone} moment in ${areaConfig.label}. ${routeConfig.summary}`,
      stops: routeConfig.stops,
      tip: routeConfig.tip,
    };
  }

  const DEMO_LABELS = {
    area: {
      hongdae: "Hongdae",
      seongsu: "Seongsu",
      itaewon: "Itaewon",
      myeongdong: "Myeongdong",
      jamsil: "Jamsil",
    },
    time: {
      "45_min": "45 min",
      "2_hours": "2 hours",
      half_day: "Half day",
      evening: "Evening",
    },
    vibe: {
      calm: "Calm",
      local: "Local",
      date: "Date",
      food: "Food",
      design: "Design",
      night: "Night",
      reset: "Reset",
    },
  };

  const TIME_LABELS = {
    "45_min": "A 45-minute",
    "2_hours": "A 2-hour",
    half_day: "A half-day",
    evening: "An evening",
  };

  const VIBE_FALLBACKS = {
    reset: "calm",
    local: "calm",
    date: "night",
    design: "calm",
  };

  const DEMO_LIBRARY = {
    hongdae: {
      label: "Hongdae",
      routes: {
        calm: {
          routeName: "Yeonnam reset loop",
          summaryTone: "calmer",
          summary:
            "Stay just outside the loudest streets and keep the route easy to finish without decision fatigue.",
          stops: [
            {
              name: "A quieter coffee counter off the main drag",
              detail:
                "Start with one place that gives you a breather before the neighborhood gets loud.",
            },
            {
              name: "A small independent book-and-zine stop",
              detail:
                "Pick one compact browse stop instead of drifting through a long shopping stretch.",
            },
            {
              name: "The Yeonnam rail-park walk",
              detail:
                "End with one clean walking line so you can decide whether to keep going or call it there.",
            },
          ],
          tip: "Best when you want Hongdae energy nearby, but not on top of you.",
        },
        night: {
          routeName: "Late Hongdae pulse",
          summaryTone: "higher-energy",
          summary:
            "A tighter after-dark sequence that keeps the night moving without making you pick from too many options.",
          stops: [
            {
              name: "An indie listening bar to open the night",
              detail:
                "Start somewhere with atmosphere so the night already feels chosen.",
            },
            {
              name: "One focused late dinner stop",
              detail:
                "Choose a single reliable plate instead of circling multiple menus.",
            },
            {
              name: "A photo-booth or dessert finish nearby",
              detail:
                "Close with an easy final stop that feels like an ending rather than another search.",
            },
          ],
          tip: "Good for spontaneous nights when you still want the route to feel intentional.",
        },
        food: {
          routeName: "Hongdae food-first detour",
          summaryTone: "food-led",
          summary:
            "Built for a short sequence of one strong meal, one snack, and one easy close.",
          stops: [
            {
              name: "A tucked-in noodle or rice stop",
              detail:
                "Lead with something dependable that anchors the rest of the route.",
            },
            {
              name: "A small dessert counter",
              detail:
                "Add one sweet stop within walking distance instead of opening another search app.",
            },
            {
              name: "A side-street bar or tea room",
              detail:
                "Finish with one drink stop that lets you decide whether to stay out longer.",
            },
          ],
          tip: "Useful when the question is really what to eat, but you still want the evening to flow.",
        },
        default: {
          routeName: "Hongdae starter route",
          summaryTone: "balanced",
          summary:
            "A balanced sample route that keeps the neighborhood feeling manageable.",
          stops: [
            {
              name: "A reliable first coffee or drink",
              detail: "Start somewhere easy so the rest of the route has a clear anchor.",
            },
            {
              name: "One browse or culture stop",
              detail: "Give the route a point beyond eating or wandering.",
            },
            {
              name: "One dinner or dessert close",
              detail: "Finish with one obvious next move instead of another decision tree.",
            },
          ],
          tip: "Miro works best when it narrows the neighborhood into one route, not ten choices.",
        },
      },
    },
    seongsu: {
      label: "Seongsu",
      routes: {
        design: {
          routeName: "Design-side Seongsu",
          summaryTone: "design-forward",
          summary:
            "A small route for when you want the neighborhood's studio-and-gallery feel without defaulting to the busiest queue.",
          stops: [
            {
              name: "A gallery lane or showroom stop",
              detail: "Open with one place that makes Seongsu feel distinct from a generic cafe crawl.",
            },
            {
              name: "A material-led concept store",
              detail: "Keep one tactile browse stop in the middle rather than stacking multiple retail detours.",
            },
            {
              name: "A calm roastery to land the route",
              detail: "End with one sit-down reset where the route can stop cleanly.",
            },
          ],
          tip: "Best for people who want Seongsu to feel thoughtful, not crowded-for-the-sake-of-it.",
        },
        calm: {
          routeName: "Seongsu reset loop",
          summaryTone: "slower",
          summary:
            "A lower-pressure path that keeps Seongsu useful without turning it into a full-day commitment.",
          stops: [
            {
              name: "A quieter courtyard cafe",
              detail: "Start slightly off the main strip so the area feels easier immediately.",
            },
            {
              name: "A short browse through a small local shop",
              detail: "Add one browse stop, not five competing ones.",
            },
            {
              name: "A riverside or side-street walk out",
              detail: "Finish with space to reset before deciding what comes next.",
            },
          ],
          tip: "Good when you want Seongsu texture without burning half a day on decisions.",
        },
        food: {
          routeName: "Seongsu dinner detour",
          summaryTone: "food-led",
          summary:
            "A compact sequence that makes Seongsu useful for one satisfying meal stretch.",
          stops: [
            {
              name: "A focused dinner reservation or walk-in target",
              detail: "Lead with the meal so the rest of the route stays light.",
            },
            {
              name: "A bakery or dessert stop nearby",
              detail: "Keep the second stop close enough that the route still feels tight.",
            },
            {
              name: "A coffee finish or easy nightcap",
              detail: "Close with one optional linger point instead of re-opening the search.",
            },
          ],
          tip: "This is the version for people who want Seongsu to answer dinner, not the whole day.",
        },
        default: {
          routeName: "Seongsu starter route",
          summaryTone: "balanced",
          summary:
            "A balanced sample that gives the area shape without making you work for it.",
          stops: [
            {
              name: "One strong opener",
              detail: "Pick the first stop on purpose so the rest of the neighborhood follows.",
            },
            {
              name: "One browse stop with texture",
              detail: "Use one meaningful detour instead of stacking lookalike stops.",
            },
            {
              name: "One gentle finish",
              detail: "End where it's easy to either stay longer or move on cleanly.",
            },
          ],
          tip: "Miro is strongest when the answer feels selective, not encyclopedic.",
        },
      },
    },
    itaewon: {
      label: "Itaewon",
      routes: {
        night: {
          routeName: "Itaewon after-dark route",
          summaryTone: "after-dark",
          summary:
            "A more intentional night sequence that keeps the neighborhood from feeling too wide open.",
          stops: [
            {
              name: "A rooftop or high-angle opener",
              detail: "Start somewhere that immediately gives the night direction.",
            },
            {
              name: "One dinner or shared-plates stop",
              detail: "Keep the meal central so the route doesn't dissolve into wandering.",
            },
            {
              name: "A short final bar or walk toward the hill",
              detail: "End with one more move that still feels closeable.",
            },
          ],
          tip: "Best for nights that need structure without losing the neighborhood's range.",
        },
        date: {
          routeName: "Itaewon date flow",
          summaryTone: "date-ready",
          summary:
            "A route that feels intentional enough for a date without becoming over-planned.",
          stops: [
            {
              name: "A low-light wine or cocktail opener",
              detail: "Start somewhere that sets tone fast.",
            },
            {
              name: "A tucked courtyard dinner stop",
              detail: "One clear dinner pick beats comparing eight options on the walk.",
            },
            {
              name: "A short Namsan-side walk or dessert close",
              detail: "Finish with one soft landing instead of another venue hunt.",
            },
          ],
          tip: "This is the sample for people who want the night to feel a little more composed.",
        },
        food: {
          routeName: "Itaewon food-first route",
          summaryTone: "food-led",
          summary:
            "A cross-cultural dinner path without the usual decision pile-up.",
          stops: [
            {
              name: "One cuisine-led dinner anchor",
              detail: "Start with the place you actually came for.",
            },
            {
              name: "A nearby dessert or late snack",
              detail: "Add one contrast stop without changing neighborhoods.",
            },
            {
              name: "A final drink or tea close",
              detail: "Keep one easy ending in reserve.",
            },
          ],
          tip: "Useful when Itaewon feels too broad and the real question is where to start.",
        },
        default: {
          routeName: "Itaewon starter route",
          summaryTone: "balanced",
          summary:
            "A balanced route that narrows Itaewon into one manageable next move.",
          stops: [
            {
              name: "A first drink or coffee with atmosphere",
              detail: "Give the neighborhood a tone immediately.",
            },
            {
              name: "One decisive meal or browse stop",
              detail: "Keep the middle of the route focused.",
            },
            {
              name: "One final close nearby",
              detail: "End without reopening the search from scratch.",
            },
          ],
          tip: "Miro is most useful when the neighborhood is broad but your time is not.",
        },
      },
    },
    myeongdong: {
      label: "Myeongdong",
      routes: {
        food: {
          routeName: "Myeongdong snack-and-reset route",
          summaryTone: "food-led",
          summary:
            "A sample route that makes the area useful beyond pure crowd drift.",
          stops: [
            {
              name: "A focused noodle or dumpling opener",
              detail: "Start with a proper bite before the street-food temptation multiplies.",
            },
            {
              name: "One market dessert or snack detour",
              detail: "Pick one fun stop instead of sampling without direction.",
            },
            {
              name: "A short rooftop or cathedral-side reset",
              detail: "Give the route one quiet final moment so the area feels balanced.",
            },
          ],
          tip: "Good when you want food energy without turning the route into chaos.",
        },
        local: {
          routeName: "Myeongdong local-angle route",
          summaryTone: "more local",
          summary:
            "A route that nudges you slightly off the most obvious flow while keeping Myeongdong convenient.",
          stops: [
            {
              name: "A side-street breakfast or cafe stop",
              detail: "Start one layer removed from the busiest strip.",
            },
            {
              name: "A narrow-lane shop or service stop",
              detail: "Add one local-feeling errand or browse moment.",
            },
            {
              name: "A final walk toward Namsan or City Hall",
              detail: "Leave the area with direction instead of looping back into the crowd.",
            },
          ],
          tip: "Useful when the neighborhood is convenient but you still want one better angle on it.",
        },
        default: {
          routeName: "Myeongdong starter route",
          summaryTone: "balanced",
          summary:
            "A compact route that turns a busy district into one cleaner sequence.",
          stops: [
            {
              name: "One anchor stop to begin",
              detail: "Start with purpose so the crowd doesn't set the agenda.",
            },
            {
              name: "One snack, browse, or view moment",
              detail: "Use the middle of the route to give the area shape.",
            },
            {
              name: "One final move out",
              detail: "Finish somewhere that makes the next decision easy.",
            },
          ],
          tip: "The point is not to see everything. It's to stop losing energy to the decision layer.",
        },
      },
    },
    jamsil: {
      label: "Jamsil",
      routes: {
        reset: {
          routeName: "Jamsil reset route",
          summaryTone: "reset-focused",
          summary:
            "Built for a softer route around the lake and nearby streets when you want space more than stimulation.",
          stops: [
            {
              name: "A quiet coffee start near the lake",
              detail: "Open with one steady place before you start walking.",
            },
            {
              name: "A focused Seokchon Lake loop segment",
              detail: "Keep the walk intentional instead of turning it into a vague wander.",
            },
            {
              name: "A final tea, dessert, or sunset bench stop",
              detail: "Give the route a clean ending rather than another round of planning.",
            },
          ],
          tip: "Ideal when the real need is to reset, not maximize the neighborhood.",
        },
        date: {
          routeName: "Jamsil easy date route",
          summaryTone: "date-ready",
          summary:
            "A route for people who want the area to feel easy, scenic, and not overbuilt.",
          stops: [
            {
              name: "A coffee or dessert opener with a view",
              detail: "Start with an easy place to settle in.",
            },
            {
              name: "A short lakeside walk stretch",
              detail: "Use the middle of the route for momentum without pressure.",
            },
            {
              name: "One dinner or bar finish nearby",
              detail: "End close enough that the route still feels tidy.",
            },
          ],
          tip: "Best for people who want the evening to feel composed rather than busy.",
        },
        default: {
          routeName: "Jamsil starter route",
          summaryTone: "balanced",
          summary:
            "A simple route that makes Jamsil feel clearer and less over-scoped.",
          stops: [
            {
              name: "One clear opener",
              detail: "Begin with purpose so the scale of the area feels smaller.",
            },
            {
              name: "One middle stop with room to linger",
              detail: "Give the route a little texture without adding too much choice.",
            },
            {
              name: "One final close by the lake or nearby block",
              detail: "Finish somewhere that naturally ends the route.",
            },
          ],
          tip: "Even bigger districts feel easier when the route is selective from the start.",
        },
      },
    },
  };
})();
