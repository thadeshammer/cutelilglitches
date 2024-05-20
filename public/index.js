import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
};

const game = new Phaser.Game(config);

let player;
const speed = 160;

function preload() {
  this.load.image("background", "assets/background.png"); // Corrected background path
  this.load.image("player", "assets/sprite.png"); // Corrected sprite path
}

function create() {
  this.add.image(400, 300, "background");

  player = this.physics.add.sprite(400, 300, "player");

  this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (this.cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(speed);
  } else {
    player.setVelocityX(0);
  }

  if (this.cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (this.cursors.down.isDown) {
    player.setVelocityY(speed);
  } else {
    player.setVelocityY(0);
  }
}
