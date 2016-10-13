;(function(window, document, undefined) {
    'use strict';

    if ('Clock' in window) return false;

    window.Clock = function(canvas) {
        var self = this;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.width = canvas.width;
        this.height = canvas.height;

        this.radius = 190;

        var devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
                                this.context.mozBackingStorePixelRatio ||
                                this.context.msBackingStorePixelRatio ||
                                this.context.oBackingStorePixelRatio ||
                                this.context.backingStorePixelRatio || 1,

            ratio = devicePixelRatio / backingStoreRatio;

        /* upscale the canvas if the two ratios don't match */
        if (devicePixelRatio !== backingStoreRatio) {

            this.canvas.width  = ratio * canvas.width;
            this.canvas.height = ratio * canvas.height;

            /* now scale the context to counter the fact that
            we've manually scaled our canvas element */
            this.context.scale(ratio, ratio);
        }


        this.update = function(seconds) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Outer Dial
            this.context.beginPath();
            this.context.arc(this.width / 2, this.height / 2, this.radius, 0, Math.PI * 2);
            this.context.strokeStyle = '#92949C';
            this.context.stroke();

            // Inner Dial
            this.context.beginPath();
            this.context.arc(this.width / 2, this.height / 2, this.radius - 5, 0, Math.PI * 2);
            this.context.strokeStyle = '#929BAC';
            this.context.stroke();

            // Center Point
            this.context.beginPath();
            this.context.arc(this.width / 2, this.height / 2, 2, 0, Math.PI * 2);
            this.context.fillStyle = '#353535';
            this.context.strokeStyle = '#0C3D4A';
            this.context.stroke();


            markMinutes();
            markSeconds();
            secondHand(seconds);
        };


        function markMinutes() {
            var INTERVAL = 5;
            var radius = (self.radius - 10);

            var radianInterval = (2 * Math.PI) / INTERVAL;
            var radianOffset = -90 * (Math.PI / 180);

            self.context.lineWidth = 2;

            for (var i = 0; i < INTERVAL; i++) {
                var radian = radianInterval * i + radianOffset;

                var x1 = (self.width / 2)  + Math.cos(radian) * (radius);
                var y1 = (self.height / 2) + Math.sin(radian) * (radius);

                var x2 = (self.width / 2)  + Math.cos(radian) * (radius - radius / 10);
                var y2 = (self.height / 2) + Math.sin(radian) * (radius - radius / 10);

                self.context.moveTo(x1, y1);
                self.context.lineTo(x2, y2);

                self.context.stroke();
            }
        }


        function markSeconds() {
            var INTERVAL = 60;
            var radius = (self.radius - 10);

            var radianInterval = (2 * Math.PI) / INTERVAL;
            var radianOffset = -90 * (Math.PI / 180);

            self.context.lineWidth = 1;

            for (var i = 0; i < INTERVAL; i++) {
                var radian = radianInterval * (i - 0) + radianOffset;

                var x1 = (self.width / 2)  + Math.cos(radian) * radius;
                var y1 = (self.height / 2) + Math.sin(radian) * radius;

                var x2 = (self.width / 2)  + Math.cos(radian) * (radius - radius / 20);
                var y2 = (self.height / 2) + Math.sin(radian) * (radius - radius / 20);

                self.context.moveTo(x1, y1);
                self.context.lineTo(x2, y2);

                self.context.stroke();
            }
        }


        function secondHand(seconds) {

            var radius = (self.radius - 30);
            var radian = (Math.PI * 2) * (seconds / (60 * 5)) - (Math.PI * 2 / 4);

            self.context.lineWidth = 1;

            self.context.beginPath();

            self.context.moveTo(
                self.width / 2  - Math.cos(radian) * 20,
                self.height / 2 - Math.sin(radian) * 20);

            self.context.lineTo(
                self.width / 2  + Math.cos(radian) * radius,
                self.height / 2 + Math.sin(radian) * radius);

            self.context.strokeStyle = '#586A73';
            self.context.stroke();
        }
    };
})(this, this.document);

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

    var canvas = document.getElementById('canvas');
    var clock = new Clock(canvas);

    var stopBtn = document.getElementById('stop');
    var syncBtn = document.getElementById('sync');
    var timeTxt = document.getElementById('time');

    function setTime() {
        var date = new Date();
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        timeTxt.innerHTML = h+':'+m+':'+s;
    }


    var seconds = 0;
    var w = new Worker('worker.js');
    w.addEventListener('message', function(e) {
        seconds ++;

        if (seconds > 60*5) {
            seconds = 1;
            createNotification();
        }

        clock.update(seconds);
    });

    stopBtn.addEventListener('click', function() {
        w.postMessage('stop');
    });

    syncBtn.addEventListener('click', function() {
        w.postMessage('start');
        seconds = 1;
        setTime();
    });



    w.postMessage('start');
    setTime();

})(this, this.document);
