document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-section form');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message
                submitButton.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
                submitButton.classList.add('success');
                form.reset();

                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    submitButton.classList.remove('success');
                }, 3000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Show error message
            submitButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to Send';
            submitButton.classList.add('error');

            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                submitButton.classList.remove('error');
            }, 3000);
        }
    });
});

// --- Design Gallery Video Modal ---
document.addEventListener('DOMContentLoaded', function () {
  const galleryVideos = document.querySelectorAll('.gallery-item .gallery-video');
  const modalContainer = document.getElementById('video-modal-container');
  const modalVideo = document.getElementById('modal-video');
  const closeModalBtn = document.querySelector('.video-modal .close-modal');

  if (galleryVideos.length && modalContainer && modalVideo && closeModalBtn) {
    galleryVideos.forEach(video => {
      video.parentElement.addEventListener('click', function () {
        modalVideo.src = video.currentSrc || video.src;
        modalVideo.poster = video.poster;
        modalContainer.classList.add('active');
        modalVideo.currentTime = 0;
        modalVideo.play();
      });
    });

    closeModalBtn.addEventListener('click', function () {
      modalContainer.classList.remove('active');
      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.src = '';
    });

    // Close modal on background click
    modalContainer.addEventListener('click', function (e) {
      if (e.target === modalContainer) {
        modalContainer.classList.remove('active');
        modalVideo.pause();
        modalVideo.currentTime = 0;
        modalVideo.src = '';
      }
    });
  }
});

// --- Design Gallery YouTube Modal ---
document.addEventListener('DOMContentLoaded', function () {
  const galleryItems = document.querySelectorAll('.gallery-item[data-youtube]');
  const modalContainer = document.getElementById('video-modal-container');
  const modalIframe = document.getElementById('modal-iframe');
  const closeModalBtn = document.querySelector('.video-modal .close-modal');

  if (galleryItems.length && modalContainer && modalIframe && closeModalBtn) {
    galleryItems.forEach(item => {
      item.addEventListener('click', function () {
        const youtubeUrl = item.getAttribute('data-youtube');
        // Add autoplay param
        const urlWithAutoplay = youtubeUrl.includes('?') ? youtubeUrl + '&autoplay=1' : youtubeUrl + '?autoplay=1';
        modalIframe.src = urlWithAutoplay;
        modalContainer.classList.add('active');
      });
    });

    closeModalBtn.addEventListener('click', function () {
      modalContainer.classList.remove('active');
      modalIframe.src = '';
    });

    // Close modal on background click
    modalContainer.addEventListener('click', function (e) {
      if (e.target === modalContainer) {
        modalContainer.classList.remove('active');
        modalIframe.src = '';
      }
    });
  }
});

// --- Instagram-style Photo Slider ---
document.addEventListener('DOMContentLoaded', function () {
  const sliderImages = [
    'images/brianverg_1574403727_2182579112387130946_1633074026.jpg',
    'images/brianverg_1558596791_2049980925078308329_1633074026.jpg',
    'images/brianverg_1558596791_2049980925069948396_1633074026 (1).jpg'
  ];
  const sliderPanel = document.querySelector('.gallery-slider-panel');
  if (!sliderPanel) return;
  const sliderImg = sliderPanel.querySelector('.slider-image');
  const leftBtn = sliderPanel.querySelector('.slider-arrow-left');
  const rightBtn = sliderPanel.querySelector('.slider-arrow-right');
  const dots = sliderPanel.querySelectorAll('.slider-dot');
  let current = 0;

  function showSlide(idx) {
    if (idx < 0) idx = sliderImages.length - 1;
    if (idx >= sliderImages.length) idx = 0;
    sliderImg.src = sliderImages[idx];
    dots.forEach(dot => dot.classList.remove('active'));
    dots[idx].classList.add('active');
    current = idx;
  }

  leftBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    showSlide(current - 1);
  });
  rightBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    showSlide(current + 1);
  });
  dots.forEach(dot => {
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      showSlide(Number(dot.dataset.index));
    });
  });

  // Optional: swipe support for mobile
  let startX = null;
  sliderImg.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  });
  sliderImg.addEventListener('touchend', function(e) {
    if (startX === null) return;
    let endX = e.changedTouches[0].clientX;
    if (endX - startX > 40) showSlide(current - 1);
    else if (startX - endX > 40) showSlide(current + 1);
    startX = null;
  });

  showSlide(0);
});

// --- Brianverg Single Photo Modals ---
document.addEventListener('DOMContentLoaded', function () {
  const photoTriggers = document.querySelectorAll('.gallery-photo');
  photoTriggers.forEach(trigger => {
    trigger.addEventListener('click', function () {
      const idx = trigger.getAttribute('data-photo');
      const modal = document.getElementById(`photo-modal-${idx}`);
      if (modal) modal.classList.add('active');
    });
  });
  [0,1,2].forEach(idx => {
    const modal = document.getElementById(`photo-modal-${idx}`);
    if (!modal) return;
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function () {
      modal.classList.remove('active');
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}); 