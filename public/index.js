/**
 * @type {Phaser.Types.Core.GameConfig}
 */
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  audio: {
    noAudio: true,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  backgroundColor: "rgba(0,0,0,0)",
  transparent: true,
  fps: {
    target: 30,
    forceSetTimeOut: true,
  },
};

const game = new Phaser.Game(config);

let flowers = [];

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

function preload() {
  this.load.image("flower", "assets/flower_v1_transparency.png");
}

function create() {
  const numberOfSprites = 10;
  const screenHeight = this.sys.game.config.height;
  const screenWidth = this.sys.game.config.width;

  for (let i = 0; i < numberOfSprites; i++) {
    /**
     * @type {Phaser.Physics.Arcade.Sprite}
     */
    let sprite = this.physics.add.sprite(0, 0, "flower");
    let x = Phaser.Math.Between(0, screenWidth);
    let height_offset = screenHeight - sprite.height;
    let y = Phaser.Math.Between(height_offset - 60, height_offset - 20);
    sprite.setPosition(x, y);
    sprite.setCollideWorldBounds(true);
    sprite.setScale(3.0, 3.0);
    sprite.setBounce(1);
    sprite.setVelocity(Phaser.Math.Between(-100, 0), 0);
    flowers.push(sprite);
  }
}

function update() {
  const screenWidth = this.sys.game.config.width;

  flowers.forEach((sprite) => {
    if (sprite.x <= 0 + sprite.width / 2) {
      sprite.x = sprite.width / 2; // Reposition within bounds
      sprite.setVelocityX(Math.abs(sprite.body.velocity.x)); // Ensure positive velocity
    } else if (sprite.x >= screenWidth - sprite.width / 2) {
      sprite.x = screenWidth - sprite.width / 2; // Reposition within bounds
      sprite.setVelocityX(-Math.abs(sprite.body.velocity.x)); // Ensure negative velocity
    }
  });
}
