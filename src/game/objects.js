game.module(
  'game.objects'
)
  .body(function () {

    game.createClass('NodNote', {
      init: function (x, y) {
        this.sprite = new game.Sprite('note.png');

        this.body = new game.Body({
          position      : {
            x: x,
            y: y
          },
          collisionGroup: 2
        });

        this.body.parent     = this;
        this.body.velocity.x = -350;
        var shape            = new game.Rectangle(40, 60);
        this.body.addShape(shape);
        game.scene.objectContainer.addChild(this.sprite);
        game.scene.world.addBody(this.body);
        game.scene.addObject(this);
      },

      kill: function () {
        game.scene.world.removeBody(this.body);
        game.scene.objectContainer.removeChild(this.sprite);
        game.scene.removeObject(this);

        var explosion = new game.Explosion(this.sprite.position.x, this.sprite.position.y);
        this.remove();

        //加分
        game.scene.addScore(1);
      },

      remove: function () {
        this.sprite.remove();
        this.body.remove();
      },

      update: function () {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        if (this.body.position.x + this.sprite.width / 2 < 0) this.remove();
      }
    });

    game.createClass('Hacker', {
      init: function (x, y) {
        this.sprite = new game.Sprite('hacker.png');

        this.body = new game.Body({
          position      : {
            x: x,
            y: y
          },
          collisionGroup: 1,
          collideAgainst: [2, 3],
        });

        //绑定碰撞方法
        this.body.collide = this.collide.bind(this);

        this.body.parent = this;
        var shape        = new game.Rectangle(74, 85);
        this.body.addShape(shape);
        game.scene.objectContainer.addChild(this.sprite);
        game.scene.world.addBody(this.body);
        game.scene.addObject(this);
      },

      remove: function () {
        game.scene.world.removeBody(this.body);
        game.scene.objectContainer.removeChild(this.sprite);
        game.scene.removeObject(this);
      },

      update: function () {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        if (this.body.position.x + this.sprite.width / 2 < 0) this.remove();
      },

      collide: function (other) {
        //如果是点头音符则判断是否正在点头
        if (other.collisionGroup === 2 && game.scene.noding) {
          other.parent.kill();
          return false;
        }

        //如果是摇头音符则判断是否正在摇头
        if (other.collisionGroup === 3 && game.scene.shaking) {
          other.parent.kill();
          return false;
        }

        return false;
      },

    });

    game.createClass('Star', {
      init: function (x, y) {
        this.sprite = new game.Sprite('star.png');
        this.sprite.anchor.set(0.5, 0.5);

        this.body = new game.Body({
          position: {
            x: x + this.sprite.width,
            y: y
          },
        });

        this.body.velocity.x = -400;
        var shape            = new game.Rectangle(this.sprite.width, this.sprite.height);
        this.body.addShape(shape);
        game.scene.objectContainer.addChild(this.sprite);
        game.scene.world.addBody(this.body);
        game.scene.addObject(this);
      },

      remove: function () {
        game.scene.world.removeBody(this.body);
        game.scene.objectContainer.removeChild(this.sprite);
        game.scene.removeObject(this);
      },

      update: function () {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        if (this.body.position.x + this.sprite.width / 2 < 0) this.remove();
      }
    });

    //音符消除爆炸
    game.createClass('Explosion', {
      init: function (x, y) {
        game.audio.playSound('explode');

        this.sprite                = new game.SpriteSheet('explosion.png', 16, 16).anim();
        this.sprite.animationSpeed = 0.3;
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(x, y);
        this.sprite.addTo(game.scene.objectContainer);
        this.sprite.loop           = false;
        this.sprite.onComplete     = this.remove.bind(this);
        this.sprite.play();
      },

      remove: function () {
        // Because of bug in Pixi, we cannot remove
        // animation right when calling onComplete (fixed on Pixi v3)
        this.sprite.visible = false;

        // Fix: Remove sprite on next frame
        game.scene.addTimer(0, function () {
          this.sprite.remove();
        }.bind(this));
      }
    });

  });
