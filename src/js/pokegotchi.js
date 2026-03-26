// pokegotchi.js
// Core logic for Pokegotchi game

class Pokegotchi {
  constructor(pokemon) {
    this.pokemon = pokemon;
    this.hunger = 50; // 0-100
    this.happiness = 50; // 0-100
    this.age = 0;
    this.level = 5;
    this.exp = 0;
    this.isAlive = true;
    this.interval = null;
  }

  feed() {
    if (!this.isAlive) return;
    this.hunger = Math.max(0, this.hunger - 20);
    this.happiness = Math.min(100, this.happiness + 5);
  }

  play() {
    if (!this.isAlive) return;
    this.happiness = Math.min(100, this.happiness + 15);
    this.hunger = Math.min(100, this.hunger + 10);
    this.gainExp(10);
  }

  train() {
    if (!this.isAlive) return;
    this.happiness = Math.max(0, this.happiness - 5);
    this.hunger = Math.min(100, this.hunger + 15);
    this.gainExp(20);
  }

  gainExp(amount) {
    this.exp += amount;
    while (this.exp >= this.expToNextLevel()) {
      this.exp -= this.expToNextLevel();
      this.level++;
    }
  }

  expToNextLevel() {
    return 50 + this.level * 10;
  }

  passTime() {
    if (!this.isAlive) return;
    this.hunger = Math.min(100, this.hunger + 5);
    this.happiness = Math.max(0, this.happiness - 3);
    this.age += 1;
    if (this.hunger >= 100 || this.happiness <= 0) {
      this.isAlive = false;
    }
  }

  startLife(onUpdate) {
    this.interval = setInterval(() => {
      this.passTime();
      onUpdate();
      if (!this.isAlive) clearInterval(this.interval);
    }, 3000);
  }

  stopLife() {
    if (this.interval) clearInterval(this.interval);
  }
}

// Export for use in script.js
window.Pokegotchi = Pokegotchi;
