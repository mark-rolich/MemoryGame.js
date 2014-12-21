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

    var cardsList           = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVW[\\]^_`abcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜ',
        playfieldWrapper    = document.getElementById('playfield-wrapper'),
        playfield           = document.createElement('table'),
        cards               = [],
        mouseHndl           = null,
        self                = this,
        clicksCnt           = 0,
        matchCount          = 0,
        openCards           = [],
        Card                = function (text, pair) {
            this.state      = 0;
            this.freezed    = 0;
            this.text       = text;
            this.pair       = pair;
            this.clicksCnt     = 0;

            var flipper = null,
                front   = null,
                back    = null,
                clicks  = null;

            this.draw = function (idx, container) {
                var card    = document.createElement('div'),
                    txt     = document.createTextNode(this.text);

                flipper = card.cloneNode(false);

                front   = card.cloneNode(false);
                back    = card.cloneNode(false);
                clicks  = card.cloneNode(false);

                card.className = 'card';
                flipper.className = 'flipper';
                front.className = 'front face icon';
                back.className = 'back face';
                clicks.className = 'clicks';
                clicks.appendChild(document.createTextNode('\xA0'));

                front.appendChild(txt);
                front.appendChild(clicks);

                txt = txt.cloneNode(false);
                txt.nodeValue = '\xA0';

                back.appendChild(txt);

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
            var i = 0,
                j = 0;

            for (i = 0; i < (rows * cols) / matches; i = i + 1) {
                for (j = 0; j < matches; j = j + 1) {
                    cards.push(new Card(cardsList[i], i));
                }
            }

            cards.shuffle();
        },
        draw                = function () {
            var tbody       = document.createElement('tbody'),
                row         = document.createElement('tr'),
                cell        = document.createElement('td'),
                rowFrag     = document.createDocumentFragment(),
                cellFrag    = document.createDocumentFragment(),
                i           = 0,
                j           = 0,
                k           = 0;

            prepare();

            for (i = 0; i < rows; i = i + 1) {
                row = row.cloneNode(false);

                for (j = 0; j < cols; j = j + 1) {
                    cell = cell.cloneNode(false);

                    cards[k].draw(k, cell);
                    cellFrag.appendChild(cell);

                    k = k + 1;
                }

                row.appendChild(cellFrag);
                rowFrag.appendChild(row);
            }

            tbody.appendChild(rowFrag);
            playfield.appendChild(tbody);
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

                if (openCards.length === 0) {
                    openCards.push(card);
                } else if (!openCards.in_array(card) && openCards.length < matches) {
                    if (openCards[openCards.length - 1].pair === card.pair) {
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

                        backFlipTimer = window.setTimeout(function () {
                            card.flip(1);

                            for (i = 0; i < openCards.length; i = i + 1) {
                                openCards[i].flip(1);
                            }

                            openCards = [];
                            mouseHndl = evt.attach('mousedown', playfield, play);
                        }, 300);

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

    if ((rows * cols) / matches > cardsList.length) {
        throw ('There are not enough cards to display the playing field');
    } else if ((rows * cols) % matches !== 0) {
        throw ('Out of bounds');
    }

    playfieldWrapper.className = '';
    playfield.className = 'play-field';

    cardsList = cardsList.split('');
    cardsList.shuffle();

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
            {'rows': 3, 'cols': 4, 'matches': 2},
            {'rows': 4, 'cols': 4, 'matches': 2},
            {'rows': 4, 'cols': 5, 'matches': 2},
            {'rows': 3, 'cols': 4, 'matches': 3},
            {'rows': 3, 'cols': 5, 'matches': 3},
            {'rows': 3, 'cols': 6, 'matches': 3},
            {'rows': 4, 'cols': 4, 'matches': 4},
            {'rows': 4, 'cols': 5, 'matches': 4},
            {'rows': 4, 'cols': 6, 'matches': 4},
            {'rows': 5, 'cols': 6, 'matches': 5}
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