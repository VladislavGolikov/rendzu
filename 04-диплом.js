const highFild=0.9;
const sizeField=15; /* поле всегда квадратное, количество клеток на стороне */
const sizeCell=Math.ceil(window.innerHeight*highFild)/sizeField;

const makeUpPadding=sizeCell*0.1+'px';
const makeUpSize=sizeCell*0.8+'px';

const beginShotX=95; /* поправка на курсор-пистолет */
const beginShotY=7; /* поправка на курсор-пистолет */

const ballDown=7; /* количество мигающих шаров под названием команд */
const betweenBall=1.6; /* это расстояние относительное */
let blindBallCount=ballDown; /* прогресс мигающих шаров */

let shotRed='<div class="shotred"></div>'; /* отображение выстрела */
let ballRed='<div class="stepred"></div>'; /* отображение красного камня */
let ballGre='<div class="stepgre"></div>'; /* отображение зеленого камня */
let cursorBlind=Math.floor(sizeField*sizeField/2)-sizeField;
/* позиция мигающего курсора (выше центра) */

let pistolActive=false; /* триггер игры рендзю*/
let myStep=false; /* триггер хода зеленой команды */
let gameRun=false; /* триггер игра идет */
let secretClik=7; /* скачков секретной кнопки до поломки */

let stones=[]; /* все камни на игровом поле */
let netology='';
let positionRed=-1; /* технич, содержит улучшенный ход ИИ */
const netologyThink=2000; /* задержка ответного хода ИИ */

let stepRedWav=new Audio('stepred.ogg');
let stepGreWav=new Audio('stepgre.wav');
let horseWav=new Audio('horse.wav');
let hurtWav=new Audio('hurt.wav');
let vinVladWav=new Audio('vinvlad.ogg');
let vinNetoWav=new Audio('vinneto.mp3');
let backMusicRen=new Audio('despacito.mp3');
let backMusicPai=new Audio('battleon.mp3');
backMusicRen.loop=true;
backMusicRen.volume=0.1;
backMusicPai.loop=true;
backMusicPai.volume=0.1;

let buttonSound=document.querySelector('.soundoff');
let buttonNewGame=document.querySelector('.begin');
let buttonNewGameRepeat=document.querySelector('.repeat');
let buttonPistol=document.querySelector('.pistol');

let allArea=document.querySelector('body');
let paintballBack=document.querySelector('body');
let rendzu=document.querySelectorAll('.rendzu');
let paintball=document.querySelectorAll('.paintball');

let secret=document.querySelector('.secret');
let secretEnd=document.querySelector('.secretend');

const vinVlad=document.querySelector('.vinvlad');
const vinNeto=document.querySelector('.vinneto');
const vinNone=document.querySelector('.vinnone');

const secretString='pistol';
let secretInput='';

const forRecordVlad=document.querySelector('.recordvlad');/* для счета в игре */
const forRecordNeto=document.querySelector('.recordneto');
let recordVlad=0;
let recordNeto=0;
if (!!window.localStorage.getItem('recordOfNeto')) {
    recordNeto=window.localStorage.getItem('recordOfNeto');
    forRecordNeto.innerHTML=recordNeto;
};
if (!!window.localStorage.getItem('recordOfVlad')){
    recordVlad=window.localStorage.getItem('recordOfVlad');
    forRecordVlad.innerHTML=recordVlad;
};
/* ------------ конец определений ------------------------ */

/* ------------ верстка ------------------------ */
let area=document.querySelector('.pole');
let insert=area.innerHTML;

area.style.width=sizeField*sizeCell+'px';
area.style.height=sizeField*sizeCell+'px';
area.style.minWidth=sizeField*sizeCell+'px';

for (i=1;i<=sizeField*sizeField-1;i++){
    area.insertAdjacentHTML('afterbegin',insert);
}

let areaCell=document.querySelectorAll('.cell');
let areaStoneRed=document.querySelectorAll('.stonered');
let areaStoneGre=document.querySelectorAll('.stonegre');
let marker=document.querySelectorAll('.romb'); /* нужны для алгоритма */
let nomer=document.querySelectorAll('.cell > .num'); /* для отладки */
for (i=0;i<=sizeField*sizeField-1;i++){
    marker[i].id='pole'+i; /* нужны для алгоритма */
    nomer[i].innerHTML=i; /* для отладки */
    areaCell[i].style.width=sizeCell+'px';
    areaCell[i].style.height=sizeCell+'px';
    areaCell[i].style.padding=sizeCell/20+'px';
    areaStoneRed[i].style.width=makeUpSize;
    areaStoneRed[i].style.height=makeUpSize;
    areaStoneRed[i].style.top=makeUpPadding;
    areaStoneRed[i].style.left=makeUpPadding;
    areaStoneGre[i].style.width=makeUpSize;
    areaStoneGre[i].style.height=makeUpSize;
    areaStoneGre[i].style.top=makeUpPadding;
    areaStoneGre[i].style.left=makeUpPadding;
}

let areaBallDownRed=document.querySelector('.neto');
let areaBallDownGre=document.querySelector('.vlad');
for (i=1;i<=ballDown;i++){
    areaBallDownRed.insertAdjacentHTML('afterbegin',ballRed);
    areaBallDownGre.insertAdjacentHTML('afterbegin',ballGre);
    let ballStyl=getComputedStyle(areaBallDownRed.firstChild);

    areaBallDownGre.firstChild.style.left=parseInt(ballStyl.left)+
    betweenBall*parseInt(ballStyl.width)*(i-1/2-ballDown/2)+'px';
    areaBallDownRed.firstChild.style.left=parseInt(ballStyl.left)+
    betweenBall*parseInt(ballStyl.width)*(i-1/2-ballDown/2)+'px';
}

let areaBallBlindRed=document.querySelectorAll('.stepred');
let areaBallBlindGre=document.querySelectorAll('.stepgre');
let order=areaBallBlindGre;
blindBall();

function blindBall() {
    if (ballDown===blindBallCount) {
        if (myStep) {order=areaBallBlindGre}else{order=areaBallBlindRed};
    }

    order[ballDown-blindBallCount].classList.remove('stepballblind');
    blindBallCount++;

    if (blindBallCount>ballDown) {
        order.forEach(function(elem,num,arr){elem.classList.add('hidd')});
        blindBallCount-=ballDown;
    }

    order[ballDown-blindBallCount].classList.remove('hidd');
    order[ballDown-blindBallCount].classList.add('stepballblind');
    order[ballDown-blindBallCount].addEventListener('animationend',blindBall,{once:true});
}

// движение строк:
setInterval(moveString,15);
let moveStringLeftRendzu=document.querySelector('.silenzium > .rendzu');
let moveStringLeftPaintball=document.querySelector('.silenzium > .paintball');
let moveStringRight=document.querySelector('.secretend');

let forMoveStringRendzu=getComputedStyle(moveStringLeftRendzu); /* начальный сдвиг строки */
let forMoveStringPaintball=getComputedStyle(moveStringLeftPaintball); /* начальный сдвиг строки */
let forMoveStringRight=getComputedStyle(moveStringRight); /* начальный сдвиг строки */

let moveStringBeginRendzu=parseInt(forMoveStringRendzu.left); /* начальный сдвиг строки */
let moveStringBeginPaintball=parseInt(forMoveStringPaintball.left); /* начальный сдвиг строки */
let moveStringBeginRight=parseInt(forMoveStringRight.left); /* начальный сдвиг строки */

let moveStringLongRendzu=moveStringLeftRendzu.innerHTML.length*parseInt(forMoveStringRendzu.fontSize)*0.69;
let moveStringLongPaintball=moveStringLeftPaintball.innerHTML.length*parseInt(forMoveStringPaintball.fontSize)*0.69;
let moveStringLongRight=moveStringRight.innerHTML.length*parseInt(forMoveStringRight.fontSize)*0.69;
/* коэффициент 0.69 выведен вручную ширина/высота шрифта... пока так */
moveStringLeftRendzu.style.width=moveStringLongRendzu+'px';
moveStringLeftPaintball.style.width=moveStringLongPaintball+'px';
moveStringRight.style.width=moveStringLongRight+'px';


function moveString() {
    if (!pistolActive) {
        let shiftLeft=parseInt(forMoveStringRendzu.left);
        if (shiftLeft<moveStringBeginRendzu-moveStringLongRendzu) {
            shiftLeft=moveStringBeginRendzu
        }else{
            shiftLeft--
        };
        moveStringLeftRendzu.style.left=shiftLeft+'px';
    }else{
        let shiftLeft=parseInt(forMoveStringPaintball.left);
        if (shiftLeft<moveStringBeginPaintball-moveStringLongPaintball) {
            shiftLeft=moveStringBeginPaintball
        }else{
            shiftLeft--
        };
        moveStringLeftPaintball.style.left=shiftLeft+'px';
    }
    if (secretClik<=0) {
        let shiftRight=parseInt(forMoveStringRight.left);
        if (shiftRight<moveStringBeginRight-moveStringLongRight) {
            shiftRight=moveStringBeginRight
        }else{
            shiftRight--
        };
        moveStringRight.style.left=shiftRight+'px';
    }
}

marker[cursorBlind].classList.add('rombblind');
/*------попап------------*/
let popUp=document.querySelector('.popup');
buttonNewGameRepeat.addEventListener('click',enterExitPopup);

function enterExitPopup(teamVin,entrance=false) {
    if (entrance) {
        if (popUp.classList.contains('hidd')) {popUp.classList.remove('hidd')};
        if (!vinVlad.classList.contains('hidd')) {vinVlad.classList.add('hidd')};
        if (!vinNeto.classList.contains('hidd')) {vinNeto.classList.add('hidd')};
        if (!vinNone.classList.contains('hidd')) {vinNone.classList.add('hidd')};
        teamVin.classList.remove('hidd');
        popUp.classList.remove('exit')
        popUp.classList.add('enter');
  //      buttonNewGameRepeat.focus(); пробел нажимает на кнопку в фокусе!!!
    }else{
        event.stopPropagation();
        popUp.classList.remove('enter');
        popUp.classList.add('exit');
        pistolOff();
        horseWav.play();
        stepRedWav.play();
        startGam();
        buttonNewGameRepeat.blur();
    }
}

/* ---------- пока спрячем цифры --- */
function hideSeekNumber(){
    nomer.forEach(function(elem,num,arr){elem.classList.toggle('hidd')})
}
/* ---------------- конец верстки ------------------------- */

/* ------------------ игра пейнтбол -------------------- */

document.addEventListener('keyup',pistol);
document.addEventListener('keydown',moveCursor);

allArea.addEventListener('click',shot);

secret.addEventListener('click',secretClick);
buttonNewGame.addEventListener('click',endGam);
buttonSound.addEventListener('click',soundOffOn);
buttonPistol.addEventListener('click',pistolYes);

buttonSound.firstElementChild.classList.toggle('hidd');

function secretClick() {
    event.stopPropagation();
    secretClik-=1;
    let topJump=60+Math.round(Math.random()*15)+'vh'; /* скачки кнопки подобраны методом тыка */
    let leftJump=Math.round(Math.random()*80)+'%'; /* скачки кнопки подобраны методом тыка */
    if (secretClik>0) {
        secret.style.top=topJump;
        secret.style.left=leftJump;
        hurtWav.play();
    }else{
        secret.classList.add('secretoutoforder');
        secretEnd.classList.remove('hidd');
        horseWav.play();
    }
}

function shot() {
    if (pistolActive){
        let shotWav=new Audio('shot.wav');
        shotWav.play();
        allArea.insertAdjacentHTML('afterbegin',shotRed);
        allArea.firstChild.style.top=event.pageY+beginShotY+'px';
        allArea.firstChild.style.left=event.pageX+beginShotX+'px';
    }else{
        stepMy();
    }
}

function pistolYes() {
    event.stopPropagation();
    popUp.classList.remove('enter');
    popUp.classList.add('exit');
    horseWav.play();
    pistolOn();
}

function pistol() { /* теперь по комбинации клавиш! */
    let currentPosition=secretInput.length;
    if (event.key==secretString.charAt(currentPosition)) {
        secretInput+=event.key;
    }else{
        secretInput=''
    };

    if (secretInput===secretString){
        secretInput='';
        if (!pistolActive) {pistolOn()}else{pistolOff()}
    }
}

function pistolOn() {
    allArea.style.cursor='url(pistol.jpg), not-allowed';
    pistolActive=true;
    secret.classList.add("hidd");
    paintball.forEach(function(elem,num,arr){elem.classList.remove('hidd')});
    rendzu.forEach(function(elem,num,arr){elem.classList.add('hidd')});
    paintballBack.classList.add("paintballback");
    if (!backMusicRen.paused) {backMusicPai.play()};
    backMusicRen.pause();
}
function pistolOff() {
    allArea.style.cursor='cell';
    pistolActive=false;
    if (secretClik>0) {secret.classList.remove("hidd")};
    rendzu.forEach(function(elem,num,arr){elem.classList.remove('hidd')});
    paintball.forEach(function(elem,num,arr){elem.classList.add('hidd')});
    paintballBack.classList.remove("paintballback");
    if (!backMusicPai.paused) {backMusicRen.play()};
    backMusicPai.pause();
}

function soundOffOn() {
    event.stopPropagation();
    buttonSound.firstElementChild.classList.toggle('hidd');
    buttonSound.lastElementChild.classList.toggle('hidd');
    buttonSound.classList.toggle('pushnot');

    if (!backMusicPai.paused||!backMusicRen.paused) {
        backMusicPai.pause();
        backMusicRen.pause();
    }else{
        if (!pistolActive) {backMusicRen.play()}else{backMusicPai.play()}
    }
}

/* ---------------------- игра рендзю -------------------------- */
startGam();

function moveCursor() {
    if (gameRun===false) {return};
    marker[cursorBlind].classList.remove('rombblind');
    switch (event.code) {
        case 'ArrowLeft': if (cursorBlind%sizeField!=0) {cursorBlind--};break;
        case 'ArrowRight': if (cursorBlind%sizeField!=sizeField-1) {cursorBlind++};break;
        case 'ArrowUp': if (cursorBlind>=sizeField) {cursorBlind-=sizeField};break;
        case 'ArrowDown': if (cursorBlind<sizeField*(sizeField-1)) {cursorBlind+=sizeField};break;
        case 'Space': stepMyNext(cursorBlind,areaStoneGre[cursorBlind]); break;
        case 'Digit1': hideSeekNumber(); break;
    }
    marker[cursorBlind].classList.add('rombblind');
}

function stepMy() {
    if (!event.target.classList.contains('romb')||myStep===false||gameRun===false) {return};
    let mesto=event.target.id;
    mesto=+mesto.slice(4,7);
    stepMyNext(mesto,event.target.nextElementSibling)
}

function stepMyNext(razbor,stepCell) {
    if (stones[razbor]==='') {stones[razbor]='stonegreen'}else{hurtWav.play();return};
    stepCell.classList.remove('hidd');
    netology=setTimeout(stepNet, netologyThink);
    stepGreWav.play();
    myStep=false;
    stopIt('stonegreen');
}

function stepNet() {
    if (myStep===true||gameRun===false) {return};
    let redStep=stones.map(function(currentValue, index, array){
        let massa=0;
        if (stones[index]==='') {massa+=1;
            if (stones[index-1]==='stonered'||stones[index-1]==='stonegreen') {massa+=1};// запад
            if (stones[index+1]==='stonered'||stones[index+1]==='stonegreen') {massa+=1};// восток
            if (stones[index-sizeField]==='stonered'||stones[index-sizeField]==='stonegreen') {massa+=1};// север
            if (stones[index+sizeField]==='stonered'||stones[index+sizeField]==='stonegreen') {massa+=1};// юг
            if (stones[index+sizeField+1]==='stonered'||stones[index+sizeField+1]==='stonegreen') {massa+=1};// юв
            if (stones[index+sizeField-1]==='stonered'||stones[index+sizeField-1]==='stonegreen') {massa+=1};// юз
            if (stones[index-sizeField-1]==='stonered'||stones[index-sizeField-1]==='stonegreen') {massa+=1};// сз
            if (stones[index-sizeField+1]==='stonered'||stones[index-sizeField+1]==='stonegreen') {massa+=1};// св
        }
        return(massa);
        })
    let razbor=0;
    redStep.forEach(function(currentValue, index, array){
    if (redStep[index]>=redStep[razbor]) {razbor=index}
    })

    /* приориет троек и четверок! */
    if (positionRed>=0&&stones[positionRed]==='') {razbor=positionRed; positionRed=-1};

    stones[razbor]='stonered';
    let stepRed=document.getElementById('pole'+razbor);
    stepRed.nextElementSibling.nextElementSibling.classList.remove('hidd');
    stepRedWav.play();
    stopIt('stonered');
    myStep=true;
}

function stopIt(ston) {

    /* проверка горизонтали */
    let longLine=0;
    for (i=0;i<=sizeField*sizeField-1;i++){
        if (i%sizeField==0) {longLine=0};
        if (stones[i]===ston) {longLine+=1; if (longLine>4) {endGam(ston)}
            if (longLine>2) {positionGod(1,longLine,i,ston)}}else{longLine=0}
    }

    /* проверка вертикали */
    longLine=0;
    let z=0;
    let diagonalShift=-1;
    for (i=0;i<=sizeField*sizeField-1;i++){
        if (i%sizeField==0) {diagonalShift+=1;longLine=0};
        z=i%sizeField*sizeField+diagonalShift;
        if (stones[z]===ston) {longLine+=1; if (longLine>4) {endGam(ston)}
            if (longLine>2) {
                let paramV=i%sizeField*sizeField+Math.floor(i/sizeField);
                positionGod(2,longLine,paramV,ston)}}else{longLine=0}
    }

    /* проверка северозапад-юговосток */
    longLine=0;
    z=0;
    diagonalShift=-1;
    for (i=0;i<=sizeField*sizeField-1;i++){
        if (i%sizeField==0) {diagonalShift+=1;longLine=0};
        z=i%sizeField*sizeField+diagonalShift+i%sizeField;
        if (stones[z]===ston) {longLine+=1; if (longLine>4) {endGam(ston)}
            if (longLine>2) {
                let paramNW=i%sizeField*sizeField+Math.floor(i/sizeField)+i%sizeField;
                positionGod(3,longLine,paramNW,ston)}}else{longLine=0}
    }

    /* проверка северовосток-югозапад */
    longLine=0;
    z=0;
    diagonalShift=-1;
    for (i=0;i<=sizeField*sizeField-1;i++){
        if (i%sizeField==0) {diagonalShift+=1;longLine=0};
        z=i%sizeField*sizeField+diagonalShift-i%sizeField;
        if (stones[z]===ston) {longLine+=1; if (longLine>4) {endGam(ston)}
            if (longLine>2) {
                let paramNO=i%sizeField*sizeField+Math.floor(i/sizeField)-i%sizeField;
                positionGod(4,longLine,paramNO,ston)}}else{longLine=0}
    }
}

function endGam(team) {
    clearTimeout(netology);
    gameRun=false;
    if (team==='stonegreen') {
        vinVladWav.play();
        recordVlad++;
        forRecordVlad.innerHTML=recordVlad;
        window.localStorage.setItem('recordOfVlad',recordVlad);
        enterExitPopup(vinVlad,true);
        return;
    };
    if (team==='stonered') {
        vinNetoWav.play();
        recordNeto++;
        forRecordNeto.innerHTML=recordNeto;
        window.localStorage.setItem('recordOfNeto',recordNeto);
        enterExitPopup(vinNeto,true);
        return;
    };
    if (team!=='stonegreen'||team!=='stonered') {
        event.stopPropagation();
        hurtWav.play();
        enterExitPopup(vinNone,true);
    };
}

function startGam() {
    let delShot=document.querySelectorAll('.shotred');
    delShot.forEach(function(elem,num,arr){elem.remove()}); /* удаление клякс */

    for (j=0;j<=sizeField*sizeField-1;j++){
        stones[j]='';
        areaStoneGre[j].classList.add('hidd');
        areaStoneRed[j].classList.add('hidd');
    }
    let firstRed=document.getElementById('pole'+Math.floor(sizeField*sizeField/2));
    firstRed.nextElementSibling.nextElementSibling.classList.remove('hidd');
    stones[Math.floor(sizeField*sizeField/2)]='stonered';
    gameRun=true;
    myStep=true;
}

function positionGod(orient,long,sell,ston) {

    if (long==3) { /* закрываем тройки */
        switch (orient) {
            case 1: /* горизонталь */
                if (stones[sell+1]==='') {positionRed=sell+1};
                if (stones[sell-long]==='') {positionRed=sell-long};
                break;
            case 2: /* вертикаль */
                if (stones[sell+sizeField]==='') {positionRed=sell+sizeField};
                if (stones[sell-sizeField*long]==='') {positionRed=sell-sizeField*long};
                break;
            case 3: /* северозапад-юговосток */
                if (stones[sell+sizeField+1]==='') {positionRed=sell+sizeField+1};
                if (stones[sell-(sizeField+1)*long]==='') {positionRed=sell-(sizeField+1)*long};
                break;
            case 4: /* северовосток-югозапад */
                if (stones[sell+sizeField-1]==='') {positionRed=sell+sizeField-1};
                if (stones[sell-(sizeField-1)*long]==='') {positionRed=sell-(sizeField-1)*long};
                break;
        }
    }

    if (long==4) { /* закрываем четверки */
        switch (orient) {
            case 1: /* горизонталь */
                if (stones[sell+1]==='') {positionRed=sell+1};
                if (stones[sell-long]==='') {positionRed=sell-long};
                break;
            case 2: /* вертикаль */
                if (stones[sell+sizeField]==='') {positionRed=sell+sizeField};
                if (stones[sell-sizeField*long]==='') {positionRed=sell-sizeField*long};
                break;
            case 3: /* северозапад-юговосток */
                if (stones[sell+sizeField+1]==='') {positionRed=sell+sizeField+1};
                if (stones[sell-(sizeField+1)*long]==='') {positionRed=sell-(sizeField+1)*long};
                break;
            case 4: /* северовосток-югозапад */
                if (stones[sell+sizeField-1]==='') {positionRed=sell+sizeField-1};
                if (stones[sell-(sizeField-1)*long]==='') {positionRed=sell-(sizeField-1)*long};
                break;
        }
    }
}
