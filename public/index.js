import Phaser from "phaser";

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
    pixelArt: false,
    antialias: true,
  },
};

const game = new Phaser.Game(config);

let flowers = [];

function preload() {
  this.load.image("flower", "assets/placeholder.png");
}

function create() {
  // spat this out with chatgpt just to see a concrete example
  // TODO we want them on the ground (not flying) and moving left to right
  // maybe multiple floor heights
  const numberOfSprites = 10;
  const screenHeight = this.sys.game.config.height;
  const screenWidth = this.sys.game.config.width;

  for (let i = 0; i < numberOfSprites; i++) {
    let x = Phaser.Math.Between(0, screenWidth);
    let y = Phaser.Math.Between(screenHeight - 100, screenHeight - 50); // Bottom of the screen
    let sprite = this.physics.add.sprite(x, y, "flower");
    sprite.setCollideWorldBounds(true);
    sprite.setBounce(1);
    sprite.setVelocity(
      Phaser.Math.Between(-100, 100),
      Phaser.Math.Between(-100, 100)
    );
    flowers.push(sprite);
  }
}

function update() {
  flowers.forEach((sprite) => {
    if (sprite.body.blocked.left || sprite.body.blocked.right) {
      sprite.setVelocityX(sprite.body.velocity.x * -1);
    }
    if (sprite.body.blocked.up || sprite.body.blocked.down) {
      sprite.setVelocityY(sprite.body.velocity.y * -1);
    }
  });
}
