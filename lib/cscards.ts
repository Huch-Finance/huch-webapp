// CS2 Skin NFT Card Data
// These represent NFT-style card images for CS2 skins

export interface CSCard {
  id: string;
  name: string;
  weapon: string;
  skin: string;
  rarity: 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert' | 'Contraband' | 'Extraordinary';
  wear: 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';
  float: number;
  price: number;
  cardImage: string; // NFT-style card image
  originalImage: string; // Original skin image
  collection: string;
  totalQuantity: number;
  availableQuantity: number;
}

export const csCards: CSCard[] = [
  {
    id: '1',
    name: 'AWP | Dragon Lore',
    weapon: 'AWP',
    skin: 'Dragon Lore',
    rarity: 'Covert',
    wear: 'Factory New',
    float: 0.0234,
    price: 2500,
    cardImage: '/cscards.png', // NFT card format
    originalImage: '/awp.webp',
    collection: 'Cobblestone Collection',
    totalQuantity: 10,
    availableQuantity: 10,
  },
  {
    id: '2',
    name: 'Butterfly Knife | Fade',
    weapon: 'Butterfly Knife',
    skin: 'Fade',
    rarity: 'Covert',
    wear: 'Minimal Wear',
    float: 0.1267,
    price: 1800,
    cardImage: '/cscards.png', // NFT card format
    originalImage: '/btknife.png',
    collection: 'Knife Collection',
    totalQuantity: 15,
    availableQuantity: 15,
  },
  {
    id: '3',
    name: 'AK-47 | Redline',
    weapon: 'AK-47',
    skin: 'Redline',
    rarity: 'Classified',
    wear: 'Field-Tested',
    float: 0.2834,
    price: 120,
    cardImage: '/cscards.png', // NFT card format
    originalImage: '/ak47-redline.png',
    collection: 'Phoenix Collection',
    totalQuantity: 25,
    availableQuantity: 25,
  },
  {
    id: '4',
    name: 'M4A4 | Howl',
    weapon: 'M4A4',
    skin: 'Howl',
    rarity: 'Contraband',
    wear: 'Well-Worn',
    float: 0.4125,
    price: 3200,
    cardImage: '/cscards.png', // NFT card format
    originalImage: '/M4A4.png',
    collection: 'Huntsman Collection',
    totalQuantity: 5,
    availableQuantity: 5,
  },
  {
    id: '5',
    name: 'Karambit | Doppler',
    weapon: 'Karambit',
    skin: 'Doppler',
    rarity: 'Covert',
    wear: 'Factory New',
    float: 0.0098,
    price: 1200,
    cardImage: '/cscards.png', // NFT card format
    originalImage: '/karambit.webp',
    collection: 'Knife Collection',
    totalQuantity: 20,
    availableQuantity: 9,
  },
  {
    id: '6',
    name: 'Sport Gloves | Pandora\'s Box',
    weapon: 'Sport Gloves',
    skin: 'Pandora\'s Box',
    rarity: 'Extraordinary',
    wear: 'Battle-Scarred',
    float: 0.7654,
    price: 800,
    cardImage: '/cscards.png', // NFT card format
    originalImage: '/gloves.webp',
    collection: 'Glove Collection',
    totalQuantity: 12,
    availableQuantity: 7,
  },
  {
    id: '7',
    name: 'Desert Eagle | Blaze',
    weapon: 'Desert Eagle',
    skin: 'Blaze',
    rarity: 'Restricted',
    wear: 'Factory New',
    float: 0.0156,
    price: 450,
    cardImage: '/cscards.png', // NFT card format
    originalImage: '/deagle-blaze.webp',
    collection: 'Mirage Collection',
    totalQuantity: 30,
    availableQuantity: 22,
  },
  {
    id: '8',
    name: 'Glock-18 | Fade',
    weapon: 'Glock-18',
    skin: 'Fade',
    rarity: 'Restricted',
    wear: 'Factory New',
    float: 0.0089,
    price: 650,
    cardImage: '/cscards.png', // NFT card format
    originalImage: '/glock-fade.webp',
    collection: 'Dust Collection',
    totalQuantity: 18,
    availableQuantity: 14,
  },
];

// Utility functions
export const getCardById = (id: string): CSCard | undefined => {
  return csCards.find(card => card.id === id);
};

export const getTopCardsByPrice = (count: number = 4): CSCard[] => {
  return [...csCards]
    .sort((a, b) => b.price - a.price)
    .slice(0, count);
};

export const getCardsByRarity = (rarity: CSCard['rarity']): CSCard[] => {
  return csCards.filter(card => card.rarity === rarity);
};

export const getTotalTVL = (): number => {
  return csCards.reduce((sum, card) => sum + (card.price * card.availableQuantity), 0);
};