//曲谱
var songNotes = {
  18 : 1,
  36 : 1,
  55 : 1,
  74 : 1,
  94 : 1,
  103: 1,
  111: 1,
  121: 1,
  131: 1,
  141: 1,
  150: 1,
  153: 1,
  155: 1,
  158: 1,
  169: 1,
  177: 1,
  187: 1,
  197: 1,
  207: 1,
  215: 1,
  225: 1,
  227: 1,
  229: 1,
  231: 1,
  234: 1,
  244: 1,
  254: 1,
  264: 1,
  273: 1,
  285: 1,
  295: 1,
  306: 1,
  311: 1,
  322: 1,
  333: 1,
  340: 1,
  348: 1,
  360: 1,
  370: 1,
  377: 1,
  379: 1,
  381: 1,
  382: 1,
  384: 1,
  386: 1,
  395: 1,
  405: 1,
  //414: 1,
  //424: 1,
  //433: 1,
  //443: 1,
  //452: 1,
  //462: 1,
  //471: 1,
  //480: 1,
  //490: 1,
  //500: 1,
  //508: 1,
  //510: 1,
  //513: 1,
  //515: 1,
  //517: 1,
  //522: 1,
  //527: 1,
  //536: 1,
  //546: 1,
  //556: 1,
  //565: 1,
};

//帧数
var frame = 10;

var resetFrame = 24;

//全局分数
var score = 0;

var lastNoding = 0;

var lastShaking = 0;

//用户精彩头像
var savedImage;


//头部移动检测封装
(function () {
  var lastX = 0, lastY = 0, upCount = 0, downCount = 0, leftCount = 0, rightCount = 0;

  var ignoreX = 4;
  var ignoreY = 4;

  function clear () {
    upCount    = 0;
    downCount  = 0;
    leftCount  = 0;
    rightCount = 0;
  }

  function fadeOut (value, much) {
    var returnValue = value - (much ? much : 1);
    return returnValue > 0 ? returnValue : 0;
  }

  function check () {
    if (leftCount > 3 && rightCount > 3) {
      shaking();
      clear();
    } else if (downCount > 2 && upCount > 2) {
      noding();
      clear();
    }
  }

  document.addEventListener("headtrackingEvent", function (e) {
    var currentX = e.x * 11;
    var currentY = e.y * 10;

    var xMove = Math.abs(currentX - lastX);
    var yMove = Math.abs(currentY - lastY);

    //忽略较小的移动
    if (xMove > ignoreX) {
      if (currentX > lastX) {
        //right
        rightCount += 3;
        check();
        leftCount = fadeOut(leftCount);
      } else {
        //left
        leftCount += 3;
        check();
        rightCount = fadeOut(rightCount);
      }

      upCount   = fadeOut(upCount, 1);
      downCount = fadeOut(downCount, 1);

      yMove--;
    }

    if (yMove > ignoreY) {
      if (currentY > lastY) {
        //down
        downCount += 3;
        check();
        upCount = fadeOut(upCount);
      } else {
        //up
        upCount += 3;
        check();
        downCount = fadeOut(downCount);
      }
      rightCount = fadeOut(rightCount, 1);
      leftCount  = fadeOut(leftCount, 1);
    }

    lastX = currentX;
    lastY = currentY;

  }, false);

  function takeScreenshot () {
    var ctx    = document.getElementById('inputCanvas').getContext('2d');
    savedImage = ctx.getImageData(0, 0, 200, 160);
  }

  function noding () {
    takeScreenshot();

    console.log('noding');
    lastNoding = Date.parse(new Date());
  }

  function shaking () {
    takeScreenshot();

    console.log('shaking');
    lastShaking = Date.parse(new Date());
  }
})();


game.module(
  'game.main'
)
  .require(
  'game.assets',
  'game.objects'
)
  .body(function () {

    //开始画面
    game.createScene('Main', {
      backgroundColor: 0x697bb1,
      animationSpeed : 0.1,

      init: function () {
        //标题
        //var titleSprite = new game.Sprite('start_title.png', 0, 0);
        var titleSprite            = new game.SpriteSheet('start_title.png', 174, 100).anim();
        titleSprite.position.set(115, 30);
        titleSprite.animationSpeed = 0.2;
        titleSprite.loop           = true;
        titleSprite.play();
        this.addObject(titleSprite);
        this.stage.addChild(titleSprite);

        //开始游戏提示
        var noticeSprite = new game.Sprite('start_notice.png', 0, 0);
        this.addObject(noticeSprite);
        this.stage.addChild(noticeSprite);

        this.world    = new game.World(0, 2000);
        var floorBody = new game.Body({
          position      : {
            x: game.system.width / 2,
            y: game.system.height - 40
          },
          collisionGroup: 1
        });

        var floorShape = new game.Rectangle(game.system.width, 50);
        floorBody.addShape(floorShape);
        this.world.addBody(floorBody);

        this.objectContainer = new game.Container().addTo(this.stage);

        //检测游戏开始
        this.addTimer(10, this.updateMovement.bind(this), true);

        //随机
        this.addTimer(400, this.spawnRandomObject.bind(this), true);
      },

      //产生随机物体
      spawnRandomObject: function () {
        var rand = Math.random();
        if (rand < 0.9) {
          var star = new game.Star(game.system.width, Math.random() * 400);
        }
      },

      updateMovement: function () {
        var currentTimestamp = Date.parse(new Date());

        if ((currentTimestamp - lastShaking) < 200) {
          game.audio.playSound('confirm');
          game.system.setScene('Game');
        }
      },

    });

    //结束画面
    game.createScene('End', {
      backgroundColor: 0x697bb1,

      init: function () {
        game.audio.stopMusic();

        //分数
        this.scoreText = new game.BitmapText('', { font: 'Cartoon' });
        this.scoreText.position.set(125, 60);
        this.scoreText.setText('Score: ' + score.toString());
        this.stage.addChild(this.scoreText);

        //开始游戏提示
        var noticeSprite = new game.Sprite('end_notice.png', 0, 0);
        this.addObject(noticeSprite);
        this.stage.addChild(noticeSprite);

        this.world    = new game.World(0, 2000);
        var floorBody = new game.Body({
          position      : {
            x: game.system.width / 2,
            y: game.system.height - 40
          },
          collisionGroup: 1
        });

        var floorShape = new game.Rectangle(game.system.width, 50);
        floorBody.addShape(floorShape);
        this.world.addBody(floorBody);

        this.objectContainer = new game.Container().addTo(this.stage);

        //检测游戏开始
        this.addTimer(10, this.updateMovement.bind(this), true);

        //随机
        this.addTimer(400, this.spawnRandomObject.bind(this), true);

        //保存精彩图片
        setTimeout(function () {
          var gameCanvas = document.getElementById('canvas');
          var gameCtx = gameCanvas.getContext('2d');
          var gameScreen = gameCtx.getImageData(0, 0, gameCanvas.width, gameCanvas.height);

          var tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = 600;
          tmpCanvas.height = 400;
          var tmpCtx = tmpCanvas.getContext('2d');
          tmpCtx.putImageData(gameScreen, 0, 0);
          tmpCtx.putImageData(savedImage, 100, 100);
          var imgDataUrl = tmpCanvas.toDataURL('image/png');
          window.location.href = imgDataUrl;
        }, 60);

      },

      spawnRandomObject: function () {
        var rand = Math.random();
        if (rand < 0.7) {
          var star = new game.Star(game.system.width, Math.random() * 400);
        }
      },

      updateMovement: function () {
        var currentTimestamp = Date.parse(new Date());

        if ((currentTimestamp - lastShaking) < 200) {
          game.audio.playSound('confirm');
          game.system.setScene('Game');
        }
      },

    });

    //游戏画面
    game.createScene('Game', {
      backgroundColor: 0x466588,
      //是否在点头
      noding         : false,
      //是否在摇头
      shaking        : false,

      init: function () {
        //分数重置
        score = 0;
        //重置帧
        frame = resetFrame;

        this.world = new game.World(0, 2000);

        var floorBody = new game.Body({
          position      : {
            x: game.system.width / 2,
            y: game.system.height - 40
          },
          collisionGroup: 1
        });

        var floorShape = new game.Rectangle(game.system.width, 50);
        floorBody.addShape(floorShape);
        this.world.addBody(floorBody);

        //背景
        var bg = new game.Sprite('01_sky_moon.png').addTo(this.stage);

        //卷动背景
        this.addParallax('04_city.png', 150, 220);

        this.objectContainer = new game.Container().addTo(this.stage);

        //分数
        this.scoreText = new game.BitmapText('', { font: 'Cartoon' });
        this.scoreText.position.set(10, 10);
        this.addScore(0);
        this.stage.addChild(this.scoreText);

        //黑客
        var hacker = new game.Hacker(10, 130);

        //播放音乐
        game.audio.playMusic('song', false);

        //定时检测动作
        this.addTimer(30, this.updateMovement.bind(this), true);

        //定时产生音符
        this.addTimer(100, this.spawnNote.bind(this), true);

      },

      addScore: function (amount) {
        score += amount;
        this.scoreText.setText('SCORE: ' + score.toString());
      },

      //动作检测
      updateMovement: function () {
        var currentTimestamp = Date.parse(new Date());

        this.noding  = (currentTimestamp - lastNoding) < 160;
        this.shaking = (currentTimestamp - lastShaking) < 160;
      },

      //生成音符
      spawnNote: function () {
        //帧数增加
        frame++;

        //如果需要生成音符
        if (songNotes.hasOwnProperty(frame)) {
          var note = new game.NodNote(game.system.width, 150);
        }

        //如果结束了
        if (frame == 410) {
          game.system.setScene('End');
        }

      },

      addParallax: function (texture, pos, speed) {
        var sprite        = new game.TilingSprite(texture, game.system.width);
        sprite.speed.x    = speed;
        sprite.position.y = game.system.height - sprite.height;
        this.addObject(sprite);
        this.stage.addChild(sprite);
      },

    });

  });
