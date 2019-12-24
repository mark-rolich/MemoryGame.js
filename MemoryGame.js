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

    for (temp, j, i = this.length; i;) {
        j = parseInt(Math.random() * i);
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

var Level = function (evt, size, matches, category, list) {
    "use strict";

    var playfieldWrapper = document.getElementById('playfield-wrapper'),
        playfield = document.createElement('div'),
        cards = [],
        mouseHndl = null,
        self = this,
        clicksCnt = 0,
        matchCount = 0,
        openCards = [],
        Card = function (image, video, pair) {
            this.state = 0;
            this.freezed = 0;
            this.image = image;
            this.video = video;
            this.pair = pair;
            this.clicksCnt = 0;
            this.content = null;

            var flipper = null,
                front = null,
                back = null,
                clicks = null;

            this.draw = function (idx, container) {
                var card = document.createElement('div'),
                    content = null;

                flipper = card.cloneNode(false);
                if (this.image != null) {
                    content = document.createElement('img');
                    content.src = this.image;
                } else if (this.video != null) {
                    content = document.createElement('video');
                    let source = document.createElement('source');
                    source.src = this.video;
                    content.muted = true;
                    content.preload = true;
                    content.onclick = () => {
                        if (content.ended) {
                            content.pause();
                            content.currentTime = 0;
                            content.play();
                        }
                    };
                    content.appendChild(source);
                }

                front = card.cloneNode(false);
                back = card.cloneNode(false);
                clicks = card.cloneNode(false);

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
        prepare = function () {
            for (let i = 0; i < (size) / matches; i = i + 1) {
                cards.push(new Card(`assets/${category}/images/${list[i].image}`, null, i));
                cards.push(new Card(null, `assets/${category}/videos/${list[i].video}`, i));
            }

            cards.shuffle();
        },
        draw = function () {
            let k = 0;
            prepare();

            for (let i = 0; i < (size); i = i + 1) {
                cards[i].draw(k, playfield);
                k++;
            }
            playfieldWrapper.replaceChild(playfield, playfieldWrapper.childNodes[0]);
        },
        play = function (e, src) {
            var isFace = (src.className.indexOf('face') !== -1),
                isFlipper = (src.className === 'flipper'),
                card = null,
                i = 0,
                backFlipTimer = null;

            if (isFace || isFlipper) {
                if (isFace) {
                    src = src.parentNode;
                }

                card = cards[src.getAttribute('idx')];

                if (card.freezed === 1) {
                    return;
                }

                if (card.video != null) {
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

                        let cardMultiplier = card.video != null ? 4 : 1;
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

                if (matchCount === (size) / matches) {
                    playfieldWrapper.className = 'win';

                    window.setTimeout(function () {
                        playfield.className = 'play-field win';
                        self.onwin(clicksCnt, Math.round(((size) * 100) / clicksCnt));
                        playfieldWrapper.className = '';
                    }, 1500);

                }
            }
        };

    if ((size) / matches > list.length) { // only necessary, because we only have 38 cards :'(
        throw ('There are not enough cards to display the playing field');
    } else if ((size) % matches !== 0) {
        throw ('Out of bounds');
    }

    playfieldWrapper.className = '';
    playfield.className = 'play-field';

    list.shuffle();

    this.onwin = function () {
    };

    draw();

    mouseHndl = evt.attach('mousedown', playfield, play);
};

// Possible lists
var lists = {
    'animals': [
        {'image': 'bird.png', 'video': 'bird.mp4'},
        {'image': 'butterfly.png', 'video': 'butterfly.mp4'},
        {'image': 'cat.png', 'video': 'cat.mp4'},
        {'image': 'cow.png', 'video': 'cow.mp4'},
        {'image': 'crocodile.png', 'video': 'crocodile.mp4'},
        {'image': 'dog.png', 'video': 'dog.mp4'},
        {'image': 'donkey.png', 'video': 'donkey.mp4'},
        {'image': 'elephant.png', 'video': 'elephant.mp4'},
        {'image': 'frog.png', 'video': 'frog.mp4'},
        {'image': 'giraffe.png', 'video': 'giraffe.mp4'},
        {'image': 'goat.png', 'video': 'goat.mp4'},
        {'image': 'horse.png', 'video': 'horse.mp4'},
        {'image': 'lion.png', 'video': 'lion.mp4'},
        {'image': 'monkey.png', 'video': 'monkey.mp4'},
        {'image': 'mouse.png', 'video': 'mouse.mp4'},
        {'image': 'pig.png', 'video': 'pig.mp4'},
        {'image': 'rabbit.png', 'video': 'rabbit.mp4'},
        {'image': 'sheep.png', 'video': 'sheep.mp4'},
        {'image': 'snake.png', 'video': 'snake.mp4'},
        {'image': 'spider.png', 'video': 'spider.mp4'}
    ],
    'it': [
        {'image': 'bird.png', 'video': 'bird.mp4'},
        {'image': 'butterfly.png', 'video': 'butterfly.mp4'}
    ]
};


class MemoryGame {
    constructor(evt) {
        this.evt = evt
        this.lvlNum = 0
        this.info = document.getElementById('game-info')
        this.levelCtrls = document.getElementById('levels')
        this.categoryCtrls = document.getElementById('categories')
        this.currentLvl = null
        this.levelCategory = 'animals'
        this.levelSize = 40

        this.start();
    }

    start() {
        var matches = 2
        this.currentLvl = new Level(evt, this.levelSize, matches, this.levelCategory, lists[this.levelCategory]);
        this.currentLvl.onwin = function (clicks, prc) {
            this.info.innerHTML = 'Du hast alle Paare mit nur <strong>' + clicks + '</strong> Klicks gefunden.' +
                ' Das entspricht einer Effizienz von <strong>' + prc + '%</strong>';
        }.bind(this);

        this.info.innerHTML = 'Klicke die Karten an, um <strong>' + matches + 'er</strong> Paare aufzudecken.';
    }

    updateSize(newSize, element) {
        for (let i = 0; i < this.levelCtrls.children.length; i++) {
            this.levelCtrls.children[i].className = ''
        }
        element.parentElement.className = 'selected'
        this.levelSize = newSize;
        this.start()
    }

    updateCategory(newCategory, element) {
        for (let i = 0; i < this.categoryCtrls.children.length; i++) {
            this.categoryCtrls.children[i].className = ''
        }
        element.parentElement.className = 'selected'
        this.levelCategory = newCategory;
        this.start()
    };
};
