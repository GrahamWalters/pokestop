;(function(window, document, undefined) {
    'use strict';

    var APP_TITLE = 'Pokestop Reminder';

    var audio = new Audio('notification.mp3');

    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications.');
        return false;
    }

    else if (Notification.permission === 'default') {
        Notification.requestPermission(function (permission) {
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }
        });
    }

    function createNotification() {
        if (Notification.permission === 'granted') {
            var notification = new Notification(APP_TITLE, {
                body: 'Time to spin!',
                icon: 'Pokeball.png'
            });

            setTimeout(notification.close.bind(notification), 3000);

            if ('vibrate' in window.navigator) {
                window.navigator.vibrate(500);
            }

            audio.play();
        }
    }


    var seconds = 0;
    var w = new Worker('worker.js');
    w.addEventListener('message', function(e) {
        seconds ++;

        if (seconds > 60*5) {
            seconds = 1;
            createNotification();
        }
    });

    w.postMessage('start');

})(this, this.document);
