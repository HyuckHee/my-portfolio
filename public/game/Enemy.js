
/* 1. 생성할 요소 element
   2. 생성된 시간 timestamp
   3. type은 생성할 적 타입 nomal, boss
*/
export default class{

    constructor(target,timestamp,type){
        //target == .shootingScreen
        this.target = target

        //죽은상태인지 산상태인지 확인하는 변수
        this.state = true;
        this.hit = 1;
        this.type = type;
        //적 이미지 생성
        this.img = document.createElement('img');
        //적 타입
        if(type === 'normal') {
            //적 클래스
            this.img.classList.add('enemyImg')
            this.img.dataset.type = 'enemy';
            this.img.dataset.tier = '1';
            this.img.dataset.value = '100';
            this.hit = '1';
            this.img.src = 'img/shooting/enemy.png';

            this.timestamp = timestamp + 3000;
            //적 크기설정
            this.img.width = 80;
            this.img.height = 80;
        }else if(type === 'boss'){
            this.img.classList.add('bossImg')
            this.img.dataset.type = 'enemy';
            this.img.dataset.tier = '2';
            this.img.dataset.value = '1000';
            this.hit = '5';
            this.img.src = 'img/shooting/boss.svg';

            this.timestamp = timestamp + 5000;
            //적 크기설정
            this.img.width = 140;
            this.img.height = 140;
        }

        //이미지 positon 설정 스크린 원하는 위치에 찍어내기위해 absolute
        this.img.style.position = "absolute"

        //컨테이너 크기
        this.containerX = this.target.getBoundingClientRect().width;
        this.containerY = this.target.getBoundingClientRect().height;

        //적 생성위치
        this.x = this.randomPosition(0,this.containerX,this.img.width);
        this.y = this.randomPosition(0,this.containerY,this.img.height);


        this.img.style.left = `${this.x}px`; // 적 위치 + 게임창 x좌표 + 게임창 옆 여백
        this.img.style.top =  `${this.y}px`; // 적 위치 + 게임창 x좌표

        this.shootingSound = document.createElement('audio');
        this.shootingSound.src = 'sounds/shooting/shootSound.mp3'
        this.shootingSound.volume = 0.3;

        this.score = document.querySelector('.score');

        this.gameOver = false;
        this.draw();

        this.img.addEventListener('click',(e)=>{
            if(!this.gameOver){

                this.shootingSound.play().then(()=>{
                    this.hit -= 1;

                    if(this.hit=== 0){
                        this.state=false;
                        this.score.dataset.value = `${Number(this.score.dataset.value) + Number(this.img.dataset.value)}`
                        this.score.innerHTML = `score : ${this.score.dataset.value}`

                        e.target.remove();
                    }

                    if(e.target?.dataset.tier==='2'){
                        this.x = this.randomPosition(0,this.containerX,this.img.width);
                        this.y = this.randomPosition(0,this.containerY,this.img.height);

                        this.img.style.left = `${this.x}px`; // 적 위치 + 게임창 x좌표 + 게임창 옆 여백
                        this.img.style.top =  `${this.y}px`; // 적 위치 + 게임창 x좌표
                    }

                })
            }
        })
    }
    draw(){
        this.target.querySelector('.enemyDiv').appendChild(this.img);
    }
    getState(){
        return this.state;
    }
    /*
    * min,max 입력해서 좌표지정
    */
    randomPosition(min,max,unitSize){
        return Math.random()*(max-unitSize-min+1)+min;
    }
}