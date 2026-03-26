// pokegotchi.js — Optimized pet lifecycle and stat system

class Pokegotchi {
  static UPDATE_INTERVAL_MS = 3000;
  static HUNGER_RATE = 5;
  static HAPPINESS_DECAY = 3;

  constructor(pokemon) {
    Object.assign(this, {
      pokemon,
      hunger: 50,
      happiness: 50,
      age: 0,
      level: 5,
      exp: 0,
      isAlive: true,
      _tickInterval: null
    });
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
    this.hunger = Math.min(100, this.hunger + 5);
    this.happiness = Math.max(0, this.happiness - 5);
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
    this.hunger = Math.min(100, this.hunger + Pokegotchi.HUNGER_RATE);
    this.happiness = Math.max(0, this.happiness - Pokegotchi.HAPPINESS_DECAY);
    this.age++;
    if (this.hunger >= 100 || this.happiness <= 0) this.die();
  }

  die() {
    this.isAlive = false;
    this.stopLife();
  }

  startLife(onUpdate) {
    this.stopLife();
    this._tickInterval = setInterval(() => {
      this.passTime();
      onUpdate?.();
    }, Pokegotchi.UPDATE_INTERVAL_MS);
  }

  stopLife() {
    if (this._tickInterval) {
      clearInterval(this._tickInterval);
      this._tickInterval = null;
    }
  }
}

window.Pokegotchi = Pokegotchi;
