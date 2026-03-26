// pokemon-data.js
// Basic Pokémon data for Pokegotchi

const POKEMON_LIST = [
  {
    id: 1,
    name: "Bulbasaur",
    normal: "src/img/pokemon/apng/normal/1.apng",
    shiny: "src/img/pokemon/apng/shiny/1.apng",
    types: [
      { name: "Grass", color: "green", icon: "src/img/types/12.png" },
      { name: "Poison", color: "purple", icon: "src/img/types/4.png" }
    ],
    description:
      "Bulbasaur can be seen napping in bright sunlight. There is a seed on its back. By soaking up the sun's rays, the seed grows progressively larger.",
    evolvesTo: 2,
    evolveLevel: 16
  },
  {
    id: 2,
    name: "Ivysaur",
    normal: "src/img/pokemon/apng/normal/2.apng",
    shiny: "src/img/pokemon/apng/shiny/2.apng",
    types: [
      { name: "Grass", color: "green", icon: "src/img/types/12.png" },
      { name: "Poison", color: "purple", icon: "src/img/types/4.png" }
    ],
    description:
      "To support its bulb, Ivysaur's legs grow sturdy. If it spends more time lying in the sunlight, the bud will soon bloom into a large flower.",
    evolvesTo: 3,
    evolveLevel: 32
  },
  {
    id: 3,
    name: "Venusaur",
    normal: "src/img/pokemon/apng/normal/3.apng",
    shiny: "src/img/pokemon/apng/shiny/3.apng",
    types: [
      { name: "Grass", color: "green", icon: "src/img/types/12.png" },
      { name: "Poison", color: "purple", icon: "src/img/types/4.png" }
    ],
    description:
      "Venusaur's flower is said to take on vivid colors if it gets plenty of nutrition and sunlight. The flower's aroma soothes the emotions of people.",
    evolvesTo: null,
    evolveLevel: null
  },
  {
    id: 4,
    name: "Charmander",
    normal: "src/img/pokemon/apng/normal/4.apng",
    shiny: "src/img/pokemon/apng/shiny/4.apng",
    types: [{ name: "Fire", color: "orange", icon: "src/img/types/10.png" }],
    description:
      "The flame that burns at the tip of its tail is an indication of its emotions. The flame wavers when Charmander is happy, and blazes when it is enraged.",
    evolvesTo: 5,
    evolveLevel: 16
  },
  {
    id: 5,
    name: "Charmeleon",
    normal: "src/img/pokemon/apng/normal/5.apng",
    shiny: "src/img/pokemon/apng/shiny/5.apng",
    types: [{ name: "Fire", color: "orange", icon: "src/img/types/10.png" }],
    description:
      "Without pity, its sharp claws destroy foes. If it encounters a strong enemy, it becomes agitated, and the flame on its tail flares with a bluish white color.",
    evolvesTo: 6,
    evolveLevel: 36
  },
  {
    id: 6,
    name: "Charizard",
    normal: "src/img/pokemon/apng/normal/6.apng",
    shiny: "src/img/pokemon/apng/shiny/6.apng",
    types: [
      { name: "Fire", color: "orange", icon: "src/img/types/10.png" },
      { name: "Flying", color: "#91b0ff", icon: "src/img/types/3.png" }
    ],
    description:
      "A Charizard flies about in search of strong opponents. It breathes intense flames that can melt any material. However, it will never torch a weaker foe.",
    evolvesTo: null,
    evolveLevel: null
  },
  {
    id: 7,
    name: "Squirtle",
    normal: "src/img/pokemon/apng/normal/7.apng",
    shiny: "src/img/pokemon/apng/shiny/7.apng",
    types: [{ name: "Water", color: "skyblue", icon: "src/img/types/11.png" }],
    description:
      "Its shell is not just for protection. Its rounded shape and the grooves on its surface minimize resistance in water, enabling Squirtle to swim at high speeds.",
    evolvesTo: 8,
    evolveLevel: 16
  },
  {
    id: 8,
    name: "Wartortle",
    normal: "src/img/pokemon/apng/normal/8.apng",
    shiny: "src/img/pokemon/apng/shiny/8.apng",
    types: [{ name: "Water", color: "skyblue", icon: "src/img/types/11.png" }],
    description:
      "Its large tail is covered with rich, thick fur that deepens in color with age. The scratches on its shell are evidence of this Pokémon's toughness in battle.",
    evolvesTo: 9,
    evolveLevel: 36
  },
  {
    id: 9,
    name: "Blastoise",
    normal: "src/img/pokemon/apng/normal/9.apng",
    shiny: "src/img/pokemon/apng/shiny/9.apng",
    types: [{ name: "Water", color: "skyblue", icon: "src/img/types/11.png" }],
    description:
      "The waterspouts that protrude from its shell are highly accurate. Their bullets of water can precisely nail tin cans from a distance of over 160 feet.",
    evolvesTo: null,
    evolveLevel: null
  }
];

window.POKEMON_LIST = POKEMON_LIST;
