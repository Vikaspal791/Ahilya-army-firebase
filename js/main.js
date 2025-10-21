document.addEventListener('DOMContentLoaded', () => {

    // Image Slider
    const slides = document.querySelector('.slides');
    if (slides) {
        const slide = document.querySelectorAll('.slide');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        let currentIndex = 0;
        const slideCount = slide.length;

        function showSlide(index) {
            if (index < 0) {
                currentIndex = slideCount - 1;
            } else if (index >= slideCount) {
                currentIndex = 0;
            }
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex++;
                showSlide(currentIndex);
            });

            prevBtn.addEventListener('click', () => {
                currentIndex--;
                showSlide(currentIndex);
            });
        }

        // Auto-slide
        setInterval(() => {
            currentIndex++;
            showSlide(currentIndex);
        }, 5000); // Change slide every 5 seconds
    }

    // Hamburger Menu
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-active');
        });
    }
});
