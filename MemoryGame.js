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
"use strict";

Array.prototype.shuffle = function () {
    let temp, j, i;

    for (i = this.length; i;) {
        j = Math.floor(Math.random() * i);
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

class Level {
    constructor(evt, size, matches, category, list) {
        this.clicksCnt = 0;
        this.matchCount = 0;
        this.openCards = [];
        this.matches = matches;
        this.size = size;
        this.playfield = document.createElement('div');
        this.playfieldWrapper = document.getElementById('playfield-wrapper');
        this.mouseHndl = evt.attach('mousedown', this.playfield, this.play.bind(this));

        if (this.size / this.matches > list.length) { // only necessary, because we only have 38 cards :'(
            throw ('There are not enough cards to display the playing field');
        } else if (this.size % this.matches !== 0) {
            throw (`The number of cards ${this.size} cannot contain only matches of ${matches} cards.`);
        }

        this.playfieldWrapper.className = '';
        this.playfield.className = 'play-field';

        list.shuffle();

        this.onwin = () => true; // to be overwritten by the Game

        this.draw(list, category);

    }

    prepare(cardSet, category) {
        const cards = [];
        for (let i = 0; i < this.size / this.matches; i = i + 1) {
            cardSet[i].image
                ? cards.push(new Card(`assets/${category}/images/${cardSet[i].image}`, null, null, i, () => this.clicksCnt++))
                : cards.push(new Card(null, `${cardSet[i].text}`, null, i, () => this.clicksCnt++));
            cardSet[i].video
                ? cards.push(new Card(null, null, `assets/${category}/videos/${cardSet[i].video}`, i, () => this.clicksCnt++))
                : cards.push(new Card(null, `${cardSet[i].text}`, null, i, () => this.clicksCnt));
        }
        cards.shuffle();

        return cards;
    }

    draw(cardSet, category) {
        this.cards = this.prepare(cardSet, category);

        let k = 0;
        for (let i = 0; i < (this.cards.length); i = i + 1) {
            this.cards[i].draw(k, this.playfield);
            k++;
        }
        this.playfieldWrapper.replaceChild(this.playfield, this.playfieldWrapper.childNodes[0]);
    }

    play(e, src) {
        let isFace = (src.className.indexOf('face') !== -1),
            isFlipper = (src.className === 'flipper'),
            card = null,
            i = 0;

        if (isFace || isFlipper) {
            if (isFace) {
                src = src.parentNode;
            }

            card = this.cards[src.getAttribute('idx')];

            if (card.freezed === 1) {
                return;
            }

            if (card.video != null) {
                card.content.currentTime = 1;
                card.content.play();
            }

            if (this.openCards.length === 0) {
                this.openCards.push(card);
            } else if (!this.openCards.in_array(card) && this.openCards.length < this.matches) {
                if (this.openCards[0].pair === card.pair) {
                    this.openCards.push(card);

                    if (this.openCards.length === this.matches) {
                        card.flip(0);

                        for (i = 0; i < this.openCards.length; i = i + 1) {
                            this.openCards[i].freezed = 1;
                            this.openCards[i].pulse();
                        }

                        this.matchCount++;

                        this.openCards = [];
                    }
                } else {
                    evt.detach('mousedown', this.playfield, this.mouseHndl);
                    let cardMultiplier = card.video != null ? 4 : 1;
                    window.setTimeout(() => {
                        card.flip(1);
                        for (let i = 0; i < this.openCards.length; i++) {
                            this.openCards[i].flip(1);
                        }

                        this.openCards = [];
                        this.mouseHndl = evt.attach('mousedown', this.playfield, this.play.bind(this));
                    }, cardMultiplier * 1000);
                }
            }

            if (card.state === 0) {
                card.flip(0);
            }

            if (this.matchCount === this.size / this.matches) {
                this.playfieldWrapper.className = 'win';

                window.setTimeout(() => {
                    this.playfield.className = 'play-field win';
                    this.onwin(this.clicksCnt, Math.round(this.size * 100 / this.clicksCnt));
                    this.playfieldWrapper.className = '';
                }, 1500);
            }
        }
    }
}

// Possible lists
let lists = {
    'Tiere': [
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
        {'image': 'pig.png', 'text': 'Schwein'},
        {'image': 'rabbit.png', 'video': 'rabbit.mp4'},
        {'image': 'sheep.png', 'video': 'sheep.mp4'},
        {'image': 'snake.png', 'video': 'snake.mp4'},
        {'image': 'spider.png', 'video': 'spider.mp4'}
    ],
    'Alphabet': [
        {'image': 'a.png', 'video': 'a.mp4'},
        {'image': 'b.png', 'video': 'b.mp4'},
        {'image': 'c.png', 'video': 'c.mp4'},
        {'image': 'd.png', 'video': 'd.mp4'},
        {'image': 'e.png', 'video': 'e.mp4'},
        {'image': 'f.png', 'video': 'f.mp4'},
        {'image': 'g.png', 'video': 'g.mp4'},
        {'image': 'h.png', 'video': 'h.mp4'},
        {'image': 'i.png', 'video': 'i.mp4'},
        {'image': 'j.png', 'video': 'j.mp4'},
        {'image': 'k.png', 'video': 'k.mp4'},
        {'image': 'l.png', 'video': 'l.mp4'},
        {'image': 'm.png', 'video': 'm.mp4'},
        {'image': 'n.png', 'video': 'n.mp4'},
        {'image': 'o.png', 'video': 'o.mp4'},
        {'image': 'p.png', 'video': 'p.mp4'},
        {'image': 'q.png', 'video': 'q.mp4'},
        {'image': 'r.png', 'video': 'r.mp4'},
        {'image': 's.png', 'video': 's.mp4'},
        {'image': 't.png', 'video': 't.mp4'},
        {'image': 'u.png', 'video': 'u.mp4'},
        {'image': 'v.png', 'video': 'v.mp4'},
        {'image': 'w.png', 'video': 'w.mp4'},
        {'image': 'x.png', 'video': 'x.mp4'},
        {'image': 'y.png', 'video': 'y.mp4'},
        {'image': 'z.png', 'video': 'z.mp4'}
    ],
    'IT': [
        {'text': 'Javascript'},
        {'text': 'Scala'}
    ]
};

class Card {
    constructor(image, text, video, pair, clickCallBack) {
        this.image = image;
        this.text = text;
        this.video = video;
        this.pair = pair;

        this.state = 0;
        this.freezed = 0;
        this.clicksCnt = 0;
        this.updateGlobalClick = clickCallBack;

        this.content = null;
        this.front = null;
        this.back = null;
        this.flipper = null;
    }

    createCardDiv(idx) {
        let content = this.content;
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
        } else if (this.text != null) {
            content = document.createElement('div');
            content.innerHTML = this.text;
            content.className = 'cardText';
        }
        this.content = content;

        const back = document.createElement('div');
        back.className = 'back face';
        this.back = back;

        const clicks = document.createElement('div');
        clicks.className = 'clicks';
        clicks.appendChild(document.createTextNode('\xA0'));

        const front = document.createElement('div');
        front.className = 'front face icon';
        front.appendChild(this.content);
        front.appendChild(clicks);
        this.front = front;

        const flipper = document.createElement('div');
        flipper.className = 'flipper';
        flipper.appendChild(this.back);
        flipper.appendChild(this.front);
        flipper.setAttribute('idx', idx);
        this.flipper = flipper;

        const card = document.createElement('div');
        card.className = 'card';
        card.appendChild(flipper);
        return card;
    }

    draw(idx, container) {
        const card = this.createCardDiv(idx);
        container.appendChild(card);
    }

    flip(state) {
        if (this.state === 0) {
            this.flipper.className = 'flipper flipfront';
            this.front.style.opacity = '1';
            this.back.style.opacity = '0';

            this.state = 1;
            this.updateGlobalClick();
            this.clicksCnt++;
            this.front.childNodes[1].childNodes[0].nodeValue = this.clicksCnt;

        } else if (state === 1) {
            this.flipper.className = 'flipper flipback';
            this.front.style.opacity = '0';
            this.back.style.opacity = '1';
            this.state = 0;
        }
    }

    pulse() {
        this.flipper.className = 'flipper flipfront pulse';

        window.setTimeout(() => {
            this.flipper.parentNode.style.opacity = '0.3';
        }, 1000);
    }
}

class MemoryGame {
    constructor(evt) {
        this.evt = evt
        this.lvlNum = 0
        this.info = document.getElementById('game-info')
        this.levelCtrls = document.getElementById('levels')
        this.categoryCtrls = document.getElementById('categories')
        this.currentLvl = null
        this.levelSize = 2; // minimum number of cards
        this.updateCategory(this.categoryCtrls.childNodes[1].firstChild);
        this.updateSize(this.levelCtrls.childNodes[1].firstChild);

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

    updateSize(element, pairs) {
        for (let i = 0; i < this.levelCtrls.children.length; i++) {
            this.levelCtrls.children[i].className = ''
        }
        element.parentElement.className = 'selected';
        if (pairs)
            this.levelSize = pairs * 2;
        else
            this.levelSize = element.textContent * 2;
        this.start()
    }

    updateCategory(element, newCategory) {
        for (let i = 0; i < this.categoryCtrls.children.length; i++) {
            this.categoryCtrls.children[i].className = ''
        }
        element.parentElement.className = 'selected';
        if (newCategory)
            this.levelCategory = newCategory;
        else
            this.levelCategory = element.textContent;
        this.start()
    };
}
