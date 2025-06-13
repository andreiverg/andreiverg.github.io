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