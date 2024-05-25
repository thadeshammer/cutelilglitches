import Phaser from "phaser";

/**
 * @type {Phaser.Types.Core.GameConfig}
 */
const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
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
};

const game = new Phaser.Game(config);

let flowers = [];

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
  flowers.forEach((sprite) => {
    if (sprite.body.blocked.left || sprite.body.blocked.right) {
      sprite.setVelocityX(sprite.body.velocity.x * -1);
    }
  });
}
