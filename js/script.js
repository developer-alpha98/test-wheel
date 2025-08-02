// script.js
document.addEventListener("DOMContentLoaded", function () {
    // ---------- Constants & storage keys ----------
    const STORAGE_KEYS = {
        WHEEL_ITEMS: "wheelItems",
        SETTINGS: "wheelSettings",
        VOLUME: "siteVolume",
    };

    let previousSliceIndex = -1;

    // ---------- Persistence helpers ----------
    function saveWheelItems() {
        const items = Array.from(document.querySelectorAll(".edit-wheel-items__wheel-item")).map(item => {
            const rate = item.querySelector(".edit-wheel-items__item-rate")?.value || "";
            const text = item.querySelector(".edit-wheel-items__input")?.value || "";
            return { rate, text };
        });
        localStorage.setItem(STORAGE_KEYS.WHEEL_ITEMS, JSON.stringify(items));
        buildWheel(); // همزمان بازسازی گردونه
    }

    function loadWheelItems() {
        const container = document.querySelector(".edit-wheel-items");
        const stored = localStorage.getItem(STORAGE_KEYS.WHEEL_ITEMS);
        if (stored) {
            let items;
            try {
                items = JSON.parse(stored);
            } catch {
                items = null;
            }
            if (Array.isArray(items) && items.length) {
                // پاک کردن آیتم‌های موجود (به جز هدرها)
                document.querySelectorAll(".edit-wheel-items__wheel-item").forEach(el => el.remove());
                items.forEach(obj => {
                    const newItem = createWheelItem(obj.rate, obj.text);
                    const bottomHeader = document.querySelectorAll(".edit-wheel-items__header")[1];
                    if (bottomHeader) bottomHeader.insertAdjacentElement("beforebegin", newItem);
                    else container.appendChild(newItem);
                });
            }
        }
    }

    function saveSettings() {
        const selects = {};
        document.querySelectorAll(".custom-select").forEach(sel => {
            const key = [...sel.classList].filter(c => c !== "custom-select")[0] || sel.getAttribute("data-key") || "select";
            const display = sel.querySelector(".select-display");
            selects[key] = display?.textContent || "";
        });

        const switches = {};
        document.querySelectorAll("input[type=checkbox]").forEach(input => {
            // تلاش برای گرفتن کلید از والد یا کلاس
            let key = input.closest("label")?.className || input.closest(".settings__section")?.className || "checkbox";
            switches[key] = input.checked;
        });

        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ selects, switches }));
    }

    function loadSettings() {
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (!stored) return;
        let parsed;
        try {
            parsed = JSON.parse(stored);
        } catch {
            return;
        }
        if (parsed.selects) {
            document.querySelectorAll(".custom-select").forEach(sel => {
                const key = [...sel.classList].filter(c => c !== "custom-select")[0] || sel.getAttribute("data-key") || "select";
                const display = sel.querySelector(".select-display");
                if (key in parsed.selects && display) {
                    display.textContent = parsed.selects[key];
                }
            });
        }
        if (parsed.switches) {
            document.querySelectorAll("input[type=checkbox]").forEach(input => {
                let key = input.closest("label")?.className || input.closest(".settings__section")?.className || "checkbox";
                if (key in parsed.switches) {
                    input.checked = parsed.switches[key];
                }
            });
        }
    }

    function saveVolume() {
        const volumeSlider = document.getElementById('siteVolumeSlider');
        if (volumeSlider) {
            localStorage.setItem(STORAGE_KEYS.VOLUME, volumeSlider.value);
        }
    }

    function loadVolume() {
        const volumeSlider = document.getElementById('siteVolumeSlider');
        const sliderTooltip = document.getElementById('sliderTooltip');
        if (!volumeSlider || !sliderTooltip) return;
        const stored = localStorage.getItem(STORAGE_KEYS.VOLUME);
        if (stored !== null) {
            volumeSlider.value = stored;
        }
        updateSlider(); // به‌روزرسانی نمایشی
    }

    // ---------- Wheel item creation with remove icon ----------
    function createWheelItem(rate = "1", text = "") {
        const wrapper = document.createElement("div");
        wrapper.classList.add("edit-wheel-items__wheel-item");

        const rateInput = document.createElement("input");
        rateInput.type = "number";
        rateInput.className = "edit-wheel-items__item-rate";
        rateInput.value = rate;
        rateInput.min = "0.1";
        rateInput.addEventListener("input", () => {
            saveWheelItems();
        });

        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.className = "edit-wheel-items__input";
        textInput.placeholder = "چالش جدید را وارد کنید";
        textInput.value = text;
        textInput.addEventListener("input", () => {
            saveWheelItems();
        });

        const removeImg = document.createElement("img");
        removeImg.src = "img/interface/wheel-items/remove-item.png";
        removeImg.alt = "remove-item";
        removeImg.width = 24;
        removeImg.height = 24;
        removeImg.style.cursor = "pointer";
        removeImg.addEventListener("click", () => {
            wrapper.remove();
            saveWheelItems();
        });

        wrapper.appendChild(rateInput);
        wrapper.appendChild(textInput);
        wrapper.appendChild(removeImg); // آیکون حذف سمت راست

        return wrapper;
    }

    // ---------- Attach handlers to existing items on load ----------
    function attachInitialWheelItemHandlers() {
        document.querySelectorAll(".edit-wheel-items__wheel-item").forEach(item => {
            let existing = item.querySelector('img[alt="remove-item"]');
            if (!existing) {
                const removeImg = document.createElement("img");
                removeImg.src = "img/interface/wheel-items/remove-item.png";
                removeImg.alt = "remove-item";
                removeImg.width = 24;
                removeImg.height = 24;
                removeImg.style.cursor = "pointer";
                removeImg.addEventListener("click", () => {
                    item.remove();
                    saveWheelItems();
                });
                item.appendChild(removeImg);
            } else {
                existing.style.cursor = "pointer";
                existing.addEventListener("click", () => {
                    item.remove();
                    saveWheelItems();
                });
            }

            const rateInput = item.querySelector(".edit-wheel-items__item-rate");
            const textInput = item.querySelector(".edit-wheel-items__input");
            if (rateInput) rateInput.addEventListener("input", saveWheelItems);
            if (textInput) textInput.addEventListener("input", saveWheelItems);
        });
    }

    // ---------- Add item button ----------
    const addItemBtn = document.querySelector(".edit-wheel-items__add-item");
    if (addItemBtn) {
        addItemBtn.addEventListener("click", () => {
            const newItem = createWheelItem("1", "");
            const bottomHeader = document.querySelectorAll(".edit-wheel-items__header")[1];
            if (bottomHeader) bottomHeader.insertAdjacentElement("beforebegin", newItem);
            else document.querySelector(".edit-wheel-items")?.appendChild(newItem);
            saveWheelItems();
        });
    }

    // ---------- Reset wheel items header ----------
    const topResetIcon = document.querySelector(".edit-wheel-items__header img[alt='reset']");
    if (topResetIcon) {
        topResetIcon.style.cursor = "pointer";
        topResetIcon.addEventListener("click", () => {
            const items = Array.from(document.querySelectorAll(".edit-wheel-items__wheel-item"));
            if (items.length > 5) {
                items.slice(5).forEach(it => it.remove());
            }
            Array.from(document.querySelectorAll(".edit-wheel-items__wheel-item")).slice(0, 5).forEach(it => {
                const rateInput = it.querySelector(".edit-wheel-items__item-rate");
                const textInput = it.querySelector(".edit-wheel-items__input");
                if (rateInput) rateInput.value = "";
                if (textInput) textInput.value = "";
            });
            saveWheelItems();
        });
    }

    // ---------- Custom select persistence ----------
    const allCustomSelects = document.querySelectorAll(".custom-select");
    allCustomSelects.forEach((select) => {
        const display = select.querySelector(".select-display");
        const options = select.querySelector(".select-options");

        select.addEventListener("click", function (e) {
            e.stopPropagation();
            allCustomSelects.forEach((el) => {
                if (el !== select) el.classList.remove("open");
            });
            select.classList.toggle("open");
        });

        options.querySelectorAll(".option").forEach((option) => {
            option.addEventListener("click", function (e) {
                e.stopPropagation();
                display.textContent = this.textContent;
                select.classList.remove("open");
                saveSettings();
            });
        });
    });
    document.addEventListener("click", function () {
        allCustomSelects.forEach((select) => {
            select.classList.remove("open");
        });
    });

    // ---------- Volume slider ----------
    const volumeSlider = document.getElementById('siteVolumeSlider');
    const sliderTooltip = document.getElementById('sliderTooltip');

    function updateSlider() {
        if (!volumeSlider || !sliderTooltip) return;
        const value = volumeSlider.value;
        sliderTooltip.textContent = value;
        const percent = value / volumeSlider.max;
        const thumbOffset = percent * volumeSlider.offsetWidth;
        sliderTooltip.style.left = `${thumbOffset}px`;
        volumeSlider.style.background = `linear-gradient(to right, #6c5ce7 ${value}%, #ccc ${value}%)`;
    }

    if (volumeSlider && sliderTooltip) {
        volumeSlider.addEventListener('input', () => {
            updateSlider();
            sliderTooltip.style.opacity = 1;
            sliderTooltip.style.top = '-35px';
            saveVolume();
        });

        volumeSlider.addEventListener('mouseenter', () => {
            sliderTooltip.style.opacity = 1;
            updateSlider();
        });

        volumeSlider.addEventListener('mouseleave', () => {
            sliderTooltip.style.opacity = 0;
        });
    }

    // ---------- Switch persistence ----------
    document.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener("change", () => {
            saveSettings();
        });
    });

    // ---------- Wheel items input listener for rebuild ----------
    document.body.addEventListener("input", (e) => {
        if (e.target.matches(".edit-wheel-items__input") || e.target.matches(".edit-wheel-items__item-rate")) {
            buildWheel();
        }
    });

    // ---------- Load on startup ----------
    loadSettings();
    loadVolume();
    loadWheelItems();
    attachInitialWheelItemHandlers();

    // ---------- Spinning wheel logic ----------
    const wheelSvg = document.getElementById("spinningWheel");
    const slicesGroup = document.getElementById("slices");
    const spinButton = document.getElementById("spinButton");
    const spinText = document.getElementById("spinButtonText");
    let isSpinning = false;
    let currentAngle = 0;

    const baseColors = [
        "#f44336", "#e91e63", "#9c27b0", "#673ab7",
        "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
        "#009688", "#4caf50", "#8bc34a", "#cddc39",
        "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
    ];

    function getWheelItemsFromDOM() {
        const items = Array.from(document.querySelectorAll(".edit-wheel-items__wheel-item"))
            .map(item => {
                const rateStr = item.querySelector(".edit-wheel-items__item-rate")?.value || "1";
                const rate = parseFloat(rateStr) || 1;
                const text = item.querySelector(".edit-wheel-items__input")?.value.trim() || "بدون عنوان";
                return { rate: Math.max(rate, 0.1), text };
            })
            .filter(i => i.text.length > 0);
        return items;
    }

    function polarToCartesian(r, angleDeg) {
        const angleRad = (angleDeg) * Math.PI / 180; // صفر از راست، ساعتگرد
        return {
            x: Math.cos(angleRad) * r,
            y: Math.sin(angleRad) * r
        };
    }

    function buildWheel() {
        const items = getWheelItemsFromDOM();
        slicesGroup.innerHTML = "";
        if (!items.length) {
            items.push({ rate: 1, text: "هیچ‌چیز" });
        }
        

        const totalWeight = items.reduce((sum, it) => sum + it.rate, 0);
        let startAngle = 0;

        items.forEach((item, idx) => {
            const sliceAngle = (item.rate / totalWeight) * 360;
            const midAngle = startAngle + sliceAngle / 2;

            const radius = 220;
            const largeArc = sliceAngle > 180 ? 1 : 0;
            const from = polarToCartesian(radius, startAngle);
            const to = polarToCartesian(radius, startAngle + sliceAngle);

            const pathData = [
                `M 0 0`,
                `L ${from.x} ${from.y}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`,
                "Z"
            ].join(" ");

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", baseColors[idx % baseColors.length]);
            path.setAttribute("stroke", "#fff");
            path.setAttribute("stroke-width", "2");
            path.dataset.midAngle = midAngle;

            const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const textRadius = radius * 0.6;
            const textPos = polarToCartesian(textRadius, midAngle);
            textEl.setAttribute("x", textPos.x);
            textEl.setAttribute("y", textPos.y + 5);
            textEl.setAttribute("text-anchor", "middle");
            textEl.setAttribute("font-size", "14");
            textEl.setAttribute("fill", "#fff");
            textEl.setAttribute("font-weight", "600");
            textEl.setAttribute("font-family", "YekanBakh, sans-serif");
            let displayText = item.text;
            if (displayText.length > 19) {
                displayText = displayText.substring(0, 16) + '...';
            }
            textEl.textContent = displayText;
            textEl.setAttribute("direction", "ltr");

            // همه متن‌ها رو به سمت مرکز راست کنیم (بدون چرخش ۱۸۰)
            textEl.setAttribute("transform", `rotate(${midAngle} ${textPos.x} ${textPos.y})`);

            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.appendChild(path);
            group.appendChild(textEl);
            slicesGroup.appendChild(group);

            startAngle += sliceAngle;

        });

    }


    function pickWeightedIndex(items) {
        const total = items.reduce((s, i) => s + i.rate, 0);
        const r = Math.random() * total;
        let acc = 0;
        for (let i = 0; i < items.length; i++) {
            acc += items[i].rate;
            if (r <= acc) return i;
        }
        return items.length - 1;
    }

    function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;
        buildWheel();

        const items = getWheelItemsFromDOM();
        if (!items.length) {
            isSpinning = false;
            return;
        }
        const selectedIndex = pickWeightedIndex(items);
        const totalWeight = items.reduce((s, i) => s + i.rate, 0);
        let angleSum = 0;
        let selectedAngle = 0;

        for (let i = 0; i <= selectedIndex; i++) {
            const sliceAngle = (items[i].rate / totalWeight) * 360;
            if (i === selectedIndex) {
                selectedAngle = angleSum + sliceAngle / 2;
            }
            angleSum += sliceAngle;
        }

        const minTurns = 4;
        const maxTurns = 7;
        const extraTurns = Math.random() * (maxTurns - minTurns) + minTurns;
        const randomNoise = (Math.random() - 0.5) * 20;
        const finalRotation = extraTurns * 360 + (360 + randomNoise - selectedAngle);

        const duration = 4500;
        const startTime = performance.now();
        const startAngle = currentAngle;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function frame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const delta = finalRotation * eased;
            const newAngle = startAngle + delta;

            currentAngle = newAngle;

            // بچرخون
            slicesGroup.setAttribute('transform', `translate(250,250) rotate(${newAngle})`);
            const currentAbsoluteAngle = ((newAngle % 360) + 360) % 360;
            const pointerAngle = (360 - currentAbsoluteAngle) % 360;

            // محاسبه index قطعه فعلی
            const currentSliceIndex = getSelectedSliceIndex(pointerAngle, items);

            // اگر وارد قطعه جدید شدیم، فلش رو لرزش بده
            if (currentSliceIndex !== previousSliceIndex) {
                previousSliceIndex = currentSliceIndex;

                const pointer = document.querySelector(".wheel-arrow");
                if (pointer) {
                    pointer.classList.remove("tick"); // ریست انیمیشن
                    void pointer.offsetWidth; // ترفند ریست انیمیشن
                    pointer.classList.add("tick");
                }

            }

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                isSpinning = false;

                const finalAbsoluteAngle = ((newAngle % 360) + 360) % 360;
                // چون گردونه ساعتگرد چرخیده، آیتمی که در زاویه (360 - finalAngle) است میاد زیر فلش
                const pointerAngle = (360 - finalAbsoluteAngle) % 360;

                const selectedIndex = getSelectedSliceIndex(pointerAngle, items);

                const resultText = items[selectedIndex].text;
                Swal.fire({
                    title: 'نتیجه گردون 🎲',
                    html: `<div style="font-family: YekanBakh, sans-serif; font-size: 18px;">${resultText}</div>`,
                    icon: 'success',
                    confirmButtonText: 'باشه',
                    background: '#121117',
                    color: '#ffffff',
                    confirmButtonColor: '#6D49FF',
                    showClass: {
                        popup: 'animate__animated animate__zoomInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut',
                    },
                    customClass: {
                        popup: 'sweet-popup',
                        confirmButton: 'sweet-confirm-btn'
                    }
                });
                // آپدیت باکس پایین گردونه
                document.getElementById("lastSelectedText").textContent = resultText;

            }
        }

        requestAnimationFrame(frame);
    }



    function getSelectedSliceIndex(pointerAngle, items) {
        const totalWeight = items.reduce((sum, it) => sum + it.rate, 0);
        let start = 0;
        for (let i = 0; i < items.length; i++) {
            const sliceAngle = (items[i].rate / totalWeight) * 360;
            const end = start + sliceAngle;
            if (pointerAngle >= start && pointerAngle < end) {
                return i;
            }
            start = end;
        }
        return 0; // fallback
    }




    // بازسازی اولیه
    buildWheel();

    // هر وقت آیتم‌ها تغییر کرد دوباره بساز
    const wheelItemsContainer = document.querySelector(".edit-wheel-items");
    if (wheelItemsContainer) {
        const mutationObserver = new MutationObserver(() => buildWheel());
        mutationObserver.observe(wheelItemsContainer, { childList: true, subtree: true });
    }

    // اتصال دکمه
    if (spinButton) {
        spinButton.addEventListener("click", spinWheel);
    }

    // ---------- Starfield canvas animation (اگر قبلاً بود نگه دار) ----------
    const c = document.getElementById("c");
    if (c) {
        let ctx = c.getContext("2d"),
            h = c.height = window.innerHeight,
            w = c.width = window.innerWidth,
            random = (n) => Math.random() * n,
            stars = new Array(1000).fill().map(() => {
                return {
                    r: random(w),
                    s: random(0.002),
                    a: random(Math.PI * 2)
                };
            });

        function loop() {
            ctx.fillStyle = "rgba(10,5,46,0.1)";
            ctx.fillRect(0, 0, w, h);
            stars.forEach(e => {
                e.a += e.s;
                ctx.save();
                ctx.beginPath();
                ctx.translate(w / 2, h / 2);
                ctx.rotate(e.a);
                ctx.arc(e.r, e.r, 1, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.restore();
            });
            requestAnimationFrame(loop);
        }

        loop();

        window.addEventListener("resize", () => {
            w = c.width = window.innerWidth;
            h = c.height = window.innerHeight;
        });
    }

    // ---------- Footer auto scroll ----------
    const footer = document.querySelector(".footer");
    if (footer) {
        footer.addEventListener("mouseenter", () => {
            const start = window.scrollY;
            const end = document.documentElement.scrollHeight;
            const duration = 600;
            let startTime = null;

            function scrollStep(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = timestamp - startTime;
                const percent = Math.min(progress / duration, 1);
                const current = start + (end - start) * percent;
                window.scrollTo(0, current);
                if (percent < 1) {
                    requestAnimationFrame(scrollStep);
                }
            }

            requestAnimationFrame(scrollStep);
        });
    }

    // ---------- Settings panel open/close ----------
    const openBtn = document.querySelector(".header__setting");
    const settingsPanel = document.querySelector(".settings");
    if (openBtn && settingsPanel) {
        openBtn.addEventListener("click", function () {
            settingsPanel.style.display = "block";
            setTimeout(() => {
                settingsPanel.classList.add("active");
            }, 10);
        });

        settingsPanel.addEventListener("click", function (e) {
            if (e.target.closest(".settings__close")) {
                settingsPanel.classList.remove("active");
                setTimeout(() => {
                    settingsPanel.style.display = "none";
                }, 300);
            }
        });
    }
});
