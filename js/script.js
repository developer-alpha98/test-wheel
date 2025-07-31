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


});
