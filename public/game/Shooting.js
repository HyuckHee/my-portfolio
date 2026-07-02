// 2023년 바닐라 JS 학습 프로젝트의 슈팅 게임 소스
// original: https://github.com/HyuckHee/HyuckHee.github.io
import Enemy from "./Enemy.js";

export default class {
    constructor(target) {
        this.target = target;
        getHtml(this.target);
        this.shootingScreen = document.querySelector('.shootingImage');
        this.enemyDiv = document.querySelector('.enemyDiv');
        this.score = target.querySelector('.score');
        this.enemyList = [];
        this.startBtn = this.target.querySelector('.startBtn');
        this.scoreDiv = this.target.querySelector('.scoreDiv');
        this.gameStart = false;
        this.stage = 1;
        this.speed = 1000;

        this.enemyMax = 20;
        this.enemyMin = 15;
        this.enemyAmount = this.enemyAmountFn();

        this.stageEle = document.querySelector('.stage');

        this.addEvent();
    }

    addEvent = () => {
        this.startBtn.addEventListener('click', () => {
            // 이전 게임 정보 초기화
            this.gameInit();
            this.startBtn.hidden = true;
            this.gameStart = true;
            // enemy 이미지 모두 제거
            this.tagClear(this.enemyDiv);

            this.render();
        });
    };

    render = (timestamp) => {
        if (!this.gameStart) {
            return;
        }

        if (this.start === undefined) {
            this.start = timestamp;
        }
        const elapsed = timestamp - this.start;

        // 스피드는 보스가 죽었을 때 업데이트 (stageUp)
        if (elapsed > this.speed) {
            this.start = timestamp;
            this.enemy = new Enemy(this.shootingScreen, timestamp, 'normal');
            this.enemyList.push(this.enemy);

            // 적군이 일정 수 생성되었을 때 보스 생성
            if (this.enemyList.length === this.enemyAmount) {
                setTimeout(() => {
                    this.enemy = new Enemy(this.shootingScreen, timestamp, 'boss');
                    this.enemyList.push(this.enemy);
                }, 500);
            }
        }

        // 적군 리스트 돌면서 시간 체크 — 제한시간 내 처치 못 하면 게임오버
        for (let i = 0; i < this.enemyList.length; i++) {
            if (this.enemyList[i].getState()) {
                if (timestamp > this.enemyList[i].timestamp) {
                    this.gameStart = false;
                    this.startBtn.hidden = false;
                }
            }
        }

        // 게임오버 / 스테이지 클리어 체크
        for (let i = 0; i < this.enemyList.length; i++) {
            if (this.enemyList[i].getState() && !this.gameStart) {
                this.enemyList[i].gameOver = true;
            }
            if (this.enemyList[i].type === 'boss' && !this.enemyList[i].getState()) {
                this.stageUp();
            }
        }

        window.requestAnimationFrame(this.render);
    };

    gameInit = () => {
        this.enemyList = [];
        this.score.innerHTML = `score : 0`;
        this.score.dataset.value = `0`;

        this.stage = 1;
        this.stageEle.innerHTML = `lv.${this.stage}`;

        this.speed = 1000;

        this.scoreDiv.style.display = 'none';
    };

    stageUp = () => {
        this.enemyList = [];
        this.target.querySelector('.enemyDiv').innerHTML = '';
        this.stage++;

        this.stageEle.innerHTML = `lv.${this.stage}`;

        this.speed = this.speed - (parseInt(`${this.speed / 100}`) * (5 * this.stage));

        this.enemyAmount = this.enemyAmountFn();
    };

    enemyAmountFn = () => {
        return parseInt(`${Math.random() * (this.enemyMax - this.enemyMin + 1) + this.enemyMin}`);
    };

    // 태그 요소 전부 삭제
    tagClear(ele) {
        while (ele.hasChildNodes()) {
            ele.removeChild(ele.firstChild);
        }
    }
}

const getHtml = (target) => {
    target.innerHTML = `<div class="main_frame">
                <div class="shootingTop"><p class="score" data-value="0">score : 0</p><p class="stage">lv.1</p></div>
                <section class="container shootingImage">
                    <div class="scoreDiv"></div>
                    <button class="startBtn"><img alt="start__button" src="img/shooting/start.svg" class="startImg"></button>
                    <div class="enemyDiv"></div>
                </section>
            </div>
                `;
};
