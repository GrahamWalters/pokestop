var interval = null;
self.addEventListener('message', function(e) {
    switch (e.data) {
        case 'start': {
            if (interval === null) {
                interval = setInterval(function() {
                    self.postMessage('tick');
                }, 1000);
            }
        } break;
        case 'stop': {
            clearInterval(interval);
            interval = null;
        } break;
    }
}, false);
