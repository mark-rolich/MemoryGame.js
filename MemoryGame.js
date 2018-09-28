/**
* Javascript implementation of "Memory Game"
* (http://en.wikipedia.org/wiki/Concentration_(game))
*
* Uses css3 transitions and transfomations so works in the modern browsers.
* Currently tested in:
*
* Chrome 24
* Firefox 18
* Safari 5.1.1
*
* MemoryGame.js requires Event.js package, which can be acquired at the following links:
* Github - https://github.com/mark-rolich/Event.js
* JS Classes - http://www.jsclasses.org/package/212-JavaScript-Handle-events-in-a-browser-independent-manner.html
*
* @author Mark Rolich <mark.rolich@gmail.com>
*/
Array.prototype.shuffle = function () {
    var temp, j, i;

    for (temp, j, i = this.length; i; ) {
        j = parseInt(Math.random () * i);
        temp = this[--i];
        this[i] = this[j];
        this[j] = temp;
    }
};

Array.prototype.in_array = function (value) {
    var i, result = false;

    for (i = 0; i < this.length; i = i + 1) {
        if (this[i] === value) {
            result = true;
        }
    }

    return result;
};

var Level = function (evt, rows, cols, matches) {
    "use strict";

    var animalList           = ['bird', 'butterfly', 'cat', 'cow', 'crocodile', 'dog', 'donkey', 'elephant', 'frog', 'giraffe', 'goat', 'horse', 'lion', 'monkey', 'mouse', 'rabbit', 'sheep', 'snake', 'spider'],
        playfieldWrapper    = document.getElementById('playfield-wrapper'),
        playfield           = document.createElement('div'),
        cards               = [],
        mouseHndl           = null,
        self                = this,
        clicksCnt           = 0,
        matchCount          = 0,
        openCards           = [],
        Card                = function (image, video, pair) {
            this.state      = 0;
            this.freezed    = 0;
            this.image      = image;
            this.video      = video;
            this.pair       = pair;
            this.clicksCnt  = 0;
            this.content = null;

            var flipper = null,
                front   = null,
                back    = null,
                clicks  = null;

            this.draw = function (idx, container) {
                var card    = document.createElement('div'),
                    content = null;

                flipper = card.cloneNode(false);
                if (this.image != null){
                    content = document.createElement('img');
                    content.src = this.image;
                } else if (this.video != null){
                    content = document.createElement('video');
                    let source = document.createElement('source');
                    source.src = this.video;
                    content.muted=true;
                    content.preload=true;
                    content.onclick= () => {
                        if(content.ended) {
                            content.pause();
                            content.currentTime = 0;
                            content.play();
                        }
                    };
                    content.appendChild(source);
                }

                front   = card.cloneNode(false);
                back    = card.cloneNode(false);
                clicks  = card.cloneNode(false);

                card.className = 'card';
                flipper.className = 'flipper';
                front.className = 'front face icon';
                back.className = 'back face';
                clicks.className = 'clicks';
                clicks.appendChild(document.createTextNode('\xA0'));

                front.appendChild(content);
                front.appendChild(clicks);

                this.content = content;
                // content = content.cloneNode(false);
                // content.nodeValue = '\xA0';
                // back.appendChild(txt);

                flipper.appendChild(back);
                flipper.appendChild(front);

                flipper.setAttribute('idx', idx);

                card.appendChild(flipper);
                container.appendChild(card);
            };

            this.flip = function (state) {
                if (state === 0) {
                    flipper.className = 'flipper flipfront';
                    front.style.opacity = 1;
                    back.style.opacity = 0;

                    this.state = 1;
                    this.clicksCnt = this.clicksCnt + 1;

                    clicks.childNodes[0].nodeValue = this.clicksCnt;

                    clicksCnt = clicksCnt + 1;
                } else if (state === 1) {
                    flipper.className = 'flipper flipback';
                    front.style.opacity = 0;
                    back.style.opacity = 1;
                    this.state = 0;
                }
            };

            this.pulse = function () {
                var pulseTimer = null;

                flipper.className = 'flipper flipfront pulse';

                pulseTimer = window.setTimeout(function () {
                    flipper.parentNode.style.opacity = '0.3';
                }, 1000);

                pulseTimer = null;
            };
        },
        prepare             = function () {
            for (let i = 0; i< (rows * cols)/matches; i = i + 1){
                cards.push(new Card(`assets/images/${animalList[i]}.svg`,null, i));
                cards.push(new Card(null, `assets/videos/${animalList[i]}.mp4`, i));
            }

            cards.shuffle();
        },
        draw                = function () {
            let k           = 0;
            prepare();

            for (let i = 0; i< (rows*cols); i= i+1) {
                cards[i].draw(k, playfield);
                k++;
            }
            playfieldWrapper.replaceChild(playfield, playfieldWrapper.childNodes[0]);
        },
        play                = function (e, src) {
            var isFace      = (src.className.indexOf('face') !== -1),
                isFlipper   = (src.className === 'flipper'),
                card        = null,
                i           = 0,
                backFlipTimer = null;

            if (isFace || isFlipper) {
                if (isFace) {
                    src = src.parentNode;
                }

                card = cards[src.getAttribute('idx')];

                if (card.freezed === 1) {
                    return;
                }

                if (card.video != null){
                    card.content.currentTime = 1;
                    card.content.play();
                }

                if (openCards.length === 0) {
                    openCards.push(card);
                } else if (!openCards.in_array(card) && openCards.length < matches) {
                    if (openCards[0].pair === card.pair) {
                        openCards.push(card);

                        if (openCards.length === matches) {
                            card.flip(0);

                            for (i = 0; i < openCards.length; i = i + 1) {
                                openCards[i].freezed = 1;
                                openCards[i].pulse();
                            }

                            matchCount = matchCount + 1;

                            openCards = [];
                        }
                    } else {
                        evt.detach('mousedown', playfield, mouseHndl);

                        let cardMultiplier = card.video!=null?4:1;
                        backFlipTimer = window.setTimeout(function () {
                            card.flip(1);

                            for (i = 0; i < openCards.length; i = i + 1) {
                                openCards[i].flip(1);
                            }

                            openCards = [];
                            mouseHndl = evt.attach('mousedown', playfield, play);
                        }, cardMultiplier * 1000);

                        backFlipTimer = null;
                    }
                }

                if (card.state === 0) {
                    card.flip(0);
                }

                if (matchCount === (rows * cols) / matches) {
                    playfieldWrapper.className = 'win';

                    window.setTimeout(function () {
                        playfield.className = 'play-field win';
                        self.onwin(clicksCnt, Math.round(((rows * cols) * 100) / clicksCnt));
                        playfieldWrapper.className = '';
                    }, 1500);

                }
            }
        };

    if ((rows * cols) / matches > animalList.length + 2) { // only necessary, because we only have 38 cards :'(
        throw ('There are not enough cards to display the playing field');
    } else if ((rows * cols) % matches !== 0) {
        throw ('Out of bounds');
    }

    playfieldWrapper.className = '';
    playfield.className = 'play-field';

    animalList.shuffle();

    this.onwin = function () {};

    draw();

    mouseHndl = evt.attach('mousedown', playfield, play);
};

var MemoryGame = function (evt) {
    "use strict";
    var lvlNum      = 0,
        info        = document.getElementById('game-info'),
        lvlCtrls    = document.getElementById('levels'),
        lvls        = [
            {'rows': 5, 'cols': 8, 'matches': 2},
            {'rows': 2, 'cols': 2, 'matches': 2},
            {'rows': 2, 'cols': 3, 'matches': 2},
            {'rows': 2, 'cols': 4, 'matches': 2},
            {'rows': 3, 'cols': 4, 'matches': 2},
            {'rows': 4, 'cols': 4, 'matches': 2},
            {'rows': 4, 'cols': 5, 'matches': 2},
            {'rows': 4, 'cols': 6, 'matches': 2},
            {'rows': 5, 'cols': 6, 'matches': 2},
            {'rows': 6, 'cols': 6, 'matches': 2},
        ],
        lastBtn     = lvlCtrls.childNodes[1],
        btn         = null,
        lvl         = lvls[lvlNum],
        currentLvl  = null,
        start       = function () {
            currentLvl = new Level(evt, lvl.rows, lvl.cols, lvl.matches);
            currentLvl.onwin = function (clicks, prc) {
                info.innerHTML = 'You\'ve found all matches in <strong>' + clicks + '</strong> clicks with <strong>' + prc + '%</strong> efficiency';
            };

            info.innerHTML = 'Click the cards to reveal <strong>' + lvl.matches + '</strong> matches';
        };

    start();

    evt.attach('mousedown', lvlCtrls, function (e, src) {
        if (src.tagName === 'A') {
            btn = src.parentNode;

            lastBtn.className = '';
            btn.className = 'selected';

            lastBtn = btn;

            lvlNum = src.getAttribute('level');
            lvl = lvls[lvlNum];
            start();
        }
    });
};