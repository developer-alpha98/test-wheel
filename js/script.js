document.addEventListener("DOMContentLoaded", function () {
    // --- Custom Select ---
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
            });
        });
    });

    document.addEventListener("click", function () {
        allCustomSelects.forEach((select) => {
            select.classList.remove("open");
        });
    });

    // --- Starfield Canvas Animation ---
    const c = document.getElementById("c");
    if (c) {
        let ctx = c.getContext("2d"),
            h = c.height = window.innerHeight,
            w = c.width = window.innerWidth,
            random = (n) => Math.random() * n,
            stars = new Array(1000).fill().map(() => {
                return {
                    r: random(w),
                    s: random(0.002), // سرعت چرخش ستاره‌ها (کندتر از قبل)
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

// --- Footer Auto Scroll on Hover ---
    const footer = document.querySelector(".footer");

    if (footer) {
        footer.addEventListener("mouseenter", () => {
            const start = window.scrollY;
            const end = document.documentElement.scrollHeight;
            const duration = 600; // ms - باید مطابق با duration ترنزیشن فوتر باشه
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






    const volumeSlider = document.getElementById('siteVolumeSlider');
    const sliderTooltip = document.getElementById('sliderTooltip');

    function updateSlider() {
        const value = volumeSlider.value;
        sliderTooltip.textContent = value;
        const percent = value / volumeSlider.max;
        const thumbOffset = percent * volumeSlider.offsetWidth;

        // تنظیم tooltip در محل مناسب روی thumb
        sliderTooltip.style.left = `${thumbOffset}px`;

        // تغییر رنگ پس‌زمینه‌ی اسلایدر
        volumeSlider.style.background = `linear-gradient(to right, #6c5ce7 ${value}%, #ccc ${value}%)`;
    }

// نمایش tooltip هنگام hover یا drag
    volumeSlider.addEventListener('input', () => {
        updateSlider();
        sliderTooltip.style.opacity = 1;
        sliderTooltip.style.top = '-35px';
    });

    volumeSlider.addEventListener('mouseenter', () => {
        sliderTooltip.style.opacity = 1;
        updateSlider();
    });

    volumeSlider.addEventListener('mouseleave', () => {
        sliderTooltip.style.opacity = 0;
    });






});



document.addEventListener("DOMContentLoaded", function () {
    const openBtn = document.querySelector(".header__setting");
    const settingsPanel = document.querySelector(".settings");

    // باز کردن پنل تنظیمات با کلاس active
    openBtn.addEventListener("click", function () {
        settingsPanel.style.display = "block"; // ابتدا نمایش بده که transition کار کنه

        // کمی تأخیر برای اعمال transition
        setTimeout(() => {
            settingsPanel.classList.add("active");
        }, 10);
    });

    // بستن تنظیمات با حذف کلاس و بعد از transition، مخفی‌سازی
    settingsPanel.addEventListener("click", function (e) {
        if (e.target.closest(".settings__close")) {
            settingsPanel.classList.remove("active");

            // بعد از انیمیشن، display رو none کن
            setTimeout(() => {
                settingsPanel.style.display = "none";
            }, 300); // مدت زمان transition در CSS
        }
    });
});

