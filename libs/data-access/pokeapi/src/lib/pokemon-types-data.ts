import type { PokemonType } from '@scdevelop/models';

/**
 * Static Pokemon type mappings for Generation 1 (1-151)
 * This allows us to display types in list views without fetching individual Pokemon
 * Source: Official Pokemon data
 */
export const POKEMON_TYPES: Record<number, PokemonType[]> = {
  1: ['grass', 'poison'],     // Bulbasaur
  2: ['grass', 'poison'],     // Ivysaur
  3: ['grass', 'poison'],     // Venusaur
  4: ['fire'],                // Charmander
  5: ['fire'],                // Charmeleon
  6: ['fire', 'flying'],      // Charizard
  7: ['water'],               // Squirtle
  8: ['water'],               // Wartortle
  9: ['water'],               // Blastoise
  10: ['bug'],                // Caterpie
  11: ['bug'],                // Metapod
  12: ['bug', 'flying'],      // Butterfree
  13: ['bug', 'poison'],      // Weedle
  14: ['bug', 'poison'],      // Kakuna
  15: ['bug', 'poison'],      // Beedrill
  16: ['normal', 'flying'],   // Pidgey
  17: ['normal', 'flying'],   // Pidgeotto
  18: ['normal', 'flying'],   // Pidgeot
  19: ['normal'],             // Rattata
  20: ['normal'],             // Raticate
  21: ['normal', 'flying'],   // Spearow
  22: ['normal', 'flying'],   // Fearow
  23: ['poison'],             // Ekans
  24: ['poison'],             // Arbok
  25: ['electric'],           // Pikachu
  26: ['electric'],           // Raichu
  27: ['ground'],             // Sandshrew
  28: ['ground'],             // Sandslash
  29: ['poison'],             // Nidoran♀
  30: ['poison'],             // Nidorina
  31: ['poison', 'ground'],   // Nidoqueen
  32: ['poison'],             // Nidoran♂
  33: ['poison'],             // Nidorino
  34: ['poison', 'ground'],   // Nidoking
  35: ['fairy'],              // Clefairy
  36: ['fairy'],              // Clefable
  37: ['fire'],               // Vulpix
  38: ['fire'],               // Ninetales
  39: ['normal', 'fairy'],    // Jigglypuff
  40: ['normal', 'fairy'],    // Wigglytuff
  41: ['poison', 'flying'],   // Zubat
  42: ['poison', 'flying'],   // Golbat
  43: ['grass', 'poison'],    // Oddish
  44: ['grass', 'poison'],    // Gloom
  45: ['grass', 'poison'],    // Vileplume
  46: ['bug', 'grass'],       // Paras
  47: ['bug', 'grass'],       // Parasect
  48: ['bug', 'poison'],      // Venonat
  49: ['bug', 'poison'],      // Venomoth
  50: ['ground'],             // Diglett
  51: ['ground'],             // Dugtrio
  52: ['normal'],             // Meowth
  53: ['normal'],             // Persian
  54: ['water'],              // Psyduck
  55: ['water'],              // Golduck
  56: ['fighting'],           // Mankey
  57: ['fighting'],           // Primeape
  58: ['fire'],               // Growlithe
  59: ['fire'],               // Arcanine
  60: ['water'],              // Poliwag
  61: ['water'],              // Poliwhirl
  62: ['water', 'fighting'],  // Poliwrath
  63: ['psychic'],            // Abra
  64: ['psychic'],            // Kadabra
  65: ['psychic'],            // Alakazam
  66: ['fighting'],           // Machop
  67: ['fighting'],           // Machoke
  68: ['fighting'],           // Machamp
  69: ['grass', 'poison'],    // Bellsprout
  70: ['grass', 'poison'],    // Weepinbell
  71: ['grass', 'poison'],    // Victreebel
  72: ['water', 'poison'],    // Tentacool
  73: ['water', 'poison'],    // Tentacruel
  74: ['rock', 'ground'],     // Geodude
  75: ['rock', 'ground'],     // Graveler
  76: ['rock', 'ground'],     // Golem
  77: ['fire'],               // Ponyta
  78: ['fire'],               // Rapidash
  79: ['water', 'psychic'],   // Slowpoke
  80: ['water', 'psychic'],   // Slowbro
  81: ['electric', 'steel'],  // Magnemite
  82: ['electric', 'steel'],  // Magneton
  83: ['normal', 'flying'],   // Farfetch'd
  84: ['normal', 'flying'],   // Doduo
  85: ['normal', 'flying'],   // Dodrio
  86: ['water'],              // Seel
  87: ['water', 'ice'],       // Dewgong
  88: ['poison'],             // Grimer
  89: ['poison'],             // Muk
  90: ['water'],              // Shellder
  91: ['water', 'ice'],       // Cloyster
  92: ['ghost', 'poison'],    // Gastly
  93: ['ghost', 'poison'],    // Haunter
  94: ['ghost', 'poison'],    // Gengar
  95: ['rock', 'ground'],     // Onix
  96: ['psychic'],            // Drowzee
  97: ['psychic'],            // Hypno
  98: ['water'],              // Krabby
  99: ['water'],              // Kingler
  100: ['electric'],          // Voltorb
  101: ['electric'],          // Electrode
  102: ['grass', 'psychic'],  // Exeggcute
  103: ['grass', 'psychic'],  // Exeggutor
  104: ['ground'],            // Cubone
  105: ['ground'],            // Marowak
  106: ['fighting'],          // Hitmonlee
  107: ['fighting'],          // Hitmonchan
  108: ['normal'],            // Lickitung
  109: ['poison'],            // Koffing
  110: ['poison'],            // Weezing
  111: ['ground', 'rock'],    // Rhyhorn
  112: ['ground', 'rock'],    // Rhydon
  113: ['normal'],            // Chansey
  114: ['grass'],             // Tangela
  115: ['normal'],            // Kangaskhan
  116: ['water'],             // Horsea
  117: ['water'],             // Seadra
  118: ['water'],             // Goldeen
  119: ['water'],             // Seaking
  120: ['water'],             // Staryu
  121: ['water', 'psychic'],  // Starmie
  122: ['psychic', 'fairy'],  // Mr. Mime
  123: ['bug', 'flying'],     // Scyther
  124: ['ice', 'psychic'],    // Jynx
  125: ['electric'],          // Electabuzz
  126: ['fire'],              // Magmar
  127: ['bug'],               // Pinsir
  128: ['normal'],            // Tauros
  129: ['water'],             // Magikarp
  130: ['water', 'flying'],   // Gyarados
  131: ['water', 'ice'],      // Lapras
  132: ['normal'],            // Ditto
  133: ['normal'],            // Eevee
  134: ['water'],             // Vaporeon
  135: ['electric'],          // Jolteon
  136: ['fire'],              // Flareon
  137: ['normal'],            // Porygon
  138: ['rock', 'water'],     // Omanyte
  139: ['rock', 'water'],     // Omastar
  140: ['rock', 'water'],     // Kabuto
  141: ['rock', 'water'],     // Kabutops
  142: ['rock', 'flying'],    // Aerodactyl
  143: ['normal'],            // Snorlax
  144: ['ice', 'flying'],     // Articuno
  145: ['electric', 'flying'], // Zapdos
  146: ['fire', 'flying'],    // Moltres
  147: ['dragon'],            // Dratini
  148: ['dragon'],            // Dragonair
  149: ['dragon', 'flying'],  // Dragonite
  150: ['psychic'],           // Mewtwo
  151: ['psychic'],           // Mew
};

/**
 * Get types for a Pokemon by ID, fallback to ['normal'] if unknown
 */
export function getPokemonTypes(id: number): PokemonType[] {
  return POKEMON_TYPES[id] || ['normal'];
}
