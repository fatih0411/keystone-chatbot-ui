(function() {
    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.src = 'https://fatih0411.github.io/keystone-chatbot-ui/';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '400px';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '10px';
    iframe.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    iframe.style.zIndex = '999999';
    
    // Add iframe to page
    document.body.appendChild(iframe);
    
    // Add message listener for iframe communication
    window.addEventListener('message', function(event) {
        // Verify origin
        if (event.origin !== 'https://fatih0411.github.io') return;
        
        // Handle messages from iframe
        if (event.data.type === 'resize') {
            iframe.style.height = event.data.height + 'px';
        }
    });
})();
